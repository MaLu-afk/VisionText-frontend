# VisionText Frontend

Interfaz de VisionText AI (React 19 + TypeScript + Vite + Tailwind). Búsqueda de imágenes por texto o por imagen, subida con validación CLIP y panel de administración.

## Desarrollo

```bash
cp .env.example .env.local   # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

O con el `docker-compose.yml` de la raíz del proyecto, que usa `Dockerfile.dev`.

## Producción

- `Dockerfile`: compila la app y la sirve con nginx en `$PORT` (con fallback de rutas para React Router).
- `VITE_API_URL` se incrusta al compilar: en Railway se define como variable del servicio.
- El despliegue se hace publicando un tag `vX.Y.Z` (ver `.github/workflows/deploy.yml`).

La guía completa de despliegue de los 4 servicios está en el repo del backend: `VisionText-backend/DEPLOY.md`.
