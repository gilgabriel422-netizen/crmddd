#!/usr/bin/env node
const http = require('http');

// Petición GET a /api/reservas
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/reservas',
  method: 'GET'
};

console.log('📡 Haciendo petición a http://localhost:5000/api/reservas...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  console.log('\n📦 Respuesta:\n');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.error('El servidor probablemente no está corriendo en puerto 5000');
});

req.end();
