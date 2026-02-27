# 🔧 Configuración de Entornos: Local vs Render

## Resumen Ejecutivo

Tu aplicación ahora está configurada para funcionar en **2 entornos**:

1. **Desarrollo Local** (tu máquina): `localhost:3000` → `localhost:5000`  
2. **Producción en Render** (cloud): `https://frontend.onrender.com` → `https://backend.onrender.com`

---

## Estructura de Carpetas

```
Entregable/
├── backend/
│   ├── .env                    ← Archivo LOCAL (desarrollo)
│   ├── .env.example            ← Plantilla (NO comprometer contraseñas)
│   └── server.js
├── frontend/
│   ├── .env                    ← Archivo LOCAL para Vite (desarrollo)
│   ├── .env.example            ← Plantilla
│   └── src/pages/GestionContratos.jsx
└── GUIA_RENDER.md              ← Cómo desplegar a Render
```

---

## 🎯 Cómo Funciona

### Frontend (Vite)
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

- Lee `VITE_API_URL` del archivo `.env`
- Si no existe, usa `http://localhost:5000/api` como fallback

**Archivo `.env` (LOCAL)**:
```env
VITE_API_URL=http://localhost:5000/api
```

**En Render** (configurar en Dashboard):
```env
VITE_API_URL=https://innovation-backend.onrender.com/api
```

---

### Backend (Node.js)
```javascript
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
```

- Lee variables de `process.env` (del archivo `.env` vía dotenv)

**Archivo `.env` (LOCAL)**:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=G@briel
DB_NAME=crm_database
PORT=5000
NODE_ENV=development
```

**En Render** (configurar en Dashboard):
```env
DATABASE_URL=postgresql://user:pass@render-db:5432/database_name
NODE_ENV=production
PORT=5000
JWT_SECRET=super-secreto-cambiar
```

---

## 📁 Archivos de Configuración

### `.env` (NO comprometer en Git)
```
✅ Contiene: contraseñas, secrets, API keys
❌ NO debe estar en repositorio
📝 Cambios según máquina/entorno
⚡ Se carga automáticamente al iniciar
```

### `.env.example` (Sí comprometer en Git)
```
✅ Plantilla de variables necesarias
✅ Sin valores sensibles
✅ Sirve como documentación
📖 Otros desarrolladores saben qué configurar
```

---

## 🌍 Comparativa: Local vs Render

| Concepto | Local | Render |
|----------|-------|--------|
| **Frontend se ejecuta en** | `http://localhost:3000` | `https://frontend.onrender.com` |
| **Backend se ejecuta en** | `http://localhost:5000` | `https://backend.onrender.com` |
| **Base datos (PostgreSQL)** | `localhost:5432` | `host-render.onrender.com:5432` |
| **Variables de entorno** | Archivo `.env` | Dashboard de Render |
| **ALLOWED_ORIGINS** | `localhost:3000` | `https://frontend.onrender.com` |
| **Protocolo** | HTTP (sin SSL) | HTTPS (con SSL) |

---

## 🚀 Cómo Cambiar de Entorno

### Cambiar Frontend a Producción

1. Editar `/frontend/.env`:
```env
# ANTES (desarrollo)
VITE_API_URL=http://localhost:5000/api

# DESPUÉS (producción)
VITE_API_URL=https://innovation-backend.onrender.com/api
```

2. Rebuild:
```bash
cd frontend
npm run build
```

3. Desplegar a Render (commit y push a GitHub)

---

### Cambiar Backend a Producción

En Render Dashboard → Settings → Environment:

```env
# DESARROLLO
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# PRODUCCIÓN
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
JWT_SECRET=cambiar_a_seguro
```

---

## ✅ Checklist de Configuración

### Desarrollo Local

- [ ] `backend/.env` existe con credenciales PostgreSQL locales
- [ ] `frontend/.env` existe con `VITE_API_URL=http://localhost:5000/api`
- [ ] PostgreSQL está corriendo en `localhost:5432`
- [ ] Backend se inicia: `npm start` en `/backend`
- [ ] Frontend se inicia: `npm run dev` en `/frontend`
- [ ] Puedo crear contratos sin error de red

### Producción (Render)

- [ ] GitHub repo subido con código
- [ ] Backend deployado en Render con `DATABASE_URL` correcto
- [ ] Frontend deployado en Render con `VITE_API_URL` correcto
- [ ] Variables de entorno configuradas en Render Dashboard
- [ ] CORS permite el dominio del frontend
- [ ] Puedo acceder a `https://frontend.onrender.com`
- [ ] Puedo crear contratos sin error de red

---

## 🔐 Seguridad

**NUNCA hacer esto:**
```bash
git add .env
git commit -m "Add credentials"
git push
```

**SIEMPRE hacer esto:**
```bash
# .env en .gitignore
echo ".env" >> .gitignore
git add .env.example
git commit -m "Add .env.example template"
```

---

## 📝 Variables Utilizadas en Tu App

### Frontend (src/pages/GestionContratos.jsx, etc.)
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Backend (config/database.js)
```javascript
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  // ...
});
```

---

## 🆘 Errores Comunes y Soluciones

### Error: "Network Error" al hacer POST
**Causa**: Frontend no puede alcanzar backend  
**Revisar**:
1. ¿`VITE_API_URL` está correcta?
2. ¿Backend está corriendo?
3. ¿Firewall bloquea la conexión?

### Error: "CORS blocked"
**Causa**: Backend rechaza dominio del frontend  
**Solución**:
```env
ALLOWED_ORIGINS=https://frontend.onrender.com
```

### Error: "Database connection failed"
**Causa**: Credenciales PostgreSQL erróneas  
**Revisar**:
1. ¿Usuario y contraseña correctos?
2. ¿HOST es accesible desde Internet?
3. ¿Puerto 5432 abierto?

---

## 📚 Lectura Adicional

- [Vite Env Variables](https://vitejs.dev/guide/env-and-modes.html)
- [Node dotenv](https://github.com/motdotla/dotenv)
- [Render Docs](https://render.com/docs)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
