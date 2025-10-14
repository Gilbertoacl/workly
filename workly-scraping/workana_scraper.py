"""
Workly - Scraper híbrido (Selenium) para Workana (categoria TI/Programação)
- Uso:
    python main.py --linguagem java
    python main.py            # busca todas as vagas TI (modo padrão)
"""

import os
import time
import re
import csv
import hashlib
import logging
import requests
from datetime import datetime
from typing import List, Tuple
from urllib.parse import urlparse, urlunparse

from dotenv import load_dotenv
from selenium import webdriver
from selenium.common.exceptions import (
    NoSuchElementException, TimeoutException, WebDriverException, StaleElementReferenceException
)
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

import psycopg2
from psycopg2.extras import execute_values

# -----------------------
# Config & Environment
# -----------------------
BASE_DIR = os.path.dirname(__file__)
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=env_path, override=True)

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT", "5432"),
}

# URLs
URL_TEMPLATE = "https://www.workana.com/jobs?category=it-programming&language=pt&publication=1d&query={query}"
URL_ALL_TI = "https://www.workana.com/jobs?category=it-programming&language=pt&publication=1d"

# Defaults
CSV_FILENAME = "projetos_workana.csv"
LOG_FILE = "workana_scraper.log"
ERROR_LOG = "workana_scraper_errors.log"
DEFAULT_USD_TO_BRL = 5.60
DEFAULT_MAX_SCROLL_ATTEMPTS = 15
DEFAULT_WAIT_SHORT = 2
DEFAULT_WAIT_MED = 4
DEFAULT_WAIT_LONG = 8
COTACAO_CACHE = os.path.join(BASE_DIR, "usd_brl_cache.txt")
CACHE_TTL_SECONDS = 3600  # 1 hora

# Headless forced (per your request)
FORCE_HEADLESS = True

# -----------------------
# Logging
# -----------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("workly-scraper")

# -----------------------
# Utilities
# -----------------------
def normalize_value(value, target_type="str"):
    """Normalize/convert values safely. Returns None when value is empty/non-convertible."""
    if value in ("", None, "None", "null"):
        return None
    try:
        if target_type == "int":
            # extract digits
            if isinstance(value, str):
                m = re.search(r"\d+", value)
                if not m:
                    return None
                return int(m.group(0))
            return int(value)
        elif target_type == "float":
            if isinstance(value, str):
                # remove currency symbols and whitespace
                v = re.sub(r"[^\d\.,-]", "", value).strip()
                if not v:
                    return None
                # normalize comma decimal
                v = v.replace(".", "").replace(",", ".") if v.count(",") and v.count(".") == 0 else v.replace(",", "")
                return float(v)
            return float(value)
        elif target_type == "str":
            return str(value).strip()
    except (ValueError, TypeError):
        return None
    return value

def normalize_url_for_hash(url: str) -> str:
    """Remove query/fragment and trailing slash, lowercase host."""
    if not url:
        return ""
    parsed = urlparse(url)
    scheme = parsed.scheme or "https"
    netloc = parsed.netloc.lower()
    path = parsed.path.rstrip("/") or "/"
    clean = urlunparse((scheme, netloc, path, "", "", ""))
    return clean

def generate_link_hash(link: str) -> str:
    clean = normalize_url_for_hash(link)
    return hashlib.sha256(clean.encode("utf-8")).hexdigest()

def get_cached_usd_brl():
    try:
        if os.path.exists(COTACAO_CACHE):
            with open(COTACAO_CACHE, "r", encoding="utf-8") as f:
                ts, rate = f.read().split(",")
                if (time.time() - float(ts)) < CACHE_TTL_SECONDS:
                    return float(rate)
    except Exception:
        pass
    return None

def set_cached_usd_brl(rate: float):
    try:
        with open(COTACAO_CACHE, "w", encoding="utf-8") as f:
            f.write(f"{time.time()},{rate}")
    except Exception:
        pass

def get_usd_brl_rate(timeout: int = 6) -> float:
    """Tries multiple sources and caches rate for CACHE_TTL_SECONDS."""
    cached = get_cached_usd_brl()
    if cached:
        logger.info("[COTAÇÃO] Usando cotação em cache: 1 USD = %s BRL", cached)
        return cached

    # Try AwesomeAPI
    try:
        r = requests.get("https://economia.awesomeapi.com.br/json/last/USD-BRL", timeout=timeout)
        rate = float(r.json()["USDBRL"]["bid"])
        logger.info("[COTAÇÃO] AwesomeAPI: 1 USD = %s BRL", rate)
        set_cached_usd_brl(rate)
        return rate
    except Exception:
        logger.debug("AwesomeAPI falhou; tentando Frankfurter...")

    try:
        r = requests.get("https://api.frankfurter.app/latest?from=USD&to=BRL", timeout=timeout)
        rate = float(r.json()["rates"]["BRL"])
        logger.info("[COTAÇÃO] Frankfurter: 1 USD = %s BRL", rate)
        set_cached_usd_brl(rate)
        return rate
    except Exception:
        logger.warning("APIs de câmbio falharam; usando fallback.")

    logger.info("[COTAÇÃO] Usando fallback fixo: 1 USD = %s BRL", DEFAULT_USD_TO_BRL)
    set_cached_usd_brl(DEFAULT_USD_TO_BRL)
    return DEFAULT_USD_TO_BRL

# -----------------------
# Selenium driver setup
# -----------------------
def setup_driver(headless: bool = True):
    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--log-level=3")
    # Optional: reduce load by disabling images (uncomment if needed)
    # prefs = {"profile.managed_default_content_settings.images": 2}
    # options.add_experimental_option("prefs", prefs)
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

# -----------------------
# Scraper helpers
# -----------------------
def safe_find_text(el, selectors: List[str]) -> str:
    for sel in selectors:
        try:
            items = el.find_elements(By.CSS_SELECTOR, sel)
            if items:
                text = items[0].text.strip()
                if text:
                    return text
        except Exception:
            continue
    return ""

def tratar_orcamento(orcamento_texto: str):
    """Retorna (moeda, minimo, maximo, texto_normalizado)"""
    if not orcamento_texto:
        return "DESCONHECIDO", None, None, ""
    texto = orcamento_texto.upper().strip()
    texto = re.sub(r"/\s*HORA", "", texto)
    texto = re.sub(r"\s*POR\s*HORA", "", texto)
    texto = texto.replace("POR HORA", "")
    texto = texto.strip()
    moeda = "DESCONHECIDO"
    if "US$" in texto or texto.startswith("USD") or "USD " in texto:
        moeda = "USD"
    elif "R$" in texto or texto.startswith("BRL") or "BRL " in texto:
        moeda = "BRL"
    valores = re.sub(r"(US\$|USD|R\$|BRL)", "", texto).strip()
    numeros = re.findall(r"[\d\.,]+", valores)
    try:
        numeros = [float(n.replace(".", "").replace(",", ".")) for n in numeros]
    except Exception:
        numeros = []
    minimo = maximo = None
    if len(numeros) == 1:
        minimo = numeros[0]
    elif len(numeros) >= 2:
        minimo, maximo = numeros[0], numeros[1]
    return moeda, minimo, maximo, texto

def open_link_in_new_tab_and_get_budget(driver, link: str, wait_seconds=3) -> str:
    if not link:
        return ""
    if link.startswith("/"):
        link = "https://www.workana.com" + link
    driver.execute_script("window.open('');")
    driver.switch_to.window(driver.window_handles[-1])
    try:
        driver.get(link)
        try:
            WebDriverWait(driver, wait_seconds).until(
                lambda d: d.find_elements(By.CSS_SELECTOR, "h4.budget, div.project-actions h4.budget")
            )
        except TimeoutException:
            pass
        detail_selectors = [
            "h4.budget span.values span",
            "h4.budget .values span",
            "h4.budget",
            "div.project-actions h4.budget",
            "div.project-header h4.budget",
        ]
        for sel in detail_selectors:
            try:
                elems = driver.find_elements(By.CSS_SELECTOR, sel)
                if elems:
                    text = elems[0].text.strip()
                    if text:
                        return text
            except Exception:
                continue
        possibles = driver.find_elements(By.XPATH, "//*[contains(text(),'R$') or contains(text(),'US$') or contains(text(),'USD')]")
        for p in possibles:
            t = p.text.strip()
            if t and len(t) < 120 and (("R$" in t) or ("USD" in t) or ("US$" in t)):
                return t
        return ""
    finally:
        driver.close()
        driver.switch_to.window(driver.window_handles[0])

def get_full_description_and_skills(driver, card, link: str) -> Tuple[str, str]:
    descricao = ""
    habilidades = []
    initial_desc = safe_find_text(card, ["div.html-desc.project-details p", "div.project-details p", ".project-body p", "p"])

    try:
        ver_link = None
        for sel in ["a.link.small", "a.link.link-small", "a.link"]:
            try:
                candidate = card.find_element(By.CSS_SELECTOR, sel)
                if candidate and candidate.text and "ver" in candidate.text.lower():
                    ver_link = candidate
                    break
            except NoSuchElementException:
                continue
        if ver_link:
            try:
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", ver_link)
                ver_link.click()
            except Exception:
                try:
                    driver.execute_script("arguments[0].click();", ver_link)
                except Exception:
                    pass
            try:
                WebDriverWait(driver, DEFAULT_WAIT_SHORT).until(
                    lambda d: len(card.find_elements(By.CSS_SELECTOR, "div.html-desc.project-details p span")) > 0
                )
            except TimeoutException:
                pass
            spans = card.find_elements(By.CSS_SELECTOR, "div.html-desc.project-details p span")
            if spans:
                descricao = " ".join([s.text.strip() for s in spans if s.text.strip()])
    except Exception:
        logger.debug("Não foi possível expandir via card (seguindo para fallback).")

    if not descricao:
        descricao = initial_desc

    # Captura inicial de skills no card
    try:
        skills_elems = card.find_elements(By.CSS_SELECTOR, ".project-skills a, .project-skills span, div.skills a, div.skills span")
        habilidades = [s.text.strip() for s in skills_elems if s.text.strip()]
    except Exception:
        habilidades = []

    # Se faltarem dados, tenta abrir a página detalhada
    need_detail = not descricao or len(descricao) < 80 or not habilidades
    if need_detail and link:
        if link.startswith("/"):
            link = "https://www.workana.com" + link
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[-1])
        try:
            driver.get(link)
            try:
                WebDriverWait(driver, DEFAULT_WAIT_LONG).until(
                    lambda d: d.find_elements(By.CSS_SELECTOR, "div.html-desc, section.project-description, div.project-details")
                )
            except TimeoutException:
                pass

            # Descrição detalhada
            for sel in ["div#project-detail div.html-desc p", "section.project-description p", "div.project-details p", ".project-description p"]:
                elems = driver.find_elements(By.CSS_SELECTOR, sel)
                if elems:
                    descricao = " ".join([e.text.strip() for e in elems if e.text.strip()])
                    break

            # Skills detalhadas
            for sel in ["div#project-detail div.skills a", "section.project-skills a", "div.skills a", ".skills a"]:
                elems = driver.find_elements(By.CSS_SELECTOR, sel)
                if elems:
                    habilidades = [e.text.strip() for e in elems if e.text.strip()]
                    break
        except Exception as e:
            logger.debug("Falha ao abrir detalhe da vaga: %s", e)
        finally:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])

    habilidades_str = " | ".join(habilidades) if habilidades else ""
    return (descricao or "").strip(), habilidades_str.strip()


def scroll_until_end(driver, max_attempts: int = DEFAULT_MAX_SCROLL_ATTEMPTS, pause: float = 2.5) -> bool:
    attempts = 0
    last_height = driver.execute_script("return document.body.scrollHeight")
    while attempts < max_attempts:
        attempts += 1
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(pause)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            return True
        last_height = new_height
    return False

def match_languages(projeto: dict, languages: List[str]) -> bool:
    if not languages:
        return True
    text = " ".join([
        projeto.get("Título", ""),
        projeto.get("Descrição", ""),
        projeto.get("Habilidades", "")
    ]).lower()
    for lang in languages:
        if lang.lower() in text:
            return True
    return False

# -----------------------
# Database persistence
# -----------------------
def save_to_db(conn, projetos: List[dict]):
    """
    Salva os projetos em lote. Recebe uma conexão (reutilizada).
    Usa ON CONFLICT (link_hash) DO UPDATE para manter dados atualizados.
    """
    if not projetos:
        logger.info("Nenhum projeto para salvar no banco.")
        return

    rows = []
    for p in projetos:
        link = normalize_value(p.get("Link"), "str")
        link_hash = generate_link_hash(link or "")
        rows.append((
            "workana",
            normalize_value(p.get("Título"), "str"),
            link,
            link_hash,
            normalize_value(p.get("Descrição"), "str"),
            normalize_value(p.get("Habilidades"), "str"),
            normalize_value(p.get("Orçamento Original"), "str"),
            normalize_value(p.get("Mínimo (BRL)"), "float"),
            normalize_value(p.get("Máximo (BRL)"), "float"),
            normalize_value(p.get("Propostas"), "int"),
            normalize_value(p.get("Metodo"), "str"),
            datetime.utcnow(),
        ))

    sql = """
    INSERT INTO scraped_jobs
    (source, title, link, link_hash, description, skills, original_budget,
     min_budget, max_budget, proposals, conversion_method, scraped_at)
    VALUES %s
    ON CONFLICT (link_hash) DO UPDATE
      SET title = EXCLUDED.title,
          description = EXCLUDED.description,
          skills = EXCLUDED.skills,
          original_budget = EXCLUDED.original_budget,
          min_budget = EXCLUDED.min_budget,
          max_budget = EXCLUDED.max_budget,
          proposals = EXCLUDED.proposals,
          conversion_method = EXCLUDED.conversion_method,
          scraped_at = CURRENT_TIMESTAMP
    ;
    """

    cur = conn.cursor()
    try:
        execute_values(cur, sql, rows, template=None, page_size=50)
        conn.commit()
        logger.info("Dados salvos/atualizados no banco (registros: %d).", len(rows))
    except Exception as e:
        conn.rollback()
        logger.exception("Erro ao salvar no banco: %s", e)
        # also write simple error file
        with open(ERROR_LOG, "a", encoding="utf-8") as fe:
            fe.write(f"{datetime.utcnow().isoformat()} DB_SAVE_ERROR: {repr(e)}\n")
    finally:
        cur.close()

# -----------------------
# Main scraper flow
# -----------------------
def scrape_workana(language: str = None, max_scrolls: int = DEFAULT_MAX_SCROLL_ATTEMPTS):
    """
    Retorna a lista de projetos coletados (lista de dicts).
    """
    # choose URL
    if language:
        q = "+".join(language.split())
        url = URL_TEMPLATE.format(query=q)
    else:
        url = URL_ALL_TI

    logger.info("Iniciando scraping. Linguagem: %s", language or "TODAS (TI)")
    usd_to_brl = get_usd_brl_rate()
    driver = None
    projetos = []

    try:
        driver = setup_driver(headless=FORCE_HEADLESS)
        driver.get(url)
        try:
            WebDriverWait(driver, DEFAULT_WAIT_MED).until(lambda d: d.find_elements(By.CSS_SELECTOR, "div.project-item"))
        except TimeoutException:
            logger.warning("Timeout aguardando cards; continuando mesmo assim.")

        scrolled = scroll_until_end(driver, max_attempts=max_scrolls)
        if not scrolled:
            logger.info("Scroll atingiu limite de tentativas (MAX=%d).", max_scrolls)

        cards = driver.find_elements(By.CSS_SELECTOR, "div.project-item")
        logger.info("Cards visíveis encontrados: %d", len(cards))

        for idx, card in enumerate(cards, start=1):
            try:
                # title + link (robust fallbacks)
                titulo = ""
                link_elem = None
                for sel in ["h2.project-title a", "h2.h3.project-title a", "h2 a"]:
                    elems = card.find_elements(By.CSS_SELECTOR, sel)
                    if elems:
                        link_elem = elems[0]
                        span_elems = elems[0].find_elements(By.TAG_NAME, "span")
                        if span_elems:
                            titulo = span_elems[0].get_attribute("title") or span_elems[0].text.strip()
                        else:
                            titulo = elems[0].text.strip()
                        break
                link = link_elem.get_attribute("href") if link_elem is not None else ""

                descricao, habilidades = get_full_description_and_skills(driver, card, link)

                # orçamento (listagem)
                orcamento_texto = safe_find_text(card, ["h4.budget span.values span", "h4.budget .values span", "h4.budget", ".budget"])
                moeda, minimo, maximo, _ = tratar_orcamento(orcamento_texto)

                metodo = "listagem"
                minimo_brl = maximo_brl = None

                if moeda == "USD" and link:
                    try:
                        detalhe_orc = open_link_in_new_tab_and_get_budget(driver, link)
                        if detalhe_orc:
                            moeda_det, min_det, max_det, _ = tratar_orcamento(detalhe_orc)
                            if moeda_det == "BRL" and (min_det is not None):
                                minimo_brl, maximo_brl = min_det, max_det
                                orcamento_texto = detalhe_orc
                                moeda = moeda_det
                                metodo = "detail_page_BRL"
                            else:
                                metodo = "convert_api"
                                if minimo is not None:
                                    minimo_brl = round(minimo * usd_to_brl, 2)
                                if maximo is not None:
                                    maximo_brl = round(maximo * usd_to_brl, 2)
                        else:
                            metodo = "convert_api"
                            if minimo is not None:
                                minimo_brl = round(minimo * usd_to_brl, 2)
                            if maximo is not None:
                                maximo_brl = round(maximo * usd_to_brl, 2)
                    except Exception:
                        metodo = "convert_api_error_fallback"
                        if minimo is not None:
                            minimo_brl = round(minimo * usd_to_brl, 2)
                        if maximo is not None:
                            maximo_brl = round(maximo * usd_to_brl, 2)

                elif moeda == "BRL":
                    minimo_brl, maximo_brl = minimo, maximo
                    metodo = "listagem_BRL"
                else:
                    if link:
                        try:
                            detalhe_orc = open_link_in_new_tab_and_get_budget(driver, link)
                            moeda_det, min_det, max_det, _ = tratar_orcamento(detalhe_orc)
                            if moeda_det == "BRL":
                                moeda = moeda_det
                                minimo, maximo = min_det, max_det
                                minimo_brl, maximo_brl = min_det, max_det
                                orcamento_texto = detalhe_orc
                                metodo = "detail_page_BRL_unknown"
                        except Exception:
                            pass

                propostas = safe_find_text(card, ["div.project-main-details span.bids", "span.bids", ".bids"])

                projeto = {
                    "Título": titulo,
                    "Link": link,
                    "Descrição": descricao,
                    "Habilidades": habilidades,
                    "Orçamento Original": orcamento_texto,
                    "Mínimo (BRL)": minimo_brl,
                    "Máximo (BRL)": maximo_brl,
                    "Propostas": propostas,
                    "Metodo": metodo
                }

                projetos.append(projeto)

            except Exception as e:
                with open(ERROR_LOG, "a", encoding="utf-8") as fe:
                    fe.write(f"{datetime.utcnow().isoformat()} ERROR processing card index={idx}: {repr(e)}\n")
                logger.exception("Erro ao processar card index=%s: %s", idx, e)
                continue

    except WebDriverException as e:
        logger.exception("Erro com WebDriver: %s", e)
    finally:
        try:
            if driver:
                driver.quit()
        except Exception:
            pass

    return projetos

# -----------------------
# Main
# -----------------------
def main():
    import argparse
    parser = argparse.ArgumentParser(description="Workly - Scraper híbrido Workana (TI/Programação)")
    parser.add_argument("--linguagem", "-l", type=str, help="Linguagem para filtrar (ex: java, python). Se omitido, busca todas as vagas de TI.")
    parser.add_argument("--max-scroll", type=int, default=DEFAULT_MAX_SCROLL_ATTEMPTS, help="Máximo de tentativas de scroll para carregar a lista.")
    args = parser.parse_args()

    language = args.linguagem
    max_scrolls = args.max_scroll

    logger.info("Iniciando scraper Workana (headless forced: %s).", FORCE_HEADLESS)
    if language:
        logger.info("Modo filtrado: buscando vagas relacionadas a: %s", language)
    else:
        logger.info("Modo padrão: coletando todas as vagas da categoria TI e Programação.")

    # Scrape
    projetos = scrape_workana(language=language, max_scrolls=max_scrolls)
    logger.info("Scraping finalizado — total coletado: %d", len(projetos))

    if not projetos:
        logger.info("Nenhum projeto coletado. Encerrando.")
        return

    # Deduplicate by normalized link (first occurrence kept)
    dedup = []
    seen = set()
    for p in projetos:
        link = normalize_value(p.get("Link"), "str") or ""
        clean = normalize_url_for_hash(link)
        if clean not in seen:
            seen.add(clean)
            dedup.append(p)
    projetos = dedup
    logger.info("Após deduplicação: %d projetos", len(projetos))

    # Persist to DB (open single connection)
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        save_to_db(conn, projetos)
    except Exception as e:
        logger.exception("Erro ao conectar/salvar no DB: %s", e)
        # fallback: save CSV for inspection
        try:
            save_csv(projetos, CSV_FILENAME)
            logger.info("Fallback: salvei CSV com registros coletados.")
        except Exception as ex:
            logger.exception("Falha ao salvar CSV de fallback: %s", ex)
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

    logger.info("Execução finalizada.")

if __name__ == "__main__":
    main()
