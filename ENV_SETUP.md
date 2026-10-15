# Configuración de Variables de Entorno - Frontend

## Nota Importante

El archivo `.env` está en `.gitignore` para proteger información sensible. Para desarrollo local, necesitas crear tu propio archivo de variables de entorno.

## Opción 1: Crear `.env.local` (Recomendado para desarrollo local)

Crea un archivo `.env.local` en la raíz del proyecto frontend con:

```bash
VITE_API_URL=http://localhost:8000
```

## Opción 2: Usar Docker Compose (Ya configurado)

Si usas Docker Compose, la variable `VITE_API_URL` ya está configurada en `docker-compose.yml`:

```yaml
environment:
  - VITE_API_URL=http://localhost:8000
```

## Opción 3: Variables de entorno del sistema

Puedes exportar la variable antes de ejecutar el servidor de desarrollo:

```bash
export VITE_API_URL=http://localhost:8000
npm run dev
```

## Verificación

Para verificar que la variable está configurada correctamente, puedes agregar un `console.log` temporal en `src/services/api.ts`:

```typescript
console.log('API_BASE_URL:', import.meta.env.VITE_API_URL);
```
