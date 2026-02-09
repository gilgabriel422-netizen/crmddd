#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

console.log('🚀 Iniciando servidor...');
console.log(`⏱️  ${new Date().toLocaleString()}`);

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('✅ Express configurado');

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API CRM Innovation Business funcionando',
    status: 'ok',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

console.log('✅ Rutas básicas configuradas');

// Intentar importar rutas
try {
  const clientesRoutes = require('./routes/clientes');
  const paquetesRoutes = require('./routes/paquetes');
  const chatbotRoutes = require('./routes/chatbot');
  const locacionesRoutes = require('./routes/locaciones');
  const departamentosRoutes = require('./routes/departamentos');
  const contratosFisicosRoutes = require('./routes/contratos-fisicos');
  const reservasRoutes = require('./routes/reservas');
  
  // Usar rutas
  app.use('/api/clientes', clientesRoutes);
  app.use('/api/paquetes', paquetesRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  app.use('/api/locaciones', locacionesRoutes);
  app.use('/api/departamentos', departamentosRoutes);
  app.use('/api/contratos-fisicos', contratosFisicosRoutes);
  app.use('/api/reservas', reservasRoutes);
  
  console.log('✅ Rutas de innovation cargadas');
} catch (err) {
  console.warn('⚠️  No se pudieron cargar algunas rutas:', err.message);
  console.log('    El servidor continuará con funcionalidad limitada');
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Error en el servidor', message: err.message });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

try {
  const server = app.listen(PORT, HOST, () => {
    console.log(`\n✅✅✅ SERVIDOR INICIADO CORRECTAMENTE ✅✅✅`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📍 Host: ${HOST}:${PORT}`);
    console.log(`⏱️  ${new Date().toLocaleString()}\n`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Puerto ${PORT} ya está en uso`);
    } else {
      console.error('❌ Error del servidor:', error);
    }
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor...');
    server.close(() => {
      console.log('✅ Servidor cerrado');
      process.exit(0);
    });
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Error al iniciar servidor:', error);
  process.exit(1);
}
