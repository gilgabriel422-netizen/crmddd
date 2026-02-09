require('dotenv').config();
const sequelize = require('./config/database');
const Mensaje = require('./models/Mensaje');

async function main() {
  try {
    console.log('Conectando a la BD...');
    await sequelize.authenticate();
    console.log('OK - Sincronizando Mensaje...');
    await Mensaje.sync({ force: true });
    console.log('OK - Tabla sincronizada');
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

main();
