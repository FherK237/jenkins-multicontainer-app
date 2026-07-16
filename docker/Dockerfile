FROM node:18-alpine
WORKDIR /app
#Instalardependencias
COPY package*.json ./
RUN nom ci --only-production
# Copiar codigo fuente
COPY src/ ./src/
#Exponer puerto
EXPOSE 3000
# Comando para inciair la aplicacion
CMD ["npm", "start"]