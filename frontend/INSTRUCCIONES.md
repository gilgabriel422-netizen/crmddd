# 📘 Instrucciones para Ejecutar el Proyecto CRM

Este proyecto consta de dos partes: **Backend** (Node.js + Express + PostgreSQL) y **Frontend** (React + Vite).

---

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (v14 o superior) - [Descargar aquí](https://nodejs.org/)
2. **PostgreSQL** (v12 o superior) - [Descargar aquí](https://www.postgresql.org/download/)
3. **npm** (viene con Node.js)

---

## ⚙️ Configuración Inicial

### 1. Configurar PostgreSQL

1. Abre **pgAdmin** o la consola de PostgreSQL
2. Asegúrate de tener el usuario `postgres` con contraseña `postgres` (o edita el archivo `.env` en backend con tus credenciales)
3. La base de datos se creará automáticamente cuando ejecutes el script de inicialización

### 2. Verificar Archivos de Configuración

Ya se crearon los archivos de configuración necesarios:
- ✅ `backend/.env` - Configuración del backend
- ✅ `frontend/.env.local` - Configuración del frontend

Si necesitas cambiar la contraseña de PostgreSQL, edita el archivo `backend/.env`:
```
DB_PASSWORD=tu_contraseña_aquí
```

---

## 🚀 Ejecutar el Backend

### Paso 1: Instalar Dependencias

Abre una terminal en la carpeta del backend:

```bash
cd C:\Users\Adrian\Desktop\crm\crm-clone\backend
npm install
```

### Paso 2: Inicializar la Base de Datos

```bash
npm run init-db
```

Este comando creará la base de datos y todas las tablas necesarias.

### Paso 3: (Opcional) Poblar con Datos de Prueba

```bash
npm run poblar
```

Este comando insertará datos de ejemplo para probar la aplicación.

### Paso 4: Ejecutar el Servidor Backend

**Modo desarrollo (con auto-reload):**
```bash
npm run dev
```

**O modo producción:**
```bash
npm start
```

✅ El backend estará corriendo en: **http://localhost:5000**

---

## 🎨 Ejecutar el Frontend

### Paso 1: Instalar Dependencias

Abre **OTRA TERMINAL NUEVA** (deja el backend corriendo) y navega al frontend:

```bash
cd C:\Users\Adrian\Desktop\crm\crm-clone\frontend
npm install
```

### Paso 2: Ejecutar el Servidor Frontend

```bash
npm run dev
```

✅ El frontend estará corriendo en: **http://localhost:5173**

---

## 📝 Resumen de Comandos

### Terminal 1 - Backend:
```bash
cd C:\Users\Adrian\Desktop\crm\crm-clone\backend
npm install                 # Solo la primera vez
npm run init-db            # Solo la primera vez
npm run poblar             # Opcional, solo la primera vez
npm run dev                # Iniciar servidor
```

### Terminal 2 - Frontend:
```bash
cd C:\Users\Adrian\Desktop\crm\crm-clone\frontend
npm install                 # Solo la primera vez
npm run dev                # Iniciar servidor
```

---

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 🔐 Credenciales de Prueba

Si ejecutaste `npm run poblar`, puedes usar estas credenciales:

- **Email**: admin@crm.com
- **Password**: admin123

---

## ❌ Solución de Problemas

### Backend no inicia:
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `backend/.env`
- Asegúrate de haber ejecutado `npm run init-db`

### Frontend no conecta con Backend:
- Verifica que el backend esté corriendo en http://localhost:5000
- Revisa el archivo `frontend/.env.local`

### Error de módulos no encontrados:
- Ejecuta `npm install` en la carpeta correspondiente

---

## 🛑 Detener los Servidores

Para detener cualquier servidor, presiona **Ctrl + C** en su terminal.

---

## 📞 Información Adicional

Para más detalles sobre la API y características:
- Ver `backend/README.md`
- Ver `frontend/README.md`
