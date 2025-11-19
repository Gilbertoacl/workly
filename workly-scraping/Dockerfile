FROM python:3.11-slim

# Instalar Chromium + dependências (mantém seu setup atual)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    chromium \
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
    cron \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Permissão do script
RUN chmod +x /app/run_scraper.sh

# Registrar cron job
COPY crontab.txt /etc/cron.d/scraper-cron
RUN chmod 0644 /etc/cron.d/scraper-cron
RUN crontab /etc/cron.d/scraper-cron

# Criar arquivo de log
RUN touch /var/log/cron.log

CMD cron && tail -f /var/log/cron.log
