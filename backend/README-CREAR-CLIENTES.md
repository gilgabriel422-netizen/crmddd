# 🎯 CREAR CLIENTE CON USUARIO - GUÍA RÁPIDA

## 📌 Resumen

Ahora puedes crear clientes nuevos con usuarios asociados automáticamente. El sistema:
✅ Crea el cliente en base de datos
✅ Crea un usuario único para el cliente
✅ Genera credenciales automáticas
✅ Vincula cliente ↔ usuario

---

## 🚀 MÁS FÁCIL: Script Interactivo

```bash
cd C:\Users\Gabriel\Desktop\frontendmigi\innovationbussines\backend
node crear-cliente-rapido.js
```

El script te pregunta:
```
📝 Ingresa los datos del cliente:

Nombre: Juan
Apellido: Pérez
Email: juan@empresa.com
Teléfono: 555-1234
Cédula/Documento: 0123456789
Empresa (opcional): Mi Empresa S.A.

👤 Selecciona el tipo de cliente:
1. Blue (Cliente Estándar)
2. Gold (IB1 - Premium)
3. Black (IB2 - VIP)

Selecciona (1, 2 o 3): 1
```

**Respuesta:**
```
✅ CLIENTE CREADO EXITOSAMENTE

📋 DATOS DEL CLIENTE:
   ID: 42
   Nombre: Juan Pérez
   Email: juan@empresa.com
   Tipo: Blue (Estándar)

👤 CREDENCIALES DE USUARIO:
   Email: jperez@crm.com
   Contraseña: Clt3jk9a2a!42
   Rol: blue

🌐 ACCESO:
   URL: http://localhost:3000/login
   Usuario: jperez@crm.com
   Contraseña: Clt3jk9a2a!42

💡 COPIAR Y COMPARTIR CON EL CLIENTE:
═══════════════════════════════════════
Email: jperez@crm.com
Contraseña: Clt3jk9a2a!42
═══════════════════════════════════════
```

---

## 📊 Tipos de Cliente Disponibles

| Tipo | Rol | Panel | Descripción |
|------|-----|-------|-------------|
| **Blue** | `blue` | `/cliente` | Cliente Estándar |
| **Gold** | `gold` | `/cliente-gold` | Cliente Premium (IB1) |
| **Black** | `black` | `/cliente-black` | Cliente VIP (IB2) |

---

## 🔐 Credenciales de los Clientes Predefinidos

Si necesitas acceder como cliente de prueba:

| Cliente | Email | Password | Tipo |
|---------|-------|----------|------|
| Cliente 1 | `cliente@crm.com` | `admin123` | Blue |
| Cliente 2 | `clienteib1@crm.com` | `admin123` | Gold |
| Cliente 3 | `clienteib2@crm.com` | `admin123` | Black |

---

## 🔧 Lo que se genera automáticamente

### Email del Usuario
Se genera combinando inicial del nombre + apellido + @crm.com
```
Juan Pérez → jperez@crm.com
María García → mgarcía@crm.com
Carlos López → clopez@crm.com
```

### Contraseña
16 caracteres seguros:
```
Formato: Clt[8 caracteres aleatorios]![2 dígitos]
Ejemplo: Clt3jk9a2a!42
```

---

## ✅ ¿QUÉ VE EL CLIENTE EN SU PANEL?

Una vez que se autentica con las credenciales generadas:

### Menu Principal
- 📋 **Contrato** ← AQUÍ VE LA PLANTILLA
  - Ver Plantilla (JSON formateado)
  - Descargar Documento (HTML)
- 🎁 Beneficios
- 🏆 Puntos / Compensación
- 📅 Solicitar Reserva
- 💬 Enviar a Atención
- 📧 Bandeja de Respuestas
- ❓ Ayuda

---

## 🔗 API Endpoint Directo

Si prefieres llamar la API directamente:

**POST** `http://localhost:5000/api/clientes/crear-con-usuario`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "clienteData": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@empresa.com",
    "phone": "555-1234",
    "document_number": "0123456789",
    "empresa": "Mi Empresa S.A."
  },
  "rolCliente": "blue"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "cliente": {
    "id": 42,
    "nombre": "Juan Pérez",
    "email": "juan@empresa.com"
  },
  "usuario": {
    "id": 15,
    "nombre": "Juan Pérez",
    "email": "jperez@crm.com",
    "rol": "blue"
  },
  "credenciales": {
    "email": "jperez@crm.com",
    "password": "Clt3jk9a2a!42",
    "rol": "blue"
  },
  "mensaje": "✅ Cliente y usuario creados exitosamente..."
}
```

---

## 🎬 Paso a Paso: Crear y Probar

### 1️⃣ Crea el cliente
```bash
node crear-cliente-rapido.js
```
Anota las credenciales generadas.

### 2️⃣ Accede al panel del cliente
URL: `http://localhost:3000/login`
- Email: `jperez@crm.com` (el generado)
- Contraseña: `Clt3jk9a2a!42` (la generada)

### 3️⃣ Ve a la sección "Contrato"
- Haz clic en "Ver Plantilla"
- Se carga y muestra la plantilla del contrato
- Haz clic en "Descargar Documento"
- Se abre en una nueva pestaña listo para imprimir

### 4️⃣ Comparte con el cliente
Envíale un email con:
```
Bienvenida a Innovation Business

Para acceder a tu panel, ingresa con:

Email: jperez@crm.com
Contraseña: Clt3jk9a2a!42

URL: http://localhost:3000/login

En tu panel podrás ver tu contrato y descargar tus documentos.
```

---

## 💾 Base de Datos

### Tabla `clientes`
```sql
SELECT id, first_name, last_name, email, usuario_asignado_id, status 
FROM clientes 
ORDER BY id DESC;
```

### Tabla `usuarios` 
```sql
SELECT id, nombre, email, rol, activo 
FROM usuarios 
WHERE rol IN ('blue', 'gold', 'black');
```

---

## ⚠️ Notas Importantes

- ✅ Cada cliente tiene un email único
- ✅ Cada cliente tiene una contraseña única
- ✅ El cliente NO puede ver contratos de otros clientes
- ✅ Los roles (blue/gold/black) determinan qué panel ve
- ✅ Las credenciales se generan al crear, no se pueden recuperar (solo regenerar)

---

## 🆘 Si algo falla

### Error: "No hay contratos asociados a tu cuenta"
✅ Normal si es un cliente nuevo. Ve a `/gestion-contratos` como admin y crea un contrato para el cliente.

### Error: 404 en la ruta
✅ Asegúrate de que el backend esté corriendo en `:5000`

### Error: Email duplicado
✅ El email del cliente o del usuario ya existe. Cambia el nombre o apellido.

---

**¿Listo?** Corre: `node crear-cliente-rapido.js` 🚀
