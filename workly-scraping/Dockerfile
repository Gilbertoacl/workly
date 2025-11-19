FROM python:3.11-slim

# Instalar dependências do Chrome
RUN apt-get update && apt-get install -y wget gnupg unzip && rm -rf /var/lib/apt/lists/*

# Adicionar repositório oficial do Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
       > /etc/apt/sources.list.d/google-chrome.list

# Instalar Google Chrome (última versão estável)
RUN apt-get update && apt-get install -y google-chrome-stable && rm -rf /var/lib/apt/lists/*

# Instalar ChromeDriver compatível
RUN CHROME_VERSION=$(google-chrome --version | sed 's/Google Chrome //') \
    && DRIVER_VERSION=$(echo $CHROME_VERSION | cut -d. -f1) \
    && wget -O /tmp/chromedriver.zip \
       "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chromedriver-linux64.zip" \
    || wget -O /tmp/chromedriver.zip \
       "https://storage.googleapis.com/chrome-for-testing-public/${DRIVER_VERSION}.0.0.0/linux64/chromedriver-linux64.zip" \
    && unzip /tmp/chromedriver.zip -d /usr/local/bin/ \
    && mv /usr/local/bin/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver \
    && chmod +x /usr/local/bin/chromedriver \
    && rm -rf /tmp/chromedriver.zip /usr/local/bin/chromedriver-linux64

# Vars
ENV CHROME_BIN=/usr/bin/google-chrome
ENV CHROMEDRIVER_PATH=/usr/local/bin/chromedriver

# PATH
ENV PATH="/usr/local/bin:${PATH}"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
