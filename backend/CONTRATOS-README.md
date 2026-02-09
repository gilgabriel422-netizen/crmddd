# 📋 Sistema de Contratos de Viaje - Documentación

## 🎯 Descripción

Sistema completo para gestionar contratos de viaje basado en una plantilla JSON estructurada. Incluye gestión de clientes, tarjetas de pago, autorizaciones y contratos completos.

---

## 📁 Archivos Creados

### 1. **Migraciones**
- `database/migrations/create-contratos-tables.sql` - Crea 3 tablas nuevas

### 2. **Modelos**
- `models/Tarjeta.js` - Gestión de tarjetas de crédito/débito
- `models/AutorizacionPago.js` - Autorizaciones de pago
- `models/ContratoViaje.js` - Contratos completos

### 3. **Controladores**
- `controllers/contratoController.js` - Lógica de negocio

### 4. **Rutas**
- `routes/contratoRoutes.js` - Endpoints REST

### 5. **Scripts**
- `scripts/run-migrations.js` - Ejecutar migraciones
- `test-plantilla-contrato.js` - Pruebas del sistema

---

## 🚀 Instalación

### Paso 1: Ejecutar Migraciones

```bash
cd backend
node scripts/run-migrations.js
```

Esto creará las siguientes tablas:
- ✅ `clientes_tarjetas`
- ✅ `autorizaciones_pago`
- ✅ `contratos_viajes`

### Paso 2: Reiniciar Servidor

```bash
npm run dev
```

El servidor ahora incluye las nuevas rutas en `/api/contratos`

---

## 📡 API Endpoints

### **Contratos**

#### Obtener todos los contratos
```http
GET /api/contratos
```

#### Obtener contrato por ID
```http
GET /api/contratos/:id
```

#### Obtener contratos de un cliente
```http
GET /api/contratos/cliente/:clienteId
```

#### Obtener contratos por estado
```http
GET /api/contratos/estado/:estado
```
Estados: `pendiente`, `firmado`, `activo`, `cancelado`, `completado`

#### Obtener estadísticas
```http
GET /api/contratos/estadisticas
```

#### Crear contrato desde plantilla
```http
POST /api/contratos/plantilla
Content-Type: application/json

{
  "cliente": {
    "nombres_completos": "Juan Pérez",
    "ciudad": "Quito",
    "pais": "Ecuador",
    "telefono": "+593987654321",
    "cedula": "1712345678"
  },
  "tarjeta": {
    "nombre_tarjetahabiente": "Juan Perez",
    "tipo_tarjeta": "Visa",
    "numero_tarjeta": "4111111111111234",
    "fecha_caducidad": "12/2026"
  },
  "autorizacion": {
    "empresa": {
      "razon_social": "PACIFIC ADVENTURE PACITURE S.A.S",
      "nombre_comercial": "INNOVATION BUSINESS",
      "ruc": "1793230574001"
    },
    "valor": {
      "monto_numerico": 2500.00,
      "monto_letras": "DOS MIL QUINIENTOS DÓLARES"
    },
    "motivo": "Prestación de servicios turísticos",
    "voucher": {
      "lote": "LOTE001",
      "referencia": "REF123456",
      "aprobacion": "APR789012",
      "modalidad": "venta"
    }
  },
  "contrato": {
    "fecha": "2026-02-05",
    "valor_contrato": 2500.00,
    "anos_contrato": 2,
    "numero_noches": 10,
    "pagare": {
      "numero": "PAG-001",
      "fecha_vencimiento": "2027-02-05"
    }
  },
  "estadia": {
    "internacional": { "incluye": true, "numero_pax": 2 },
    "nacional": { "incluye": true, "numero_pax": 2 }
  },
  "beneficios": {
    "cortesias_por_asistencia": "2 noches gratis",
    "ofrecimientos_adicionales": "Descuento 10%"
  },
  "metadata": {
    "creado_por": "admin@crm.com"
  }
}
```

#### Actualizar contrato
```http
PUT /api/contratos/:id
Content-Type: application/json

{
  "valor_contrato": 3000.00,
  "estado": "activo"
}
```

#### Firmar contrato
```http
POST /api/contratos/:id/firmar
Content-Type: application/json

{
  "firma": "data:image/png;base64,iVBORw0KG...",
  "nombre": "Juan Pérez García",
  "fecha": "2026-02-05"
}
```

#### Activar contrato
```http
POST /api/contratos/:id/activar
```

#### Cancelar contrato
```http
POST /api/contratos/:id/cancelar
Content-Type: application/json

{
  "motivo": "Cliente solicitó cancelación"
}
```

#### Eliminar contrato
```http
DELETE /api/contratos/:id
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `clientes_tarjetas`
```sql
- id (SERIAL PRIMARY KEY)
- cliente_id (FK → clientes)
- nombre_tarjetahabiente
- tipo_tarjeta (Visa, Mastercard, Amex)
- numero_tarjeta (encriptado)
- ultimos_digitos
- fecha_caducidad (MM/YYYY)
- es_principal (boolean)
- estado (activa, bloqueada, expirada)
```

### Tabla: `autorizaciones_pago`
```sql
- id (SERIAL PRIMARY KEY)
- cliente_id (FK → clientes)
- tarjeta_id (FK → clientes_tarjetas)
- empresa_razon_social
- empresa_nombre_comercial
- empresa_ruc
- monto_numerico
- monto_letras
- moneda (USD por defecto)
- motivo
- voucher_lote
- voucher_referencia
- voucher_aprobacion
- voucher_modalidad
- estado (pendiente, aprobada, rechazada, cancelada)
- metadata (JSONB)
```

### Tabla: `contratos_viajes`
```sql
- id (SERIAL PRIMARY KEY)
- cliente_id (FK → clientes)
- autorizacion_pago_id (FK → autorizaciones_pago)
- numero_contrato (único, auto-generado)
- fecha_contrato
- valor_contrato
- anos_contrato
- numero_noches
- pagare_numero
- pagare_fecha_vencimiento
- estadia_internacional (JSONB)
- estadia_nacional (JSONB)
- cortesias_por_asistencia
- ofrecimientos_adicionales
- aceptacion_cliente (JSONB)
- datos_completos (JSONB - plantilla completa)
- estado (pendiente, firmado, activo, cancelado, completado)
- metadata (JSONB)
```

---

## 💡 Flujo de Uso

### 1. Crear Contrato Completo

```javascript
// Ejemplo con fetch
const response = await fetch('http://localhost:5000/api/contratos/plantilla', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify(plantillaContrato)
});

const result = await response.json();
console.log('Contrato creado:', result.data.numero_contrato);
```

### 2. Cliente Firma el Contrato

```javascript
await fetch(`http://localhost:5000/api/contratos/${contratoId}/firmar`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    firma: firmaDigital,
    nombre: nombreCliente,
    fecha: new Date().toISOString()
  })
});
```

### 3. Activar Contrato

```javascript
await fetch(`http://localhost:5000/api/contratos/${contratoId}/activar`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

---

## 🔐 Seguridad

- ✅ Todas las rutas requieren autenticación (JWT)
- ✅ Números de tarjeta deben ser encriptados en producción
- ✅ Validación de datos en cada endpoint
- ✅ Auditoría completa en metadata

---

## 🧪 Pruebas

### Probar plantilla
```bash
node test-plantilla-contrato.js
```

### Probar endpoints con cURL

```bash
# Crear contrato
curl -X POST http://localhost:5000/api/contratos/plantilla \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @plantilla-contrato.json

# Obtener contratos
curl http://localhost:5000/api/contratos \
  -H "Authorization: Bearer YOUR_TOKEN"

# Estadísticas
curl http://localhost:5000/api/contratos/estadisticas \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Respuestas de API

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Contrato creado exitosamente",
  "data": {
    "id": 1,
    "numero_contrato": "CT2602-1234",
    "cliente_id": 5,
    "estado": "pendiente",
    "valor_contrato": "2500.00",
    "fecha_creacion": "2026-02-05T10:30:00.000Z"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Error al crear contrato",
  "error": "Detalle del error"
}
```

---

## 🎨 Próximos Pasos

1. **Frontend**: Crear formulario para ingresar plantilla
2. **Firma Digital**: Integrar librería de firma electrónica
3. **PDFs**: Generar contrato en PDF
4. **Notificaciones**: Email al cliente cuando firma
5. **Encriptación**: Implementar encriptación de tarjetas

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que las migraciones se ejecutaron correctamente
2. Revisa los logs del servidor
3. Valida que tienes un token JWT válido
4. Comprueba que el cliente existe antes de crear contrato

---

## ✅ Checklist de Implementación

- [x] Migraciones SQL creadas
- [x] Modelos implementados
- [x] Controladores configurados
- [x] Rutas registradas
- [x] Integración en server.js
- [x] Scripts de prueba
- [x] Documentación completa
- [ ] Frontend (pendiente)
- [ ] Encriptación de tarjetas (pendiente)
- [ ] Generación de PDFs (pendiente)

---

**¡Sistema de contratos listo para usar! 🎉**
