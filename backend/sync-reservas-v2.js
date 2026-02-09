#!/usr/bin/env node
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'admin',
  host: 'localhost',
  port: 5432,
  database: 'kempery'
});

(async () => {
  try {
    await client.connect();
    
    console.log('📋 Columnas actuales de la tabla reservas:');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reservas'
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      console.log(`  • ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
    console.log('\n🔧 Agregando columnas nuevas...');
    
    // Hacer cliente_id nullable
    try {
      await client.query('ALTER TABLE reservas ALTER COLUMN cliente_id DROP NOT NULL;');
      console.log('  ✅ cliente_id es ahora nullable');
    } catch (e) {
      console.log('  ⚠️ cliente_id ya es nullable');
    }
    
    // Agregar usuario_id
    try {
      await client.query('ALTER TABLE reservas ADD COLUMN usuario_id INTEGER;');
      console.log('  ✅ usuario_id agregado');
    } catch (e) {
      console.log('  ⚠️ usuario_id ya existe');
    }
    
    // Agregar paquete_id
    try {
      await client.query('ALTER TABLE reservas ADD COLUMN paquete_id INTEGER;');
      console.log('  ✅ paquete_id agregado');
    } catch (e) {
      console.log('  ⚠️ paquete_id ya existe');
    }
    
    // Agregar tipo_habitacion
    try {
      await client.query('ALTER TABLE reservas ADD COLUMN tipo_habitacion VARCHAR(100);');
      console.log('  ✅ tipo_habitacion agregado');
    } catch (e) {
      console.log('  ⚠️ tipo_habitacion ya existe');
    }
    
    console.log('\n✅ Sincronización completada');
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
