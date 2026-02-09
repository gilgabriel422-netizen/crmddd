const pool = require('./config/pg-pool');

async function checkData() {
  try {
    // Contar clientes
    const clientes = await pool.query('SELECT COUNT(*) as total FROM clientes');
    console.log('Total clientes en BD:', clientes.rows[0].total);
    
    // Ver algunos clientes
    const clientesData = await pool.query('SELECT id, first_name, total_amount FROM clientes LIMIT 5');
    console.log('\nClientes:');
    clientesData.rows.forEach(c => {
      console.log(`  - ID ${c.id}: ${c.first_name}, Total: $${c.total_amount}`);
    });
    
    // Test la query exacta del reportesController
    const ventas = await pool.query(
      `SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total_amount::numeric), 0) as total_monto
      FROM clientes`
    );
    console.log('\nResultado query de ventas:');
    console.log('  total_ventas:', ventas.rows[0].total_ventas);
    console.log('  total_monto:', ventas.rows[0].total_monto);
    
    await pool.end();
  } catch (error) {
    console.error('ERROR:', error.message);
    await pool.end();
  }
}

checkData();
