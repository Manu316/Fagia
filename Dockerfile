# Etapa 1: Construir la aplicación Vue.js
FROM node:18-alpine as build-stage

WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de tu aplicación
COPY . .

# Construir la aplicación Vue.js para producción
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:stable-alpine as production-stage

# Copiar la aplicación construida desde la etapa de construcción
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Eliminar la configuración predeterminada de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar tu configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/fagia-front.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]