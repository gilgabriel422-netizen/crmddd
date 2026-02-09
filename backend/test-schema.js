const pool = require('./config/pg-pool');

async function checkSchema() {
  try {
    // Check clientes data
    const clientesCount = await pool.query('SELECT COUNT(*) as total FROM clientes');
    console.log('Clientes count:', clientesCount.rows[0]);
    
    // Get one cliente
    const oneCliente = await pool.query('SELECT * FROM clientes LIMIT 1');
    if (oneCliente.rows.length > 0) {
      console.log('Clientes columns:', Object.keys(oneCliente.rows[0]));
      console.log('First cliente total_amount:', oneCliente.rows[0].total_amount);
    }
    
    // Check autorizaciones_pago count
    const pagosCount = await pool.query('SELECT COUNT(*) as total FROM autorizaciones_pago');
    console.log('Autorizaciones_pago count:', pagosCount.rows[0]);
    
    // Check reservas count
    const reservasCount = await pool.query('SELECT COUNT(*) as total FROM reservas');
    console.log('Reservas count:', reservasCount.rows[0]);
    
    // Test the actual query from reportesController
    const testQuery = await pool.query(
      'SELECT COUNT(*) as total_ventas, COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total_monto FROM clientes'
    );
    console.log('Test query result:', testQuery.rows[0]);
    
    pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

checkSchema();
