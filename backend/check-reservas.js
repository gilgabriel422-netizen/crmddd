#!/usr/bin/env node
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'admin',
  host: 'localhost',
  port: 5432,
  database: 'kempery'
});

(async () => {
  try {
    await client.connect();
    
    console.log('📋 Consultando reservas en la BD...\n');
    const result = await client.query('SELECT * FROM reservas ORDER BY fecha_creacion DESC;');
    
    if (result.rows.length === 0) {
      console.log('❌ No hay reservas en la tabla');
    } else {
      console.log(`✅ Se encontraron ${result.rows.length} reserva(s):\n`);
      result.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. Reserva #${row.numero_reserva}`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Cliente ID: ${row.cliente_id}`);
        console.log(`   Estado: ${row.estado}`);
        console.log(`   Fecha entrada: ${row.fecha_entrada}`);
        console.log(`   Fecha salida: ${row.fecha_salida}`);
        console.log(`   Personas: ${row.personas}`);
        console.log(`   Noches: ${row.noches}`);
        console.log('');
      });
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
