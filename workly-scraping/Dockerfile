FROM python:3.11-slim

# Instalar Chromium + ChromeDriver + dependências necessárias
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
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Criar diretório do app
WORKDIR /app

# Instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Rodar scraper diretamente
CMD ["python", "main.py"]
