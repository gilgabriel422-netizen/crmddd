# Actualización de la Tabla de Clientes

## ✅ Cambios Realizados

### Base de Datos (PostgreSQL)

Se actualizó la tabla `clientes` para incluir todos los campos requeridos por el frontend:

#### Campos Principales:
- ✅ `id` - SERIAL PRIMARY KEY
- ✅ `first_name` - VARCHAR(100) NOT NULL - Nombre del cliente
- ✅ `last_name` - VARCHAR(100) NOT NULL - Apellido del cliente
- ✅ `nombre` - VARCHAR(200) GENERATED ALWAYS - Campo calculado automáticamente (first_name + last_name)
- ✅ `email` - VARCHAR(100) UNIQUE NOT NULL - Email único
- ✅ `phone` - VARCHAR(20) - Teléfono principal
- ✅ `contract_number` - VARCHAR(50) UNIQUE NOT NULL - Número de contrato único
- ✅ `status` - VARCHAR(20) DEFAULT 'activo' - Estado del cliente

#### Campos Adicionales:
- `empresa` - VARCHAR(100) - Nombre de la empresa
- `telefono` - VARCHAR(20) - Teléfono alternativo
- `direccion` - TEXT - Dirección completa
- `ciudad` - VARCHAR(100) - Ciudad
- `pais` - VARCHAR(100) - País
- `usuario_asignado_id` - INTEGER - Usuario asignado (FK a usuarios)
- `notas` - TEXT - Notas adicionales
- `fecha_creacion` - TIMESTAMP - Fecha de creación
- `fecha_actualizacion` - TIMESTAMP - Fecha de última actualización

#### Estados Permitidos:
- `activo` (default)
- `inactivo`
- `moroso`
- `prospecto`
- `contactado`
- `calificado`
- `propuesta`
- `negociacion`
- `ganado`
- `perdido`

### Índices Creados:
- `idx_clientes_usuario` - Para búsquedas por usuario asignado
- `idx_clientes_status` - Para filtros por estado
- `idx_clientes_contract_number` - Para búsquedas por número de contrato
- `idx_clientes_email` - Para búsquedas por email

### Modelo (backend/models/Cliente.js)

Se actualizaron los métodos:

#### `create(clienteData)`
Ahora acepta:
```javascript
{
  first_name: String (requerido),
  last_name: String (requerido),
  email: String (requerido, único),
  phone: String (opcional),
  contract_number: String (requerido, único),
  status: String (default: 'activo'),
  empresa: String (opcional),
  telefono: String (opcional),
  direccion: String (opcional),
  ciudad: String (opcional),
  pais: String (opcional),
  usuario_asignado_id: Integer (opcional),
  notas: String (opcional)
}
```

Retorna el objeto cliente completo creado.

#### `update(id, clienteData)`
Actualiza cualquiera de los campos mencionados.

#### `search(query)`
Ahora busca también por `contract_number`.

### Controlador (backend/controllers/clientesController.js)

#### `createCliente(req, res)`
- Retorna el objeto completo del cliente creado
- Maneja errores de duplicado:
  - Email duplicado → 400: "Ya existe un cliente con ese email"
  - Número de contrato duplicado → 400: "Ya existe un cliente con ese número de contrato"

### Frontend

El formulario en `AddClientModal.jsx` ya está preparado para enviar:
- `first_name` ✅
- `last_name` ✅
- `email` ✅
- `phone` ✅
- `contract_number` ✅
- `status` ✅

## 🔄 Migración de Datos

Si tenías datos anteriores con el campo `nombre` (completo), necesitarás migrarlos:

```sql
-- Ejemplo de migración (si es necesario)
UPDATE clientes 
SET first_name = split_part(nombre, ' ', 1),
    last_name = substring(nombre from position(' ' in nombre) + 1);
```

## 🧪 Pruebas

Para probar la creación de un cliente:

```bash
curl -X POST http://localhost:5000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+34 600 111 222",
    "contract_number": "CONT-2024-005",
    "status": "activo"
  }'
```

## 📝 Datos de Ejemplo

La base de datos incluye 4 clientes de ejemplo:
1. Carlos Rodríguez (CONT-2024-001) - Tech Solutions SA
2. Ana Martínez (CONT-2024-002) - Global Imports
3. Luis Fernández (CONT-2024-003) - Innovatech
4. Elena Torres (CONT-2024-004) - Digital Marketing Pro

## ✅ Estado Actual

- ✅ Base de datos actualizada y funcionando
- ✅ Backend corriendo en http://localhost:5000
- ✅ Frontend preparado para consumir la API
- ✅ Validaciones de duplicados implementadas
- ✅ Índices optimizados para búsquedas rápidas

## 🚀 Próximos Pasos

1. Probar la creación de clientes desde el frontend
2. Verificar que las búsquedas funcionen correctamente
3. Implementar validaciones adicionales si es necesario
