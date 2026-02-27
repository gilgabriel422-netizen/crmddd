# 🚀 Guía de Despliegue en Render

## 📋 Requisitos
- GitHub repo con el código
- Cuenta en [Render.com](https://render.com)
- Base de datos PostgreSQL en Render

---

## 1️⃣ Desplegar Backend en Render

### Paso 1: Crear servicio web en Render
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New" → "Web Service"
3. Conecta tu repositorio GitHub
4. Configura:
   - **Name**: `innovation-backend` (o similar)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (o Paid si necesitas)

### Paso 2: Configurar Variables de Entorno
En el formulario de creación, añade estas variables bajo "Environment":

```
NODE_ENV=production
DB_HOST=tu-postgres-host.onrender.com
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=crm_database
DB_PORT=5432
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
PORT=5000
ALLOWED_ORIGINS=https://tu-frontend.onrender.com,https://another-domain.com
```

**O usa DATABASE_URL**:
```
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_aqui
PORT=5000
ALLOWED_ORIGINS=https://tu-frontend.onrender.com
```

### Paso 3: Deploy
El deploy se inicia automáticamente. URL del backend será algo como:
```
https://innovation-backend.onrender.com
```

---

## 2️⃣ Desplegar Frontend en Render

### Paso 1: Crear servicio estático
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New" → "Static Site"
3. Conecta tu repositorio GitHub
4. Configura:
   - **Name**: `innovation-frontend` (o similar)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

### Paso 2: Configurar Variables de Entorno
Antes de hacer deploy, crea un archivo `.env` en frontend:

```env
VITE_API_URL=https://innovation-backend.onrender.com/api
```

O configúralo en el Settings de Render después del deploy.

### Paso 3: Deploy
El site estático será algo como:
```
https://innovation-frontend.onrender.com
```

---

## 3️⃣ Variables de Entorno Resumen

### Frontend (`.env`)
```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

### Backend (`.env` o variables en Render)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=tu_secreto_super_seguro
PORT=5000
ALLOWED_ORIGINS=https://innovation-frontend.onrender.com
```

---

## 4️⃣ Checker de Configuración

✅ El frontend debe conectarse al backend usando HTTPS  
✅ El backend debe permitir CORS del frontend  
✅ La base de datos PostgreSQL debe estar en red  
✅ Las variables de entorno deben coincidir en el .env y Render  
✅ El JWT_SECRET debe ser diferente en producción  

---

## 5️⃣ Troubleshooting

### Error: "Network Error" al crear contratos
**Causa**: El frontend no consigue conectarse al backend.  
**Solución**:
1. Verifica que `VITE_API_URL` apunta al backend correcto
2. Abre la consola del navegador (F12) y revisa la URL real
3. Comprueba que CORS está configurado en el backend

### Error: "CORS blocked"
**Causa**: El backend no permite el dominio del frontend  
**Solución**:
```env
ALLOWED_ORIGINS=https://tu-frontend.onrender.com
```

### Error: "Database connection failed"
**Causa**: Las credenciales de PostgreSQL son incorrectas  
**Solución**:
1. Verifica DATABASE_URL en Render
2. Prueba la conexión localmente primero
3. Asegúrate de que PostgreSQL está disponible

---

## 6️⃣ URLs Finales

| Componente | URL |
|-----------|-----|
| Frontend | `https://innovation-frontend.onrender.com` |
| Backend API | `https://innovation-backend.onrender.com/api` |
| Base de datos | `postgresql://host:5432/db_name` |

---

## 7️⃣ Monitoreo en Producción

En Render Dashboard:
- **Logs**: Ver en tiempo real qué está pasando
- **Metrics**: CPU, memoria, requests
- **Deployments**: Historial de cambios

---

## 📚 Referencia Rápida

**Cambiar API URL en frontend**: Editar `VITE_API_URL` en `.env` y hacer rebuild  
**Cambiar variables backend**: Ir a Settings del servicio en Render y actualizar  
**Ver logs**: Click en "Logs" en el dashboard de Render  
**Reiniciar servicio**: Click en "Manual Deploy"
