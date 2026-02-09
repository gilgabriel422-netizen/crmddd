#!/usr/bin/env node
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
});

(async () => {
  try {
    await client.connect();
    
    // Mostrar todos los usuarios
    const result = await client.query('SELECT id, nombre, email FROM usuarios ORDER BY id DESC LIMIT 15');
    
    console.log('\n📋 USUARIOS EN LA BD:\n');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id} | Email: ${row.email} | Nombre: ${row.nombre}`);
    });
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
