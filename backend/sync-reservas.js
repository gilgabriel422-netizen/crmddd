const sequelize = require('./config/database');
const Reserva = require('./models/Reserva');

async function syncReservas() {
  try {
    console.log('Sincronizando modelo Reserva con la base de datos...');
    
    // Alternar tabla si existe, luego crear nueva
    await sequelize.query('ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_cliente_id_fkey;');
    console.log('✅ FK removida');
    
    // Agregar columnas si no existen
    await sequelize.query(`
      ALTER TABLE reservas
      ADD COLUMN IF NOT EXISTS usuario_id INTEGER,
      ADD COLUMN IF NOT EXISTS paquete_id INTEGER,
      ADD COLUMN IF NOT EXISTS tipo_habitacion VARCHAR(100);
    `);
    console.log('✅ Columnas agregadas');
    
    // Hacer cliente_id nullable
    await sequelize.query(`
      ALTER TABLE reservas
      ALTER COLUMN cliente_id DROP NOT NULL;
    `);
    console.log('✅ cliente_id es ahora nullable');
    
    console.log('✅ Sincronización completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante sincronización:', error.message);
    process.exit(1);
  }
}

syncReservas();
