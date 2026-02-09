console.log('🚀 Iniciando servidor...');

try {
  const express = require('express');
  console.log('✅ Express cargado');
  
  const cors = require('cors');
  console.log('✅ CORS cargado');
  
  const bodyParser = require('body-parser');
  console.log('✅ Body Parser cargado');
  
  const path = require('path');
  console.log('✅ Path cargado');
  
  require('dotenv').config();
  console.log('✅ Dotenv configurado');
  
  const app = express();
  console.log('✅ App Express creada');
  
  // Middleware
  app.use(cors({ origin: '*', credentials: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  console.log('✅ Middleware configurado');
  
  const PORT = process.env.PORT || 5000;
  const HOST = '0.0.0.0';
  
  console.log(`⏳ Intentando iniciar servidor en ${HOST}:${PORT}...`);
  
  const server = app.listen(PORT, HOST, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
    console.log(`   Accede a la API en http://localhost:${PORT}`);
  });
  
  server.on('error', (error) => {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.error('   Código:', error.code);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Error crítico:', error.message);
  console.error(error.stack);
  process.exit(1);
}
