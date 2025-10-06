# main_clean.py
import time
import csv
import re
import logging
from datetime import datetime
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException, StaleElementReferenceException,
    NoSuchElementException, WebDriverException
)

# ====== Configurações ======
URL = "https://www.workana.com/jobs?category=it-programming&language=pt&publication=1d&query=java"
MAX_SCROLL_ATTEMPTS = 15          # limite para rolar até o fim
USE_HEADLESS = True               # roda sempre em segundo plano (conforme solicitado)
DEFAULT_USD_TO_BRL = 5.60         # fallback se APIs de câmbio falharem
CSV_FILENAME = "projetos_workana.csv"
LOG_FILE = "scraper.log"

# ====== Logging ======
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("workana-scraper")


# ====== Helpers ======
def setup_driver(headless=True):
    options = webdriver.ChromeOptions()
    if headless:
        # headless novo (Chrome 109+)
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
    # reduz logs desnecessários
    options.add_argument("--disable-gpu")
    options.add_argument("--log-level=3")
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)


def get_usd_brl_rate():
    """Tenta AwesomeAPI -> Frankfurter -> fallback"""
    try:
        r = requests.get("https://economia.awesomeapi.com.br/json/last/USD-BRL", timeout=6)
        data = r.json()
        rate = float(data["USDBRL"]["bid"])
        logger.info(f"[COTAÇÃO] AwesomeAPI: 1 USD = {rate} BRL")
        return rate
    except Exception:
        logger.warning("⚠️ AwesomeAPI falhou; tentando Frankfurter...")

    try:
        r = requests.get("https://api.frankfurter.app/latest?from=USD&to=BRL", timeout=6)
        data = r.json()
        rate = float(data["rates"]["BRL"])
        logger.info(f"[COTAÇÃO] Frankfurter: 1 USD = {rate} BRL")
        return rate
    except Exception:
        logger.warning("⚠️ Frankfurter falhou; usando fallback.")

    logger.info(f"[COTAÇÃO] Usando fallback fixo: 1 USD = {DEFAULT_USD_TO_BRL} BRL")
    return DEFAULT_USD_TO_BRL


def safe_find_text(el, selectors):
    """Tenta uma lista de seletores CSS dentro do elemento el e retorna o texto do primeiro que existir."""
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
    """Extrai moeda, mínimo, máximo e texto normalizado a partir de um texto de orçamento."""
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
    numeros = [float(n.replace(".", "").replace(",", ".")) for n in numeros]

    minimo = maximo = None
    if len(numeros) == 1:
        minimo = numeros[0]
    elif len(numeros) >= 2:
        minimo, maximo = numeros[0], numeros[1]

    return moeda, minimo, maximo, texto


def open_link_in_new_tab_and_get_budget(driver, link, wait_seconds=3):
    """Abre link em nova aba, tenta extrair o orçamento exibido na página de detalhe e fecha a aba."""
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


def get_full_description_and_skills(driver, card, link):
    """
    Retorna (descricao, habilidades).
    1) Tenta expandir "Ver mais" no próprio card (com clique e espera)
    2) Se não der certo, abre a página de detalhe e extrai descrição e habilidades.
    """
    descricao = ""
    habilidades = ""

    # Captura descrição curta inicialmente
    initial_desc = safe_find_text(card, ["div.html-desc.project-details p", "div.project-details p", ".project-body p", "p"])

    # Tenta encontrar e clicar em "Ver mais" dentro do card
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

            # espera breve para garantir re-render
            try:
                WebDriverWait(driver, 3).until(
                    lambda d: len(card.find_elements(By.CSS_SELECTOR, "div.html-desc.project-details p span")) > 0
                )
            except TimeoutException:
                # não expandiu visivelmente, segue para fallback
                pass

            spans = card.find_elements(By.CSS_SELECTOR, "div.html-desc.project-details p span")
            if spans:
                descricao = " ".join([s.text.strip() for s in spans if s.text.strip()])

    except Exception:
        # falha ao tentar expandir no card: segue adiante
        pass

    # se não conseguiu a descrição expandida, pega a curta
    if not descricao:
        descricao = safe_find_text(card, ["div.html-desc.project-details p", "div.project-details p", ".project-body p", "p"])

    # tenta obter habilidades na listagem
    habilidades = safe_find_text(card, ["div.skills", "div.skills a.skill h3", ".skills", ".tags"])

    # Verifica se precisa abrir página de detalhe
    need_detail = False
    if not descricao or "ver mais" in descricao.lower() or len(descricao) < 80:
        need_detail = True
    if not habilidades:
        need_detail = True

    if need_detail and link:
        # abre detalhe em nova aba
        if link.startswith("/"):
            link = "https://www.workana.com" + link
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[-1])
        try:
            driver.get(link)
            try:
                WebDriverWait(driver, 6).until(
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

        finally:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])

    return (descricao or "").strip(), (habilidades or "").strip()


def scroll_until_end(driver, max_attempts=MAX_SCROLL_ATTEMPTS, pause=2.5):
    """Rola a página até não carregar mais conteúdo ou até atingir max_attempts."""
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


def main():
    driver = None
    try:
        logger.info("Iniciando scraper Workana (headless=%s)", USE_HEADLESS)
        driver = setup_driver(headless=USE_HEADLESS)
        driver.get(URL)

        # aguarda página inicial carregar (um timeout curto)
        try:
            WebDriverWait(driver, 6).until(lambda d: d.find_elements(By.CSS_SELECTOR, "div.project-item"))
        except TimeoutException:
            logger.warning("Timeout ao esperar por cards na listagem. Continuando...")

        # rolar até o fim (com limite)
        scrolled = scroll_until_end(driver)
        if not scrolled:
            logger.info("Scroll atingiu limite de tentativas (limitado por MAX_SCROLL_ATTEMPTS).")

        cards = driver.find_elements(By.CSS_SELECTOR, "div.project-item")
        logger.info("Encontrados %d cards (visíveis) na listagem.", len(cards))

        usd_to_brl = get_usd_brl_rate()
        projetos = []

        for idx, card in enumerate(cards, start=1):
            try:
                # título + link (fallbacks)
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

                # orçamento e conversão
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

                projetos.append({
                    "Título": titulo,
                    "Link": link,
                    "Descrição": descricao,
                    "Habilidades": habilidades,
                    "Orçamento Original": orcamento_texto,
                    "Mínimo (BRL)": minimo_brl,
                    "Máximo (BRL)": maximo_brl,
                    "Propostas": propostas,
                    "Metodo": metodo
                })
            except Exception as e:
                logger.exception("Erro ao processar card index=%s: %s", idx, e)
                continue

        # finaliza o driver
        driver.quit()
        driver = None

        # salvar CSV (se houver projetos)
        if projetos:
            fieldnames = list(projetos[0].keys())
            # salva com nome fixo por enquanto (pode parametrizar futuramente)
            with open(CSV_FILENAME, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(projetos)
            logger.info("✅ Capturados %d projetos. Salvo em '%s'", len(projetos), CSV_FILENAME)
        else:
            logger.warning("Nenhum projeto capturado.")

    except WebDriverException as e:
        logger.exception("Erro com o WebDriver: %s", e)
    except Exception as e:
        logger.exception("Erro inesperado durante execução: %s", e)
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass


if __name__ == "__main__":
    main()
