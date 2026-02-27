const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ======================================================
// 📝 CONFIG LOG TO FILE
// ======================================================
const logFilePath = path.join(__dirname, 'server.log');
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
}

console.log = function(...args) {
  const message = args.join(' ');
  originalConsoleLog.apply(console, args);
  writeLog(message);
};

console.error = function(...args) {
  const message = args.join(' ');
  originalConsoleError.apply(console, args);
  writeLog(message);
};

// ======================================================
// 🔥 IMPORTAR SEQUELIZE Y MODELOS (ORDEN IMPORTANTE)
// ======================================================

const sequelize = require('./config/database');

// 🔥 MODELOS BASE (PRIMERO LOS PADRE)
require('./models/Cliente');        // ← ESTE FALTABA
require('./models/Usuario');
require('./models/Departamento');
require('./models/Locacion');

// 🔥 MODELOS QUE DEPENDEN DE OTROS
require('./models/ContratoFisico');
require('./models/Actividad');
require('./models/Contacto');
require('./models/Reserva');
require('./models/Punto');
require('./models/Paquete');
require('./models/Mensaje');
require('./models/Notificacion');
require('./models/ClientManagement');
require('./models/Payment');
require('./models/PaymentAgreement');

console.log('✅ Sequelize models loaded');

const app = express();

// ======================================================
// ✅ CORS CONFIGURACIÓN
// ======================================================

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

console.log('✅ Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log('🌍 CORS check - Origin:', origin);

    if (!origin) {
      console.log('✅ No origin (same-site)');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin permitido');
      callback(null, true);
    } else {
      console.log('⛔ Bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ======================================================
// � LOG TODAS LAS REQUESTS
// ======================================================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body keys: ${Object.keys(req.body).join(', ')}`);
  }
  next();
});

// ======================================================
// �📦 IMPORTAR RUTAS
// ======================================================

app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/contactos', require('./routes/contactos'));
app.use('/api/actividades', require('./routes/actividades'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/contratos', require('./routes/contratoRoutes'));
app.use('/api/contratos-fisicos', require('./routes/contratos-fisicos'));
app.use('/api/paquetes', require('./routes/paquetes'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/mensajes', require('./routes/mensajes'));
app.use('/api/locaciones', require('./routes/locaciones'));
app.use('/api/departamentos', require('./routes/departamentos'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/puntos', require('./routes/puntos'));
app.use('/api/client-managements', require('./routes/client-managements'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/beneficios', require('./routes/beneficios'));
app.use('/api/cartas', require('./routes/cartas'));
app.use('/api/adjuntos', require('./routes/adjuntosRoutes'));
app.use('/api/plantillas', require('./routes/plantillasRoutes'));

// Mock routes
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/payment-agreements', require('./routes/payment-agreements'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/audit-logs', require('./routes/audit-logs'));
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/reservation-agenda', require('./routes/reservation-agenda'));
app.use('/api/visa-agenda', require('./routes/visa-agenda'));
app.use('/api/flight-agenda', require('./routes/flight-agenda'));
app.use('/api/client-transfers', require('./routes/client-transfers'));

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de debug - para ver logs del servidor
app.get('/debug/logs', (req, res) => {
  try {
    const fs = require('fs');
    const logPath = path.join(__dirname, 'server.log');
    if (fs.existsSync(logPath)) {
      const logs = fs.readFileSync(logPath, 'utf-8').split('\n').slice(-50);
      res.json({ logs });
    } else {
      res.json({ message: 'No logs yet', logs: [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ mensaje: 'API CRM funcionando correctamente 🚀' });
});

// ======================================================
// ⚠️ MANEJO GLOBAL DE ERRORES (DEBE SER AL FINAL)
// ======================================================

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.path}` });
});

// Error handler (SIEMPRE al final)
app.use((err, req, res, next) => {
  console.error('❌ Error global - Mensaje:', err.message);
  console.error('❌ Error global - Stack:', err.stack);
  res.status(500).json({ 
    error: err.message,
    endpoint: `${req.method} ${req.path}`
  });
});

// ======================================================
// 🚀 INICIAR SERVIDOR
// ======================================================

const PORT = process.env.PORT || 5000;

async function iniciar() {
  try {
    // Intentar conectar a la BD
    try {
      const auth = await sequelize.authenticate();
      console.log('✅ Conexión a BD exitosa');
      
      await sequelize.sync({ alter: false });
      console.log('✅ Base de datos sincronizada');
    } catch (dbError) {
      console.warn('⚠️  BD no disponible, iniciando servidor sin sincronización');
      console.warn('   Error:', dbError.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error crítico al iniciar servidor:', error.message);
    process.exit(1);
  }
}

iniciar();