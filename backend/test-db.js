const sequelize = require('./config/database');

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos exitosa');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  });
