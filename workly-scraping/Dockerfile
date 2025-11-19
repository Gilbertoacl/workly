FROM python:3.11-slim

# Instalar Chromium + dependências
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    libnss3 \
    libasound2 \
    libfontconfig \
    libgbm1 \
    libexpat1 \
    libglib2.0-0 \
    libxcomposite1 \
    libxkbcommon0 \
    libxrandr2 \
    ca-certificates \
    fonts-liberation \
    xdg-utils \
    libxtst6 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Variáveis de ambiente do Chrome/Selenium
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Executa diretamente o main.py
CMD ["python", "main.py"]