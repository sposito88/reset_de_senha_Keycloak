# Etapa 1: Construção do frontend
FROM node:20-slim AS builder

WORKDIR /app

# Copia os arquivos do frontend
COPY frontend/package*.json ./
RUN npm install 

# Defina a variável para o build do Vite
ARG VITE_API_URL="/api/reset-password"
ENV VITE_API_URL=$VITE_API_URL


# Copia todo o código-fonte do frontend
COPY frontend .  

# Gera a build do frontend, garantindo que a variável seja passada corretamente
RUN VITE_API_URL=$VITE_API_URL npm run build

# Etapa 2: Servindo com Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html 
# Expõe a porta do frontend
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
