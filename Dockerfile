# Imagen de PRODUCCIÓN: compila la app y la sirve como archivos estáticos con nginx.
# Desarrollo local con hot reload: Dockerfile.dev (lo usa docker-compose).

# ---------- Build ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite incrusta VITE_API_URL en el bundle al compilar: debe existir en el build.
# En Railway basta con definirla como variable del servicio.
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "ERROR: define VITE_API_URL (URL pública del backend)" >&2 && exit 1)
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Runtime ----------
FROM nginx:1.28-alpine

# Railway inyecta PORT; la imagen de nginx sustituye ${PORT} en las plantillas al arrancar
ENV PORT=8080

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
