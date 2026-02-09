const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'crm_database'
});

// Hash bcryptjs para 'admin123' - verificado funcionando
const hash = '$2b$10$EL3eEy52R8Gh3HVVEg/HL.hbBNKwOcvZJqN/P9H.PJ6qnIl.7LoRm';

async function updatePasswords() {
  try {
    console.log('Actualizando contraseñas...');
    const result = await pool.query(
      `UPDATE usuarios SET password = $1 WHERE email IN (
        'admin@crm.com',
        'cobranzas@crm.com',
        'contratos@crm.com',
        'atencion@crm.com',
        'postventa@crm.com',
        'cliente@crm.com',
        'clienteib1@crm.com',
        'clienteib2@crm.com'
      )`,
      [hash]
    );
    console.log('✅ Actualizado:', result.rowCount, 'usuarios');
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updatePasswords();
