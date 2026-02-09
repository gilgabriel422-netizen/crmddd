#!/usr/bin/env node
const { Client } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
};

const client = new Client(config);

(async () => {
  try {
    await client.connect();
    
    // Borrar usuario y cliente con email antiguo
    await client.query(`DELETE FROM usuarios WHERE email LIKE '%KMPRY SDSD%'`);
    console.log('✅ Usuario antiguo eliminado');
    
    await client.query(`DELETE FROM clientes WHERE contract_number LIKE '%KMPRY SDSD%'`);
    console.log('✅ Cliente antiguo eliminado');
    
    console.log('\n✅ Listo. Crea un nuevo cliente con el botón "Nuevo Cliente"');
    console.log('   Usa contrato: TEST0010 (o similar)');
    console.log('   Usa cédula: 9999999999');
    
    await client.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
