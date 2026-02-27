#!/usr/bin/env node

const fs = require('fs');
const logFile = 'c:\\Users\\Gabriel\\Desktop\\bak\\Entregable\\backend\\server.log';

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(msg);
}

try {
  fs.writeFileSync(logFile, '');
  log('=== INICIANDO SERVIDOR ===');
  
  const express = require('express');
  const cors = require('cors');
  
  log('Express y CORS importados');
  
  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  
  app.post('/api/contratos/plantilla', (req, res) => {
    log('POST /api/contratos/plantilla recibido');
    res.json({ success: true, data: { id: 1, numero_contrato: 'T001' }});
  });
  
  const server = app.listen(5000, '0.0.0.0', () => {
    log('✅ Servidor escuchando en puerto 5000');
  });
  
  server.on('error', (err) => {
    log(`❌ Error: ${err.message}`);
    process.exit(1);
  });
} catch (e) {
  fs.appendFileSync(logFile, `ERROR: ${e.message}\n${e.stack}\n`);
  console.error(e);
  process.exit(1);
}
