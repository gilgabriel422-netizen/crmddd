const pool = require('../config/pg-pool');

async function run() {
  try {
    const result = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='clientes' ORDER BY ordinal_position"
    );
    console.table(result.rows);
  } catch (error) {
    console.error('❌ Error consultando columnas:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
