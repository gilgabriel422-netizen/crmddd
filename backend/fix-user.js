const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
});

async function actualizar() {
  try {
    // Actualizar el email del usuario
    const result = await pool.query(
      `UPDATE usuarios SET email = '0005@cliente.crm.com' 
       WHERE email LIKE '%KMPRY%' AND id = 10`
    );
    console.log('✅ Usuario actualizado');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

actualizar();
