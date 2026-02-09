const pool = require('./config/pg-pool');

async function testQueries() {
  try {
    console.log('Testing reportes queries...\n');
    
    // Test 1: Ventas
    const ventasResult = await pool.query(
      `SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total_amount::numeric), 0) as total_monto
      FROM clientes`
    );
    console.log('Ventas:', ventasResult.rows[0]);
    
    // Test 2: Cobranzas
    const cobranzasResult = await pool.query(
      `SELECT 
        COUNT(*) as total_cobranzas,
        COALESCE(SUM(monto_numerico::numeric), 0) as total_monto
      FROM autorizaciones_pago
      WHERE payment_status = 'confirmed'`
    );
    console.log('Cobranzas:', cobranzasResult.rows[0]);
    
    // Test 3: Reservas
    const reservasResult = await pool.query(
      `SELECT 
        COUNT(*) as total_reservas,
        COALESCE(SUM(precio_total::numeric), 0) as total_monto
      FROM reservas`
    );
    console.log('Reservas:', reservasResult.rows[0]);
    
    // Test 4: Pagos
    const pagosResult = await pool.query(
      `SELECT 
        COUNT(*) as total_pagos,
        COALESCE(SUM(monto_numerico::numeric), 0) as total_pagado
      FROM autorizaciones_pago
      WHERE payment_status = 'confirmed'`
    );
    console.log('Pagos:', pagosResult.rows[0]);
    
    // Test 5: Clientes total
    const clientesResult = await pool.query(
      `SELECT COUNT(*) as total_clientes, COALESCE(SUM(total_amount::numeric), 0) as total_monto
       FROM clientes`
    );
    console.log('Clientes:', clientesResult.rows[0]);
    
    pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

testQueries();
