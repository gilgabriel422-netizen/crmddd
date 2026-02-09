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
    
    // Actualizar el email del usuario existente
    const result = await client.query(
      `UPDATE usuarios 
       SET email = '0005@cliente.crm.com' 
       WHERE email LIKE '%KMPRY SDSD 0005%'
       RETURNING id, nombre, email, password`
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('\n✅ Usuario actualizado correctamente:\n');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Email: ${user.email}`);
      console.log('\n🔑 CREDENCIALES PARA LOGIN:\n');
      console.log('   📧 Email: 0005@cliente.crm.com');
      console.log('   🔐 Contraseña: 1111111111\n');
    } else {
      console.log('No se encontró usuario para actualizar');
    }
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
