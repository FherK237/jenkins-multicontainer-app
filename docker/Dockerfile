FROM node:18-alpine

# La herramienta que agregamos en el paso anterior
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./

# CAMBIO 1: Usar npm install normal para que incluya Jest (devDependencies)
RUN npm install

# CAMBIO 2: Copiar todo el proyecto para asegurarnos de que la carpeta tests/ pase al contenedor
COPY . .

# Tu comando de arranque habitual
CMD ["npm", "start"]