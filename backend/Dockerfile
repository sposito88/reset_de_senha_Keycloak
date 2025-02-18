# Imagem base Node.js
FROM node:20-slim

# Diretório de trabalho
WORKDIR /app

# Instala o Oracle Instant Client e dependências
RUN apt-get update && apt-get install -y \
    libaio1 \
    wget \
    unzip \
    curl \
    && wget https://download.oracle.com/otn_software/linux/instantclient/219000/instantclient-basic-linux.x64-21.9.0.0.0dbru.zip \
    && wget https://download.oracle.com/otn_software/linux/instantclient/219000/instantclient-sqlplus-linux.x64-21.9.0.0.0dbru.zip \
    && unzip instantclient-basic-linux.x64-21.9.0.0.0dbru.zip \
    && unzip instantclient-sqlplus-linux.x64-21.9.0.0.0dbru.zip \
    && mkdir -p /opt/oracle \
    && mv instantclient_21_9 /opt/oracle/instantclient \
    && rm instantclient-basic-linux.x64-21.9.0.0.0dbru.zip \
    && rm instantclient-sqlplus-linux.x64-21.9.0.0.0dbru.zip \
    && apt-get remove -y wget unzip \
    && apt-get install -y iputils-ping \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configuração do Oracle Instant Client
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient
ENV PATH=$PATH:/opt/oracle/instantclient
ENV TNS_ADMIN=/opt/oracle/instantclient
ENV ORACLE_HOME=/opt/oracle/instantclient

# Copia os arquivos do backend
COPY backend/package*.json ./
RUN npm install

# Copia o backend inteiro
COPY backend /app  

# Expõe a porta da API
EXPOSE 3000

# Inicia a API
CMD ["npm", "run", "server"]
