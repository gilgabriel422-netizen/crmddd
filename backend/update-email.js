const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password',
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
});

async function updateUser() {
  let client;
  try {
    client = await pool.connect();
    
    // Primero verificar qué existe
    const checkResult = await client.query(
      `SELECT id, email FROM usuarios WHERE email LIKE '%KMPRY SDSD%'`
    );
    
    console.log('\n📋 Usuarios encontrados con KMPRY SDSD:');
    checkResult.rows.forEach(row => {
      console.log(`   ID: ${row.id}, Email: ${row.email}`);
    });
    
    if (checkResult.rows.length === 0) {
      console.log('\n❌ No hay usuario con KMPRY SDSD');
      return;
    }
    
    // Actualizar
    console.log('\n🔄 Actualizando...');
    const updateResult = await client.query(
      `UPDATE usuarios SET email = '0005@cliente.crm.com' 
       WHERE email LIKE '%KMPRY SDSD%'`
    );
    
    console.log(`✅ Filas actualizadas: ${updateResult.rowCount}`);
    
    // Verificar
    const verifyResult = await client.query(
      `SELECT id, email FROM usuarios WHERE email = '0005@cliente.crm.com'`
    );
    
    if (verifyResult.rows.length > 0) {
      console.log('\n✅✅ ÉXITO - Usuario actualizado:');
      console.log(`   ID: ${verifyResult.rows[0].id}`);
      console.log(`   Email: ${verifyResult.rows[0].email}`);
    } else {
      console.log('\n❌ No se encontró el usuario después de actualizar');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (client) client.release();
    await pool.end();
    process.exit(0);
  }
}

updateUser();
