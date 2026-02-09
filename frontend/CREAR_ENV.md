# ⚠️ IMPORTANTE: Crear archivo .env.local

Vite requiere un archivo `.env.local` (con punto al inicio) en la raíz del proyecto frontend.

## Pasos:

1. Crea un archivo llamado `.env.local` en la carpeta `frontend/`
2. Agrega el siguiente contenido:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
NODE_ENV=development
```

3. **Reinicia el servidor de desarrollo de Vite** (detén y vuelve a ejecutar `npm run dev`)

## Nota importante:

- El archivo debe llamarse `.env.local` (con punto al inicio)
- Las variables deben comenzar con `VITE_` para que Vite las exponga
- Después de crear el archivo, **debes reiniciar Vite** para que lea las nuevas variables

## Verificar que funciona:

Abre la consola del navegador y deberías ver:
```
🔍 API Base URL: http://localhost:5000/api
🔍 VITE_API_URL env: http://localhost:5000/api
```
