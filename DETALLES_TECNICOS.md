# 🔧 Detalles Técnicos de Unificación

## 📋 Cambios Específicos de Código

---

## 1. Backend - server.js

### Cambios a realizar:

```javascript
// AGREGAR después de los otros imports de modelos (línea ~22)
const Punto = require('./models/Punto');

// AGREGAR después de los otros imports de rutas (línea ~50)
const puntosRoutes = require('./routes/puntos');
const clientManagementsRoutes = require('./routes/client-managements');

// AGREGAR después de las otras rutas de innovation (línea ~81)
app.use('/api/puntos', puntosRoutes);
app.use('/api/client-managements', clientManagementsRoutes);
```

**Ubicación exacta:** Después de `app.use('/api/reservas', reservasRoutes);` y antes de las rutas mock.

---

## 2. Backend - database/schema.sql

### Tablas a agregar al final del archivo:

```sql
-- Tabla de puntos (sistema de compensación)
CREATE TABLE IF NOT EXISTS puntos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER,
  email VARCHAR(100),
  puntos INTEGER DEFAULT 0,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de client managements
CREATE TABLE IF NOT EXISTS client_managements (
  id SERIAL PRIMARY KEY,
  client_id INTEGER,
  type TEXT,
  from_user TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de payments
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

-- Tabla de payment agreements
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

**Verificación:** Asegurarse de que la tabla `clientes` tenga `anos` y `anos_indefinido` (no `años`).

---

## 3. Backend - models/Punto.js

### Archivo completo a crear:

```javascript
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Punto = sequelize.define('Punto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  puntos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'puntos',
  timestamps: false
});

module.exports = Punto;
```

**Fuente:** `miguel/innovationbussines/backend/models/Punto.js`

---

## 4. Backend - controllers/puntosController.js

### Archivo completo a crear:

```javascript
const Punto = require('../models/Punto');

exports.getByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const punto = await Punto.findOne({ where: { email } });
    if (!punto) return res.json({ email, puntos: 0 });
    res.json({ email: punto.email, puntos: punto.puntos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo puntos' });
  }
}

exports.setPoints = async (req, res) => {
  try {
    const { email, cliente_id, puntos } = req.body;
    const [record, created] = await Punto.findOrCreate({ 
      where: { email }, 
      defaults: { cliente_id, puntos } 
    });
    if (!created) {
      record.puntos = Number(puntos || 0);
      record.cliente_id = cliente_id || record.cliente_id;
      record.actualizado_en = new Date();
      await record.save();
    }
    res.json({ email: record.email, puntos: record.puntos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error seteando puntos' });
  }
}

exports.addPoints = async (req, res) => {
  try {
    const { email } = req.params;
    const { delta } = req.body;
    const [record] = await Punto.findOrCreate({ 
      where: { email }, 
      defaults: { puntos: 0 } 
    });
    record.puntos = Number(record.puntos || 0) + Number(delta || 0);
    record.actualizado_en = new Date();
    await record.save();
    res.json({ email: record.email, puntos: record.puntos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sumando puntos' });
  }
}

exports.clearAll = async (req, res) => {
  try {
    await Punto.destroy({ where: {} });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error limpiando puntos' });
  }
}
```

**Fuente:** `miguel/innovationbussines/backend/controllers/puntosController.js`

---

## 5. Backend - routes/puntos.js

### Archivo completo a crear:

```javascript
const express = require('express');
const router = express.Router();
const puntosController = require('../controllers/puntosController');

router.get('/:email', puntosController.getByEmail);
router.post('/', puntosController.setPoints);
router.patch('/:email/add', puntosController.addPoints);
router.delete('/clear', puntosController.clearAll);

module.exports = router;
```

**Fuente:** `miguel/innovationbussines/backend/routes/puntos.js`

---

## 6. Backend - models/ClientManagement.js (CONVERTIR A SEQUELIZE)

### Archivo a crear (versión Sequelize):

```javascript
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * ClientManagement Model - Convertido a Sequelize
 * 
 * DECISIÓN TÉCNICA: Convertir de pg-pool a Sequelize para consistencia
 * con el resto del proyecto GB.
 */
const ClientManagement = sequelize.define('ClientManagement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  from_user: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'client_managements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ClientManagement;
```

**Nota:** Convertido de pg-pool a Sequelize para consistencia con GB (decisión técnica #1).

---

## 7. Backend - routes/client-managements.js (ADAPTAR A SEQUELIZE)

### Archivo a crear:

```javascript
const express = require('express');
const router = express.Router();
const ClientManagement = require('../models/ClientManagement');

// Create a new client management
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const created = await ClientManagement.create(data);
    res.json({ management: created });
  } catch (err) {
    console.error('Error creating client management', err);
    res.status(500).json({ error: 'Error creating client management' });
  }
});

// List client managements (optional filter by client_id)
router.get('/', async (req, res) => {
  try {
    const clientId = req.query.client_id || null;
    const where = clientId ? { client_id: clientId } : {};
    const items = await ClientManagement.findAll({ 
      where,
      order: [['created_at', 'DESC']]
    });
    res.json({ managements: items });
  } catch (err) {
    console.error('Error fetching client managements', err);
    res.status(500).json({ error: 'Error fetching client managements' });
  }
});

module.exports = router;
```

**Nota:** Adaptado de pg-pool a Sequelize.

---

## 8. Backend - models/Payment.js (CONVERTIR A SEQUELIZE)

### Archivo a crear:

```javascript
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Payment Model - Convertido a Sequelize
 * 
 * DECISIÓN TÉCNICA: Convertir de pg-pool a Sequelize para consistencia
 * con el resto del proyecto GB.
 */
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  payment_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  payment_method: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receipt_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Payment;
```

---

## 9. Backend - models/PaymentAgreement.js (CONVERTIR A SEQUELIZE)

### Archivo a crear:

```javascript
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * PaymentAgreement Model - Convertido a Sequelize
 * 
 * DECISIÓN TÉCNICA: Convertir de pg-pool a Sequelize para consistencia
 * con el resto del proyecto GB.
 */
const PaymentAgreement = sequelize.define('PaymentAgreement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contract_number: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  installment_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  installment_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: 'active'
  }
}, {
  tableName: 'payment_agreements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = PaymentAgreement;
```

---

## 10. Backend - routes/payments.js (REEMPLAZAR MOCK CON IMPLEMENTACIÓN REAL)

### Cambios a realizar:

**Archivo actual:** GB tiene un mock básico.

**DECISIÓN TÉCNICA:** Reemplazar mock con implementación real de Miguel (decisión técnica #3).

**Reemplazar con implementación real:**

```javascript
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// Crear un pago
router.post('/', async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.json({ payment });
  } catch (err) {
    console.error('Error creating payment', err);
    res.status(500).json({ error: 'Error creating payment' });
  }
});

// Obtener pagos por cliente
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const payments = await Payment.findAll({
      where: { client_id: clientId },
      order: [['payment_date', 'DESC']]
    });
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payments', err);
    res.status(500).json({ error: 'Error fetching payments' });
  }
});

// Obtener todos los pagos (con filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.payment_date = {
        [Op.between]: [startDate, endDate]
      };
    }
    const payments = await Payment.findAll({
      where,
      order: [['payment_date', 'DESC']]
    });
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payments', err);
    res.status(500).json({ error: 'Error fetching payments' });
  }
});

module.exports = router;
```

**Nota:** Agregar `const { Op } = require('sequelize');` al inicio si se usa `Op.between`.

---

## 11. Backend - routes/payment-agreements.js (REEMPLAZAR MOCK CON IMPLEMENTACIÓN REAL)

### Cambios similares a payments.js:

**DECISIÓN TÉCNICA:** Reemplazar mock con implementación real de Miguel (decisión técnica #3).

```javascript
const express = require('express');
const router = express.Router();
const PaymentAgreement = require('../models/PaymentAgreement');

// Crear acuerdo de pago
router.post('/', async (req, res) => {
  try {
    const agreement = await PaymentAgreement.create(req.body);
    res.json({ agreement });
  } catch (err) {
    console.error('Error creating payment agreement', err);
    res.status(500).json({ error: 'Error creating payment agreement' });
  }
});

// Obtener acuerdos por cliente
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const agreements = await PaymentAgreement.findAll({
      where: { client_id: clientId },
      order: [['created_at', 'DESC']]
    });
    res.json({ agreements });
  } catch (err) {
    console.error('Error fetching payment agreements', err);
    res.status(500).json({ error: 'Error fetching payment agreements' });
  }
});

// Obtener todos los acuerdos
router.get('/', async (req, res) => {
  try {
    const agreements = await PaymentAgreement.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json({ agreements });
  } catch (err) {
    console.error('Error fetching payment agreements', err);
    res.status(500).json({ error: 'Error fetching payment agreements' });
  }
});

module.exports = router;
```

---

## 12. Frontend - services/pointsService.js

### Archivo completo a crear (SOLO BACKEND - sin localStorage):

```javascript
import api from './api';

/**
 * PointsService - Sistema de puntos basado completamente en backend
 * 
 * DECISIÓN TÉCNICA: Solo backend (sin localStorage)
 * Razón: Proyecto se desplegará en S3 + EC2, necesitamos fuente de verdad centralizada
 */

// Obtener puntos desde backend
export async function getPointsForUser(email) {
  if (!email) return 0;
  
  try {
    const response = await api.get(`/puntos/${email}`);
    return response.data.puntos || 0;
  } catch (err) {
    console.error('Error fetching points from backend', err);
    // Retornar 0 si hay error (no usar cache local)
    return 0;
  }
}

// Establecer puntos en backend
export async function setPointsForUser(email, amount, cliente_id = null) {
  if (!email) {
    throw new Error('Email es requerido para establecer puntos');
  }
  
  try {
    const response = await api.post('/puntos', { 
      email, 
      puntos: amount, 
      cliente_id 
    });
    return response.data.puntos;
  } catch (err) {
    console.error('Error setting points in backend', err);
    throw err;
  }
}

// Agregar puntos en backend
export async function addPointsForUser(email, delta) {
  if (!email) {
    throw new Error('Email es requerido para agregar puntos');
  }
  
  try {
    const response = await api.patch(`/puntos/${email}/add`, { delta });
    return response.data.puntos;
  } catch (err) {
    console.error('Error adding points in backend', err);
    throw err;
  }
}

// Limpiar todos los puntos (solo admin)
export async function clearAllPoints() {
  try {
    const response = await api.delete('/puntos/clear');
    return response.data.ok;
  } catch (err) {
    console.error('Error clearing all points', err);
    throw err;
  }
}

export default {
  getPointsForUser,
  setPointsForUser,
  addPointsForUser,
  clearAllPoints
};
```

**Nota:** Versión completamente basada en backend. No se usa localStorage para mantener consistencia con el despliegue en S3 + EC2 y tener una única fuente de verdad centralizada.

---

## 13. Frontend - Componentes a Copiar

### Archivos a copiar desde Miguel:

1. **Calendar3DModal.jsx**
   - Origen: `miguel/innovationbussines/frontend/src/components/Calendar3DModal.jsx`
   - Destino: `Entregable/frontend/src/components/Calendar3DModal.jsx`

2. **HistorialReservasModal.jsx**
   - Origen: `miguel/innovationbussines/frontend/src/components/HistorialReservasModal.jsx`
   - Destino: `Entregable/frontend/src/components/HistorialReservasModal.jsx`

3. **NochesNacionales.jsx**
   - Origen: `miguel/innovationbussines/frontend/src/components/NochesNacionales.jsx`
   - Destino: `Entregable/frontend/src/components/NochesNacionales.jsx`

4. **SolicitarReservaList.jsx**
   - Origen: `miguel/innovationbussines/frontend/src/components/SolicitarReservaList.jsx`
   - Destino: `Entregable/frontend/src/components/SolicitarReservaList.jsx`
   - **Verificar:** Si GB ya tiene `SolicitarReserva.jsx`, comparar y decidir cuál mantener o fusionar.

---

## 14. Búsqueda y Reemplazo: años → anos

### Comandos para buscar referencias:

```bash
# Backend
grep -r "años" backend/ --include="*.js" --include="*.sql"
grep -r "años_indefinido" backend/ --include="*.js" --include="*.sql"

# Frontend
grep -r "años" frontend/src/ --include="*.jsx" --include="*.js"
grep -r "años_indefinido" frontend/src/ --include="*.jsx" --include="*.js"
```

### Archivos a revisar y cambiar:

**Backend:**
- `backend/models/Cliente.js` - Verificar propiedades del modelo
- `backend/controllers/clientesController.js` - Verificar referencias
- `backend/routes/clientes.js` - Verificar si hay validaciones
- `backend/database/schema.sql` - Ya debe estar con `anos` (viene de GB)

**Frontend:**
- `frontend/src/components/*.jsx` - Cualquier componente que muestre o use `años`
- `frontend/src/pages/*.jsx` - Páginas que muestren información de cliente
- `frontend/src/services/api.js` - Verificar si hay referencias en llamadas API

### Reemplazos específicos:

```javascript
// ANTES (Miguel)
cliente.años
cliente.años_indefinido

// DESPUÉS (Unificado)
cliente.anos
cliente.anos_indefinido
```

---

## 15. Migraciones SQL a Crear

### backend/database/migrations/create-puntos-table.sql

```sql
-- Migración: Crear tabla de puntos
CREATE TABLE IF NOT EXISTS puntos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER,
  email VARCHAR(100),
  puntos INTEGER DEFAULT 0,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_puntos_email ON puntos(email);
CREATE INDEX IF NOT EXISTS idx_puntos_cliente_id ON puntos(cliente_id);
```

### backend/database/migrations/create-client-managements-table.sql

```sql
-- Migración: Crear tabla de client managements
CREATE TABLE IF NOT EXISTS client_managements (
  id SERIAL PRIMARY KEY,
  client_id INTEGER,
  type TEXT,
  from_user TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_managements_client_id ON client_managements(client_id);
```

### backend/database/migrations/create-payments-tables.sql

```sql
-- Migración: Crear tablas de payments y payment agreements
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

CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_agreements_client_id ON payment_agreements(client_id);
```

---

## 16. Verificación Final

### Checklist de verificación:

**Backend:**
- [ ] `server.js` tiene todas las rutas registradas
- [ ] Todos los modelos están importados en `server.js`
- [ ] `schema.sql` tiene todas las tablas nuevas
- [ ] Migraciones SQL creadas y probadas
- [ ] No hay referencias a `años` (solo `anos`)

**Frontend:**
- [ ] `pointsService.js` está en `services/`
- [ ] Componentes de Miguel copiados
- [ ] `App.jsx` tiene todas las rutas necesarias
- [ ] No hay referencias a `años` en componentes/páginas

**Base de Datos:**
- [ ] Todas las tablas se crean correctamente
- [ ] Columnas `anos` y `anos_indefinido` existen en `clientes`
- [ ] Relaciones funcionan correctamente

---

**Última actualización:** 2026-02-08
