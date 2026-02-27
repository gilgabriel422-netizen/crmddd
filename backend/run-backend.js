#!/usr/bin/env node
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true }));
app.post('/api/contratos/plantilla', (req, res) => {
  console.log('✅ Contrato recibido');
  res.json({
    success: true,
    data: { id: 1, numero_contrato: 'TEST-001' }
  });
});

const server = app.listen(5000, '0.0.0.0');
server.once('listening', () => {
  console.log('🚀 Backend en http://localhost:5000');
  // Mantener el servidor vivo indefinidamente
  setInterval(() => {}, 100000);
});

server.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
