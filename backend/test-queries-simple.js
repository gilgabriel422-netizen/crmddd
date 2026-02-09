const pool = require('./config/pg-pool');

async function testData() {
  try {
    console.log('=== Testing Database Queries ===\n');
    
    // Test 1: Contar clientes
    const clientes = await pool.query('SELECT COUNT(*) as total FROM clientes');
    console.log('Total clientes:', clientes.rows[0].total);
    
    // Test 2: Ver datos de clientes
    const clientesData = await pool.query('SELECT id, first_name, last_name, total_amount FROM clientes LIMIT 3');
    console.log('\nClientes con datos:');
    clientesData.rows.forEach(c => {
      console.log(`  ID: ${c.id}, Nombre: ${c.first_name} ${c.last_name}, Total: $${c.total_amount}`);
    });
    
    // Test 3: Query exacta del reportesController
    const ventasQuery = await pool.query(
      `SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total_amount::numeric), 0) as total_monto
      FROM clientes`
    );
    console.log('\n=== Resultado query ventas (igual que reportesController) ===');
    console.log('Total ventas:', ventasQuery.rows[0].total_ventas);
    console.log('Total monto:', ventasQuery.rows[0].total_monto);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testData();
