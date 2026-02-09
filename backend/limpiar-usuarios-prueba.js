const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
});

async function limpiar() {
  try {
    // Eliminar usuarios con dominio @cliente.crm.com
    const result = await pool.query(
      `DELETE FROM usuarios WHERE email LIKE '%@cliente.crm.com'`
    );
    
    console.log(`✅ Se eliminaron ${result.rowCount} usuarios de prueba`);
    
    // Eliminar clientes relacionados
    const clientesResult = await pool.query(
      `DELETE FROM clientes WHERE email LIKE '%@cliente.crm.com'`
    );
    
    console.log(`✅ Se eliminaron ${clientesResult.rowCount} clientes de prueba`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

limpiar();
