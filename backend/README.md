# CRM Backend API

Backend para sistema CRM (Customer Relationship Management) construido con Node.js, Express y **PostgreSQL**.

## 🚀 Características

- ✅ Gestión completa de clientes
- ✅ Contactos múltiples por cliente
- ✅ Seguimiento de actividades (llamadas, emails, reuniones, tareas)
- ✅ Sistema de usuarios con autenticación JWT
- ✅ API RESTful con Express
- ✅ Base de datos **PostgreSQL**
- ✅ Suite completa de pruebas con Jest
- ✅ Cobertura de código automática

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- **PostgreSQL (v12 o superior)**
- npm o yarn

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
   
   Copia la plantilla y edita con tus credenciales:
   ```bash
   cp .env.example .env
   ```
   Ajusta en `.env`: `DB_PASSWORD` (tu contraseña de PostgreSQL), `JWT_SECRET` en producción. Valores por defecto en `.env.example` son para desarrollo.

3. **Asegurarse de que PostgreSQL esté corriendo** (servicio/daemon de la base de datos, no el backend Node). Luego inicializar la base de datos:
   ```bash
   npm run init-db
   ```
   Esto crea la base `crm_database`, las tablas y los usuarios de desarrollo.

4. **Usuarios de desarrollo** (contraseña para todos: **admin123**):
   - admin@crm.com (admin)
   - cobranzas@crm.com, contratos@crm.com, atencion@crm.com, postventa@crm.com
   - cliente@crm.com (Blue), clienteib1@crm.com (Gold), clienteib2@crm.com (Black)

## ▶️ Ejecutar el servidor

**Modo desarrollo (con nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```
## 🧪 Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Modo watch para desarrollo
npm run test:watch

# Ver cobertura de código
npm test -- --coverage
```


El servidor estará corriendo en `http://localhost:5000`

## 📡 Endpoints de la API

### Usuarios
- `POST /api/usuarios/login` - Iniciar sesión
- `GET /api/usuarios` - Listar todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Clientes
- `GET /api/clientes` - Listar todos los clientes
- `GET /api/clientes/search?q=query` - Buscar clientes
- `GET /api/clientes/:id` - Obtener cliente por ID
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Contactos
- `GET /api/contactos/cliente/:clienteId` - Obtener contactos de un cliente
- `GET /api/contactos/:id` - Obtener contacto por ID
- `POST /api/contactos` - Crear nuevo contacto
- `PUT /api/contactos/:id` - Actualizar contacto
- `DELETE /api/contactos/:id` - Eliminar contacto


### Locaciones
- `GET /api/locaciones` - Listar todas las locaciones
- `POST /api/locaciones` - Crear nueva locación
- `PUT /api/locaciones/:id` - Actualizar locación
- `DELETE /api/locaciones/:id` - Eliminar locación

### Departamentos
- `GET /api/departamentos` - Listar todos los departamentos
- `POST /api/departamentos` - Crear nuevo departamento
- `PUT /api/departamentos/:id` - Actualizar departamento
- `DELETE /api/departamentos/:id` - Eliminar departamento

### Actividades
- `GET /api/actividades` - Listar todas las actividades
- `GET /api/actividades/cliente/:clienteId` - Obtener actividades de un cliente
- `GET /api/actividades/:id` - Obtener actividad por ID
- `POST /api/actividades` - Crear nueva actividad
- `PUT /api/actividades/:id` - Actualizar actividad
- `PUT /api/actividades/:id/completar` - Marcar actividad como completada
- `DELETE /api/actividades/:id` - Eliminar actividad

## 📦 Estructura del Proyecto

```
back-end/
├── config/
│   └── database.js          # Configuración de MySQL
├── controllers/
│   ├── clientesController.js
│   ├── contactosController.js
│   ├── actividadesController.js
│   └── usuariosController.js
├── models/
│   ├── Cliente.js
│   ├── Contacto.js
│   ├── Actividad.js
│   └── Usuario.js
├── routes/
│   ├── clientes.js
│   ├── contactos.js
│   ├── actividades.js
│   └── usuarios.js
├── database/
│   └── schema.sql           # Schema de base de datos
├── .env                     # Variables de entorno
├── .gitignore
├── package.json
└── server.js                # Punto de entrada
```

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. Para acceder a rutas protegidas, incluye el token en el header:

```
Authorization: Bearer <tu_token>
```

## 📝 Ejemplos de uso

### Crear un cliente:
```javascript
POST http://localhost:5000/api/clientes
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "empresa": "Tech Solutions",
  "email": "juan@techsolutions.com",
  "telefono": "+1234567890",
  "direccion": "Calle Principal 123",
  "ciudad": "Madrid",
  "pais": "España",
  "estado": "prospecto"
}
```

### Crear una actividad:
```javascript
POST http://localhost:5000/api/actividades
Content-Type: application/json

{
  "cliente_id": 1,
  "usuario_id": 1,
  "tipo": "llamada",
  "titulo": "Seguimiento inicial",
  "descripcion": "Llamada para presentar nuestros servicios",
  "fecha_actividad": "2026-01-25 10:00:00"
}
```
PostgreSQL (pg)** - Base de datos relacional
- **bcryptjs** - Hash de passwords
- **jsonwebtoken** - Autenticación JWT
- **dotenv** - Variables de entorno
- **cors** - Cross-Origin Resource Sharing
- **body-parser** - Parse de request bodies
- **Jest** - Framework de pruebas
- **Supertest** - Pruebas de API HTTP/api`
2. CORS está habilitado para todos los orígenes en desarrollo
3. Enviar datos en formato JSON
4. Incluir el token JWT en requests autenticados

## 🛠️ Tecnologías Utilizadas

- **Express.js** - Framework web
- **MySQL2** - Driver de MySQL
- **bcryptjs** - Hash de passwords
- **jsonwebtoken** - Autenticación JWT
- **dotenv** - Variables de entorno
- **cors** - Cross-Origin Resource Sharing
- **body-parser** - Parse de request bodies

## 📄 Licencia

ISC
