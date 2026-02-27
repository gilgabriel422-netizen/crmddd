const pool = require('./config/pg-pool');

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'contratos_viajes'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 ESTRUCTURA DE TABLA contratos_viajes:');
    console.log('=====================================');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('\n✅ Tabla existe y tiene', result.rows.length, 'columnas');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkSchema();
