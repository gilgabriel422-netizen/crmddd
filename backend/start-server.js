#!/usr/bin/env node

console.error('=== INICIANDO SERVIDOR ===');
console.error('Node version:', process.version);
console.error('CWD:', process.cwd());

const express = require('express');
const cors = require('cors');

console.error('Express y CORS importados exitosamente');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', msg: 'Servidor funcionando' });
});

app.post('/api/contratos/plantilla', (req, res) => {
  console.log('📨 POST /api/contratos/plantilla recibido');
  res.json({
    success: true,
    data: { id: 1, numero_contrato: 'TEMP-001' }
  });
});

const PORT = 5000;
console.error(`Intentando escuchar en puerto ${PORT}...`);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}\n`);
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});
