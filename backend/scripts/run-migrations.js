const pool = require('../config/pg-pool');
const fs = require('fs');
const path = require('path');

/**
 * Script para ejecutar migraciones SQL
 */
async function ejecutarMigraciones() {
  console.log('🚀 Iniciando migraciones de base de datos...\n');

  try {
    // Leer archivo de migración
    const sqlPath = path.join(__dirname, '../database/migrations/create-contratos-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando: create-contratos-tables.sql');
    
    // Ejecutar SQL
    await pool.query(sql);

    console.log('✅ Tablas creadas exitosamente:');
    console.log('   - clientes_tarjetas');
    console.log('   - autorizaciones_pago');
    console.log('   - contratos_viajes');
    console.log('   - Triggers de actualización automática\n');

    // Verificar que las tablas existen
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('clientes_tarjetas', 'autorizaciones_pago', 'contratos_viajes')
      ORDER BY table_name
    `);

    console.log('📊 Verificación de tablas:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n✅ Migraciones completadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar migraciones
ejecutarMigraciones();
