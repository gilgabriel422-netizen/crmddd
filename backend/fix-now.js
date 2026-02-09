const pg = require('pg');

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
});

async function fix() {
  try {
    await client.connect();
    console.log('✅ Conectado a la BD\n');
    
    // Actualizar email
    await client.query(
      `UPDATE usuarios SET email = '0005@cliente.crm.com' 
       WHERE email LIKE '%KMPRY SDSD%'`
    );
    
    console.log('✅ Email actualizado a: 0005@cliente.crm.com');
    
    // Verificar
    const result = await client.query(
      `SELECT id, nombre, email, password FROM usuarios WHERE email = '0005@cliente.crm.com'`
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('\n✅ Usuario encontrado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Email: ${user.email}`);
      console.log('\n🔑 CREDENCIALES PARA LOGIN:');
      console.log('   📧 Email: 0005@cliente.crm.com');
      console.log('   🔐 Contraseña: 1111111111');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fix();
