import argparse
import csv
import logging
import re
import time
from datetime import datetime
from typing import List, Tuple

import requests
from selenium import webdriver
from selenium.common.exceptions import (
    NoSuchElementException, TimeoutException, WebDriverException
)
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

import os
import psycopg2
import hashlib
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "dbname": "dbworkly",
    "user": os.getenv("DB_USER_POSTGRES"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST_POST"),
    "port": os.getenv("DB_PORT_POST")
}

# ====== Configuração base ======
URL_TEMPLATE = "https://www.workana.com/jobs?category=it-programming&language=pt&publication=1d&query={query}"
# Por compatibilidade com a versão antiga: se preferir buscar sem query, use:
URL_ALL_TI = "https://www.workana.com/jobs?category=it-programming&language=pt&publication=1d"
CSV_FILENAME = "projetos_workana.csv"
LOG_FILE = "scraper.log"
ERROR_LOG = "scraper_errors.log"
DEFAULT_USD_TO_BRL = 5.60

# Config padrão (pode ser alterado por flags)
DEFAULT_MAX_SCROLL_ATTEMPTS = 15
DEFAULT_HEADLESS = True
DEFAULT_WAIT_SHORT = 2  # espera curta em segundos
DEFAULT_WAIT_MED = 4
DEFAULT_WAIT_LONG = 8


# ====== Logging ======
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("workly-scraper")


# ====== Helpers ======
def setup_driver(headless: bool = True):
    options = webdriver.ChromeOptions()
    if headless:
        # headless novo (Chrome 109+)
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--log-level=3")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver


def get_usd_brl_rate(timeout: int = 6) -> float:
    """Tenta AwesomeAPI -> Frankfurter -> fallback"""
    try:
        r = requests.get("https://economia.awesomeapi.com.br/json/last/USD-BRL", timeout=timeout)
        data = r.json()
        rate = float(data["USDBRL"]["bid"])
        logger.info(f"[COTAÇÃO] AwesomeAPI: 1 USD = {rate} BRL")
        return rate
    except Exception:
        logger.debug("AwesomeAPI falhou; tentando Frankfurter...")

    try:
        r = requests.get("https://api.frankfurter.app/latest?from=USD&to=BRL", timeout=timeout)
        data = r.json()
        rate = float(data["rates"]["BRL"])
        logger.info(f"[COTAÇÃO] Frankfurter: 1 USD = {rate} BRL")
        return rate
    except Exception:
        logger.warning("APIs de câmbio falharam; usando fallback.")

    logger.info(f"[COTAÇÃO] Usando fallback fixo: 1 USD = {DEFAULT_USD_TO_BRL} BRL")
    return DEFAULT_USD_TO_BRL


def safe_find_text(el, selectors: List[str]) -> str:
    """Tenta sequencialmente uma lista de seletores CSS retornando o primeiro texto válido."""
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
    """Extrai moeda, mínimo e máximo de um texto de orçamento."""
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
    """Abre o link em nova aba, tenta extrair orçamento e fecha a aba."""
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
    """
    Tenta expandir 'Ver mais' no card e retornar (descricao, habilidades).
    Se não obtiver a descrição/habilidades completas, abre o detalhe da vaga.
    """
    descricao = ""
    habilidades = ""

    # Captura descrição curta
    initial_desc = safe_find_text(card, ["div.html-desc.project-details p", "div.project-details p", ".project-body p", "p"])

    # Tenta clicar "Ver mais" dentro do card
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
            except Exception:
                pass

            try:
                ver_link.click()
            except Exception:
                try:
                    driver.execute_script("arguments[0].click();", ver_link)
                except Exception:
                    pass

            # espera curto pela presença de spans (texto expandido)
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
        # não fatal, vamos seguir para fallback
        logger.debug("Não foi possível expandir via card (seguindo para fallback se necessário).")

    if not descricao:
        descricao = safe_find_text(card, ["div.html-desc.project-details p", "div.project-details p", ".project-body p", "p"])

    habilidades = safe_find_text(card, ["div.skills", "div.skills a.skill h3", ".skills", ".tags"])

    # decide se precisa abrir a página de detalhe
    need_detail = False
    if not descricao or "ver mais" in descricao.lower() or len(descricao) < 80:
        need_detail = True
    if not habilidades:
        need_detail = True

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

            detail_desc_selectors = [
                "div#project-detail div.html-desc p",
                "section.project-description p",
                "div.project-details p",
                ".project-description p",
                ".project-description"
            ]
            found = False
            for sel in detail_desc_selectors:
                try:
                    elems = driver.find_elements(By.CSS_SELECTOR, sel)
                    if elems:
                        descricao = " ".join([e.text.strip() for e in elems if e.text.strip()])
                        found = True
                        break
                except Exception:
                    continue
            if not found:
                try:
                    main = driver.find_element(By.CSS_SELECTOR, "div.html-desc.project-details")
                    descricao = main.text.strip()
                except Exception:
                    pass

            detail_skill_selectors = [
                "div#project-detail div.skills a",
                "section.project-skills a",
                "div.skills a",
                ".skills a",
            ]
            for sel in detail_skill_selectors:
                try:
                    elems = driver.find_elements(By.CSS_SELECTOR, sel)
                    if elems:
                        habilidades = ", ".join([e.text.strip() for e in elems if e.text.strip()])
                        break
                except Exception:
                    continue
        except Exception as e:
            logger.debug("Falha ao abrir detalhe da vaga: %s", e)
        finally:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])

    return (descricao or "").strip(), (habilidades or "").strip()


def scroll_until_end(driver, max_attempts: int = DEFAULT_MAX_SCROLL_ATTEMPTS, pause: float = 2.5) -> bool:
    """Rola até o fim da página, até max_attempts. Retorna True se chegou ao fim naturalmente."""
    attempts = 0
    while attempts < max_attempts:
        attempts += 1
        last_height = driver.execute_script("return document.body.scrollHeight")
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(pause)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            return True
    return False


def match_languages(projeto: dict, languages: List[str]) -> bool:
    """
    Verifica se o projeto contém qualquer uma das languages (case-insensitive)
    nos campos título, descrição ou habilidades.
    """
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

def normalize_value(value, target_type="str"):
    """
    Normaliza e converte valores para o tipo desejado.
    Evita erros de tipo (ex: '' para int) e retorna None quando apropriado.

    target_type pode ser:
      - "int": converte para inteiro ou retorna None
      - "float": converte para float ou retorna None
      - "str": retorna string ou None se vazia
    """
    if value in ("", None, "None", "null"):
        return None

    try:
        if target_type == "int":
            return int(value)
        elif target_type == "float":
            return float(value)
        elif target_type == "str":
            return str(value).strip()
    except (ValueError, TypeError):
        return None

    return value


def generate_link_hash(link: str) -> str:
    """Gera um hash SHA-256 único para o link."""
    return hashlib.sha256(link.encode("utf-8")).hexdigest()

def save_to_db(projetos: List[dict]):
    if not projetos:
        logger.warning("Nenhum projeto para salvar no banco.")
        return

    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        inserted = 0

        for p in projetos:
            link = normalize_value(p.get("Link"))
            link_hash = generate_link_hash(link)

            cur.execute(
                """
                INSERT INTO scraped_jobs (
                    source, title, link, link_hash, description, skills,
                    original_budget, min_budget, max_budget, proposals,
                    conversion_method
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (link_hash) DO NOTHING;
                """,
                (
                    "workana",
                    normalize_value(p.get("Título")),
                    link,
                    link_hash,
                    normalize_value(p.get("Descrição")),
                    normalize_value(p.get("Habilidades")),
                    normalize_value(p.get("Orçamento Original")),
                    normalize_value(p.get("Mínimo (BRL)"), "float"),
                    normalize_value(p.get("Máximo (BRL)"), "float"),
                    normalize_value(p.get("Propostas"), "int"),
                    normalize_value(p.get("Metodo")),
                ),
            )
            inserted += 1

        conn.commit()
        cur.close()
        logger.info("Dados inseridos com sucesso no banco (%d registros processados).", inserted)

    except Exception as e:
        logger.exception("Erro ao inserir dados no banco: %s", e)
    finally:
        if conn:
            conn.close()

def save_csv(projetos: List[dict], filename: str = CSV_FILENAME):
    if not projetos:
        logger.warning("Nenhum projeto para salvar.")
        return
    fieldnames = list(projetos[0].keys())
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(projetos)
    logger.info("CSV salvo: %s (registros: %d)", filename, len(projetos))


# ====== Main ======
def main():
    parser = argparse.ArgumentParser(description="Workly - Scraper híbrido Workana (TI/Programação)")
    parser.add_argument("--linguagem", "-l", nargs="+", help="Linguagem(s) para filtrar (ex: java python). Se omitido, busca todas as vagas de TI.")
    parser.add_argument("--max-scroll", type=int, default=DEFAULT_MAX_SCROLL_ATTEMPTS, help="Máximo de tentativas de scroll para carregar a lista.")
    parser.add_argument("--out", type=str, default=CSV_FILENAME, help="Arquivo CSV de saída")
    args = parser.parse_args()

    languages = args.linguagem or []
    max_scrolls = args.max_scroll
    out_file = args.out

    logger.info("Iniciando scraper Workana (modo headless: %s).", DEFAULT_HEADLESS)
    if languages:
        logger.info("Modo filtrado: buscando vagas relacionadas a: %s", ", ".join(languages))
    else:
        logger.info("Modo padrão: coletando todas as vagas da categoria TI e Programação.")

    driver = None
    projetos = []
    usd_to_brl = get_usd_brl_rate()

    try:
        driver = setup_driver(headless=DEFAULT_HEADLESS)
        # Seleciona a URL: se houver languages, usa query para tentar priorizar resultados (opcional)
        if languages:
            # faz query com as primeiras languages concatenadas (para priorizar)
            q = "+".join(languages)
            url = URL_TEMPLATE.format(query=q)
        else:
            url = URL_ALL_TI

        driver.get(url)
        try:
            WebDriverWait(driver, DEFAULT_WAIT_MED).until(lambda d: d.find_elements(By.CSS_SELECTOR, "div.project-item"))
        except TimeoutException:
            logger.warning("Timeout aguardando cards; continuando mesmo assim.")

        # scroll até o fim (limitado)
        scrolled = scroll_until_end(driver, max_attempts=max_scrolls)
        if not scrolled:
            logger.info("Scroll atingiu limite de tentativas (MAX=%d).", max_scrolls)

        cards = driver.find_elements(By.CSS_SELECTOR, "div.project-item")
        logger.info("Cards visíveis encontrados: %d", len(cards))

        for idx, card in enumerate(cards, start=1):
            try:
                # título + link
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

                # descrição + habilidades
                descricao, habilidades = get_full_description_and_skills(driver, card, link)

                # orçamento
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
                # registra erro mas continua
                with open(ERROR_LOG, "a", encoding="utf-8") as fe:
                    fe.write(f"{datetime.utcnow().isoformat()} ERROR processing card index={idx}: {repr(e)}\n")
                logger.exception("Erro ao processar card index=%s: %s", idx, e)
                continue

        # fecha driver
        try:
            driver.quit()
        except Exception:
            pass
        driver = None

        # Filtra por linguagens se fornecidas (opção híbrida)
        if languages:
            filtered = [p for p in projetos if match_languages(p, languages)]
            logger.info("Filtragem por linguagem(s) resultou em %d projetos (de %d coletados).", len(filtered), len(projetos))
            projetos = filtered

        # remove duplicatas por Link (mantém o primeiro)
        seen = set()
        dedup = []
        for p in projetos:
            link = p.get("Link") or ""
            if link not in seen:
                seen.add(link)
                dedup.append(p)
        projetos = dedup

        # salva CSV
        # save_csv(projetos, out_file)
       
        # salva no banco
        save_to_db(projetos)


        logger.info("Execução finalizada. Projetos capturados: %d", len(projetos))

    except WebDriverException as e:
        logger.exception("Erro com o WebDriver: %s", e)
    except Exception as e:
        logger.exception("Erro inesperado: %s", e)
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass


if __name__ == "__main__":
    main()
