# 📋 Plan de Unificación: GB + Miguel → Entregable

## 🎯 Objetivo

Unificar los proyectos `gb/innovationbussines` y `miguel/innovationbussines` en la carpeta `Entregable`, manteniendo:
- ✅ Base del proyecto: **GB** (contratos, beneficios, reportes)
- ✅ Sistema de **Puntos** de Miguel
- ✅ Sistema de **Contratos y Beneficios** de GB
- ✅ Unificar schemas: cambiar `años` → `anos` (mantener consistencia con GB)

---

## 📊 Resumen de Funcionalidades a Integrar

### De GB (Base Principal)
- ✅ Sistema completo de contratos (ContratoViaje, Tarjeta, AutorizacionPago)
- ✅ Sistema de beneficios (Beneficio, ConsumoBeneficio)
- ✅ Reportes reales (`/api/reportes`)
- ✅ Cartas y adjuntos
- ✅ Plantillas de contratos (JSON + generación PDF con Puppeteer)
- ✅ Páginas: GestionContratos, Reservas, Beneficios, EnviarAtencion, BandejaMensajesSoporte
- ✅ Componentes: BeneficiosAdmin, BeneficiosCliente, VisorPlantillaContrato, etc.

### De Miguel (A Integrar)
- ✅ Sistema de puntos (modelo Punto, rutas `/api/puntos`, controller, frontend service)
- ✅ Client Managements (modelo ClientManagement, rutas `/api/client-managements`)
- ✅ Modelos Payment y PaymentAgreement (aunque GB tiene rutas mock, miguel tiene modelos reales)
- ✅ Componentes frontend: Calendar3DModal, HistorialReservasModal, NochesNacionales, SolicitarReservaList
- ✅ Frontend service: `pointsService.js`

---

## 🔧 Pasos de Unificación

### FASE 1: Preparación y Copia Base

#### 1.1 Copiar estructura completa de GB a Entregable
```
Entregable/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   │   ├── migrations/
│   │   └── schema.sql
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── ... (todos los archivos de GB)
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── contexts/
    │   └── ...
    ├── public/
    ├── package.json
    └── ...
```

**Archivos a copiar:**
- Todo el contenido de `gb/innovationbussines/backend/` → `Entregable/backend/`
- Todo el contenido de `gb/innovationbussines/frontend/` → `Entregable/frontend/`
- Archivos de configuración: `.gitignore`, scripts de setup, etc.

---

### FASE 2: Integración del Sistema de Puntos (Miguel)

#### 2.1 Backend - Modelo Punto
**Archivo:** `Entregable/backend/models/Punto.js`
- ✅ Copiar desde: `miguel/innovationbussines/backend/models/Punto.js`
- ✅ Verificar que use `sequelize` correctamente (GB usa Sequelize)

#### 2.2 Backend - Controller de Puntos
**Archivo:** `Entregable/backend/controllers/puntosController.js`
- ✅ Copiar desde: `miguel/innovationbussines/backend/controllers/puntosController.js`
- ✅ Verificar imports y referencias a modelos

#### 2.3 Backend - Rutas de Puntos
**Archivo:** `Entregable/backend/routes/puntos.js`
- ✅ Copiar desde: `miguel/innovationbussines/backend/routes/puntos.js`

#### 2.4 Backend - Registrar rutas en server.js
**Archivo:** `Entregable/backend/server.js`
- ✅ Agregar import: `const puntosRoutes = require('./routes/puntos');`
- ✅ Agregar ruta: `app.use('/api/puntos', puntosRoutes);`
- ✅ Agregar import del modelo: `const Punto = require('./models/Punto');` (si es necesario para sync)

#### 2.5 Backend - Schema SQL
**Archivo:** `Entregable/backend/database/schema.sql`
- ✅ Agregar tabla `puntos`:
```sql
CREATE TABLE IF NOT EXISTS puntos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER,
  email VARCHAR(100),
  puntos INTEGER DEFAULT 0,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.6 Frontend - Service de Puntos
**Archivo:** `Entregable/frontend/src/services/pointsService.js`
- ✅ Crear nuevo service basado **solo en backend** (sin localStorage)
- ✅ Usar el servicio API de GB (`services/api.js`) para todas las operaciones
- ✅ Implementar funciones que consuman directamente `/api/puntos`
- ⚠️ **NO usar localStorage** - todo debe ir al backend (decisión técnica #2)

#### 2.7 Frontend - Integrar pointsService en componentes
- ✅ Buscar componentes en Miguel que usen puntos y adaptarlos si es necesario
- ✅ Verificar que el servicio se conecte correctamente con el backend

---

### FASE 3: Integración de Client Managements (Miguel)

#### 3.1 Backend - Modelo ClientManagement
**Archivo:** `Entregable/backend/models/ClientManagement.js`
- ✅ Crear modelo en Sequelize (convertir desde Miguel)
- ✅ **DECISIÓN TOMADA:** Convertir a Sequelize (decisión técnica #1)
- ✅ Seguir el patrón de modelos de GB (usar Sequelize, no pg-pool)

#### 3.2 Backend - Rutas de Client Managements
**Archivo:** `Entregable/backend/routes/client-managements.js`
- ✅ Copiar desde: `miguel/innovationbussines/backend/routes/client-managements.js`
- ✅ Adaptar si se convierte a Sequelize

#### 3.3 Backend - Registrar rutas en server.js
**Archivo:** `Entregable/backend/server.js`
- ✅ Agregar import: `const clientManagementsRoutes = require('./routes/client-managements');`
- ✅ Agregar ruta: `app.use('/api/client-managements', clientManagementsRoutes);`

#### 3.4 Backend - Schema SQL
**Archivo:** `Entregable/backend/database/schema.sql`
- ✅ Agregar tabla `client_managements`:
```sql
CREATE TABLE IF NOT EXISTS client_managements (
  id SERIAL PRIMARY KEY,
  client_id INTEGER,
  type TEXT,
  from_user TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### FASE 4: Integración de Payment y PaymentAgreement (Miguel)

#### 4.1 Backend - Modelos Payment y PaymentAgreement
**Archivos:**
- `Entregable/backend/models/Payment.js`
- `Entregable/backend/models/PaymentAgreement.js`
- ✅ Crear modelos en Sequelize (convertir desde Miguel)
- ✅ **DECISIÓN TOMADA:** Convertir a Sequelize (decisión técnica #1)
- ✅ Seguir el patrón de modelos de GB (usar Sequelize, no pg-pool)

#### 4.2 Backend - Schema SQL
**Archivo:** `Entregable/backend/database/schema.sql`
- ✅ Agregar tablas `payments` y `payment_agreements`:
```sql
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER,
  payment_amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_agreements (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  contract_number TEXT,
  total_amount NUMERIC(12,2) NOT NULL,
  installment_count INTEGER NOT NULL,
  installment_amount NUMERIC(12,2) NOT NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.3 Backend - Rutas existentes
- ✅ GB ya tiene rutas mock en `routes/payments.js` y `routes/payment-agreements.js`
- ✅ **DECISIÓN TOMADA:** Reemplazar mocks con implementación real de Miguel (decisión técnica #3)
- ✅ Usar los modelos Payment y PaymentAgreement convertidos a Sequelize

---

### FASE 5: Unificación de Schemas (años → anos)

#### 5.1 Backend - Schema SQL Principal
**Archivo:** `Entregable/backend/database/schema.sql`
- ✅ **VERIFICAR:** Ya debe tener `anos` y `anos_indefinido` (viene de GB)
- ✅ Si hay referencias a `años`, cambiarlas a `anos`

#### 5.2 Backend - Modelos Sequelize
**Archivo:** `Entregable/backend/models/Cliente.js`
- ✅ Verificar que use `anos` y `anos_indefinido` (no `años`)
- ✅ Si viene de Miguel, cambiar todas las referencias

#### 5.3 Backend - Controllers y Rutas
- ✅ Buscar referencias a `años` en todos los archivos:
  ```bash
  grep -r "años" backend/
  ```
- ✅ Reemplazar por `anos` en:
  - Controllers
  - Routes
  - Scripts de migración
  - Cualquier archivo que referencie la columna

#### 5.4 Frontend - Componentes y Páginas
- ✅ Buscar referencias a `años` en frontend:
  ```bash
  grep -r "años" frontend/src/
  ```
- ✅ Reemplazar por `anos` en:
  - Componentes React
  - Páginas
  - Servicios API
  - Cualquier referencia a la propiedad del cliente

---

### FASE 6: Integración de Componentes Frontend (Miguel)

#### 6.1 Componentes a Copiar
**Desde:** `miguel/innovationbussines/frontend/src/components/`
**Hacia:** `Entregable/frontend/src/components/`

- ✅ `Calendar3DModal.jsx`
- ✅ `HistorialReservasModal.jsx`
- ✅ `NochesNacionales.jsx`
- ✅ `SolicitarReservaList.jsx` (si no existe ya)

#### 6.2 Verificar Dependencias
- ✅ Revisar imports en estos componentes
- ✅ Verificar que las dependencias estén en `package.json`
- ✅ Adaptar imports si hay diferencias en estructura de servicios

#### 6.3 Integrar en App.jsx
- ✅ Revisar si estos componentes necesitan rutas nuevas
- ✅ Agregar imports lazy si es necesario
- ✅ Verificar que no haya conflictos con componentes similares de GB

---

### FASE 7: Verificación y Ajustes

#### 7.1 Backend - Verificar server.js
**Archivo:** `Entregable/backend/server.js`
- ✅ Todos los modelos importados
- ✅ Todas las rutas registradas:
  - `/api/puntos` ✅
  - `/api/client-managements` ✅
  - `/api/contratos` ✅ (de GB)
  - `/api/beneficios` ✅ (de GB)
  - `/api/reportes` ✅ (de GB)
  - `/api/cartas` ✅ (de GB)
  - `/api/adjuntos` ✅ (de GB)
  - `/api/plantillas` ✅ (de GB)
  - `/api/payments` ✅ (actualizar con modelos reales)
  - `/api/payment-agreements` ✅ (actualizar con modelos reales)

#### 7.2 Backend - Verificar package.json
**Archivo:** `Entregable/backend/package.json`
- ✅ Todas las dependencias necesarias:
  - `puppeteer` ✅ (de GB, para contratos PDF)
  - `sequelize`, `pg`, `pg-hstore` ✅
  - `bcryptjs`, `jsonwebtoken` ✅
  - `multer` ✅ (para adjuntos)
  - Otras dependencias de GB

#### 7.3 Frontend - Verificar App.jsx
**Archivo:** `Entregable/frontend/src/App.jsx`
- ✅ Todas las rutas de GB presentes
- ✅ Rutas de puntos integradas (si hay páginas)
- ✅ Componentes lazy loading correctos

#### 7.4 Frontend - Verificar package.json
**Archivo:** `Entregable/frontend/package.json`
- ✅ Dependencias de GB presentes
- ✅ Dependencias adicionales si los componentes de Miguel las requieren

#### 7.5 Base de Datos - Migraciones
**Archivo:** `Entregable/backend/database/migrations/`
- ✅ Crear migración para tabla `puntos`:
  - `create-puntos-table.sql`
- ✅ Crear migración para tabla `client_managements`:
  - `create-client-managements-table.sql`
- ✅ Crear migración para tablas `payments` y `payment_agreements`:
  - `create-payments-tables.sql`
- ✅ Verificar migración de rename `años` → `anos` (ya existe en GB: `rename-anos-columns.sql`)

---

### FASE 8: Testing y Validación

#### 8.1 Backend - Tests
- ✅ Ejecutar tests existentes de GB
- ✅ Crear tests para puntos (basados en estructura de Miguel si existen)
- ✅ Verificar que todas las rutas respondan correctamente

#### 8.2 Frontend - Verificación Manual
- ✅ Login funciona
- ✅ Panel admin carga
- ✅ Sistema de contratos funciona (GB)
- ✅ Sistema de beneficios funciona (GB)
- ✅ Sistema de puntos funciona (Miguel)
- ✅ Componentes de Miguel se renderizan correctamente

#### 8.3 Base de Datos - Verificación
- ✅ Todas las tablas se crean correctamente
- ✅ Columnas `anos` y `anos_indefinido` existen (no `años`)
- ✅ Relaciones entre tablas funcionan
- ✅ Datos de prueba se insertan correctamente

---

## 📝 Checklist de Archivos a Copiar/Modificar

### Backend - Archivos Nuevos (de Miguel)
- [ ] `backend/models/Punto.js`
- [ ] `backend/models/ClientManagement.js` (convertir a Sequelize)
- [ ] `backend/models/Payment.js` (convertir a Sequelize)
- [ ] `backend/models/PaymentAgreement.js` (convertir a Sequelize)
- [ ] `backend/controllers/puntosController.js`
- [ ] `backend/routes/puntos.js`
- [ ] `backend/routes/client-managements.js`

### Backend - Archivos a Modificar
- [ ] `backend/server.js` (agregar rutas de puntos y client-managements)
- [ ] `backend/database/schema.sql` (agregar tablas nuevas, verificar `anos`)
- [ ] `backend/routes/payments.js` (reemplazar mock con implementación real)
- [ ] `backend/routes/payment-agreements.js` (reemplazar mock con implementación real)
- [ ] `backend/models/Cliente.js` (verificar `anos` vs `años`)

### Frontend - Archivos Nuevos (de Miguel)
- [ ] `frontend/src/services/pointsService.js`
- [ ] `frontend/src/components/Calendar3DModal.jsx`
- [ ] `frontend/src/components/HistorialReservasModal.jsx`
- [ ] `frontend/src/components/NochesNacionales.jsx`
- [ ] `frontend/src/components/SolicitarReservaList.jsx` (si no existe)

### Frontend - Archivos a Modificar
- [ ] `frontend/src/App.jsx` (verificar rutas, agregar componentes si es necesario)
- [ ] Componentes que usen `años` → cambiar a `anos`

### Migraciones SQL Nuevas
- [ ] `backend/database/migrations/create-puntos-table.sql`
- [ ] `backend/database/migrations/create-client-managements-table.sql`
- [ ] `backend/database/migrations/create-payments-tables.sql`

---

## ✅ Decisiones Técnicas Tomadas

### 1. ClientManagement, Payment, PaymentAgreement: Sequelize vs pg-pool
**Decisión:** ✅ **Convertir a Sequelize**

**Razón:** Para mantener consistencia con el resto del proyecto GB y facilitar el mantenimiento. Todos los modelos usarán el mismo ORM (Sequelize).

**Acción:** Los modelos de Miguel (`ClientManagement.js`, `Payment.js`, `PaymentAgreement.js`) que actualmente usan `pg-pool` serán convertidos a Sequelize siguiendo el patrón de los modelos de GB.

---

### 2. PointsService: localStorage vs Backend
**Decisión:** ✅ **Solo Backend (sin localStorage)**

**Razón:** 
- El proyecto se desplegará en **S3 (frontend) + EC2 (backend)**
- Necesitamos una única fuente de verdad centralizada en el backend
- Mejor organización y consistencia de datos
- Facilita auditorías y reportes

**Acción:** El `pointsService.js` será completamente basado en backend, consumiendo la API `/api/puntos`. No se usará localStorage como cache ni como fuente de datos.

---

### 3. Rutas Mock de Payments
**Decisión:** ✅ **Usar implementación real de Miguel**

**Razón:** Los modelos reales de Miguel proporcionan funcionalidad completa para payments y payment agreements, mientras que GB solo tiene mocks básicos.

**Acción:** Reemplazar las rutas mock de GB (`routes/payments.js` y `routes/payment-agreements.js`) con la implementación real de Miguel, adaptada a Sequelize según la decisión #1.

---

## 🚀 Orden de Ejecución Recomendado

1. **FASE 1:** Copiar base completa de GB a Entregable
2. **FASE 5:** Unificar schemas (años → anos) primero para evitar conflictos
3. **FASE 2:** Integrar sistema de puntos (más simple, menos dependencias)
4. **FASE 3:** Integrar client managements
5. **FASE 4:** Integrar payments y payment agreements
6. **FASE 6:** Integrar componentes frontend
7. **FASE 7:** Verificación completa
8. **FASE 8:** Testing

---

## 📚 Referencias

- **GB Backend:** `gb/innovationbussines/backend/`
- **GB Frontend:** `gb/innovationbussines/frontend/`
- **Miguel Backend:** `miguel/innovationbussines/backend/`
- **Miguel Frontend:** `miguel/innovationbussines/frontend/`

---

## ✅ Resultado Final Esperado

Un proyecto unificado en `Entregable/` que incluye:

✅ **Sistema completo de contratos** (GB)  
✅ **Sistema de beneficios** (GB)  
✅ **Sistema de puntos** (Miguel)  
✅ **Reportes reales** (GB)  
✅ **Client managements** (Miguel)  
✅ **Payments y agreements** (Miguel, con implementación real)  
✅ **Schemas unificados** (`anos` en lugar de `años`)  
✅ **Todos los componentes frontend** de ambos proyectos  
✅ **Base de datos consistente** con todas las tablas necesarias  

---

**Fecha de creación:** 2026-02-08  
**Última actualización:** 2026-02-08  
**Estado:** ✅ Plan actualizado con decisiones técnicas confirmadas, listo para ejecución

### 📝 Notas de Actualización

- ✅ **Decisiones técnicas confirmadas y documentadas:**
  1. ClientManagement, Payment, PaymentAgreement → Sequelize
  2. PointsService → Solo backend (sin localStorage)
  3. Rutas de Payments → Implementación real de Miguel

- ✅ Todos los documentos han sido actualizados para reflejar estas decisiones.
