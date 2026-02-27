const sequelize = require('./config/database');
require('dotenv').config();

async function test() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    await sequelize.sync({ alter: false });
    console.log('✅ Sincronización exitosa');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
