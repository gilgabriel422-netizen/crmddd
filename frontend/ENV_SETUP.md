# Configuración de Variables de Entorno - Frontend

## Archivo .env

El archivo `.env` ya está configurado en `frontend/.env.local` con:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
NODE_ENV=development
```

## Si necesitas cambiarlo

1. Edita el archivo `frontend/.env.local` o crea `frontend/.env`
2. Ajusta `VITE_API_URL` si tu backend corre en otro puerto
3. Reinicia el servidor de desarrollo (`npm run dev`)

## Nota

- Las variables de entorno en Vite deben comenzar con `VITE_`
- Después de cambiar `.env`, reinicia el servidor de desarrollo
