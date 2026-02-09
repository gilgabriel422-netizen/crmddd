const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API CRM Innovation Business funcionando correctamente',
    status: 'ok'
  });
});

// Rutas de health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Mock de rutas iniciales
const mockRoutes = [
  '/api/clientes',
  '/api/paquetes',
  '/api/chatbot',
  '/api/locaciones',
  '/api/departamentos',
  '/api/contratos-fisicos',
  '/api/reservas'
];

mockRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.json({ 
      message: `Endpoint ${route} - Servicio disponible`,
      data: []
    });
  });
  
  app.post(route, (req, res) => {
    res.json({ 
      message: `POST ${route} - Recurso creado`,
      success: true
    });
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error en el servidor', message: err.message });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`\n✅ Servidor API CRM corriendo en http://localhost:${PORT}`);
  console.log(`📍 Base de datos será sincronizada cuando esté disponible`);
  console.log(`🌐 CORS habilitado para todos los orígenes`);
  console.log(`⏱️  ${new Date().toLocaleString()}\n`);
});

server.on('error', (error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});
