# 📋 CREAR CLIENTES CON USUARIOS ASOCIADOS

## ✅ Sistema de Roles de Clientes

El sistema ya tiene 3 tipos de clientes predefinidos:

| Tipo | Email | Contraseña | Panel |
|------|-------|-----------|-------|
| **Blue** | `blue@crm.com` | `admin123` | Cliente Estándar |
| **Gold** | `gold@crm.com` | `admin123` | Cliente Premium (IB1) |
| **Black** | `black@crm.com` | `admin123` | Cliente VIP (IB2) |

## 🚀 CREAR UN CLIENTE NUEVO

### **OPCIÓN 1: Script Interactivo (Recomendado)**

```bash
# En la carpeta backend
node crear-cliente-rapido.js
```

El script te pedirá:
- ✏️ Nombre
- ✏️ Apellido
- ✏️ Email
- ✏️ Teléfono
- ✏️ Cédula
- ✏️ Empresa (opcional)
- 📊 Tipo de cliente (Blue/Gold/Black)

**Resultado:** Genera automáticamente credenciales únicas:
```
Email: jpérez@crm.com
Contraseña: Clt3jk9a2a!42
Rol: blue
```

### **OPCIÓN 2: Petición cURL**

```bash
curl -X POST http://localhost:5000/api/clientes/crear-con-usuario \
  -H "Content-Type: application/json" \
  -d '{
    "clienteData": {
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan@empresa.com",
      "phone": "555-1234",
      "document_number": "0123456789",
      "empresa": "Mi Empresa S.A."
    },
    "rolCliente": "blue"
  }'
```

### **OPCIÓN 3: Petición HTTP desde código**

```javascript
const response = await axios.post(
  'http://localhost:5000/api/clientes/crear-con-usuario',
  {
    clienteData: {
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@empresa.com',
      phone: '555-1234',
      document_number: '0123456789',
      empresa: 'Mi Empresa S.A.'
    },
    rolCliente: 'blue' // 'blue', 'gold', o 'black'
  }
);

console.log(response.data.credenciales);
// {
//   email: 'jperez@crm.com',
//   password: 'Clt3jk9a2a!42',
//   rol: 'blue'
// }
```

## 📊 ¿QUÉ SUCEDE AL CREAR UN CLIENTE?

1. **Se crea el cliente** en la tabla `clientes`
   - Guarda datos personales, empresa, contacto
   - Status: `activo`
   - Fecha de registro: automática

2. **Se crea automáticamente un usuario** en la tabla `usuarios`
   - Email único generado: `[inicial_nombre][apellido]@crm.com`
   - Contraseña: alfanumérica segura (16 caracteres)
   - Rol: `blue`, `gold` o `black` según lo especificado
   - Status: `activo`

3. **Se vinculan mutuamente**
   - El cliente tiene referencia al usuario (`usuario_asignado_id`)
   - El usuario tiene el rol específico del cliente

## 🔐 CREDENCIALES DEL CLIENTE

```
Email: [generado_automáticamente]@crm.com
Contraseña: [generada_aleatoriamente]
```

**Ejemplo:**
- Cliente: Juan Pérez → Email: `jperez@crm.com`
- Contraseña: `ClthJ8kL2m!15` (única y segura)

## 🌐 ACCESO DEL CLIENTE

### URL de Login
```
http://localhost:3000/login
```

### Paneles Disponibles
- **Blue**: http://localhost:3000/cliente
- **Gold**: http://localhost:3000/cliente-gold
- **Black**: http://localhost:3000/cliente-black

## 🎯 QUÉ VE EL CLIENTE EN SU PANEL

Una vez logueado, el cliente ve:

### ✓ Contrato
- 📋 Ver Plantilla (contrato JSON formateado)
- 📄 Descargar Documento (HTML imprimible)

### ✓ Beneficios
- Lista de beneficios incluidos

### ✓ Puntos / Compensación
- Saldo de puntos

### ✓ Solicitar Reserva
- Formulario para reservar hospedaje

### ✓ Enviar a Atención
- Formulario de soporte

### ✓ Bandeja de Respuestas
- Ver respuestas a sus consultas

## 💾 CAMBIAR CONTRASEÑA DE UN CLIENTE

Si necesitas cambiar la contraseña de un cliente, corre:

```bash
node fix-admin-password.js
```

Este script resetea la contraseña a `admin2026` para todos.

## 🔍 VER CLIENTES CREADOS

```bash
# En PostgreSQL
SELECT id, first_name, last_name, email, usuario_asignado_id, status 
FROM clientes 
ORDER BY id DESC;

# Ver usuario asociado
SELECT u.id, u.nombre, u.email, u.rol 
FROM usuarios u 
WHERE u.rol IN ('blue', 'gold', 'black');
```

## ⚙️ API Endpoint

**POST** `/api/clientes/crear-con-usuario`

**Body:**
```json
{
  "clienteData": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@empresa.com",
    "phone": "555-1234",
    "document_number": "0123456789",
    "empresa": "Mi Empresa",
    "ciudad": "Quito",
    "pais": "Ecuador"
  },
  "rolCliente": "blue"
}
```

**Response:**
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

## 📝 NOTAS

- La contraseña se genera aleatoriamente y es única para cada cliente
- El cliente **NO puede cambiar su rol** desde el panel
- El cliente **SOLO puede ver SU contrato**, no el de otros
- Los roles son: `blue` (estándar), `gold` (premium), `black` (VIP)
- Cada rol tiene un panel diferente y diferentes beneficios

---

**¿Necesitas ayuda?** Corre el script interactivo y sigue los pasos.
