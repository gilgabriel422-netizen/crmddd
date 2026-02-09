require('dotenv').config();
const { sequelize } = require('./config/database');
const Mensaje = require('./models/Mensaje');

async function syncDatabase() {
  try {
    console.log('🔄 Iniciando sincronización de base de datos...');
    
    // Forzar la sincronización - esto recrea la tabla si es necesario
    await Mensaje.sync({ force: true, logging: console.log });
    
    console.log('✅ Tabla Mensaje sincronizada exitosamente');
    
    // Verificar que se creó correctamente
    const count = await Mensaje.count();
    console.log(`📊 Total de mensajes en DB: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante sincronización:', error);
    process.exit(1);
  }
}

syncDatabase();
