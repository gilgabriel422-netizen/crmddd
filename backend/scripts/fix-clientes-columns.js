const pool = require('../config/pg-pool');

async function columnExists(columnName) {
  const result = await pool.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name=$1",
    [columnName]
  );
  return result.rowCount > 0;
}

async function run() {
  try {
    const hasAnios = await columnExists('años');
    const hasAniosIndef = await columnExists('años_indefinido');
    const hasAnos = await columnExists('anos');
    const hasAnosIndef = await columnExists('anos_indefinido');

    console.log('Columnas actuales:');
    console.log({
      'años': hasAnios,
      'años_indefinido': hasAniosIndef,
      anos: hasAnos,
      anos_indefinido: hasAnosIndef
    });

    if (hasAnios && !hasAnos) {
      console.log('Renombrando "años" -> anos');
      await pool.query('ALTER TABLE clientes RENAME COLUMN "años" TO anos');
    }

    if (hasAniosIndef && !hasAnosIndef) {
      console.log('Renombrando "años_indefinido" -> anos_indefinido');
      await pool.query('ALTER TABLE clientes RENAME COLUMN "años_indefinido" TO anos_indefinido');
    }

    console.log('✅ Revisión/ajuste de columnas completado.');
  } catch (error) {
    console.error('❌ Error ajustando columnas:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
