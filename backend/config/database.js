const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // 🚀 PRODUCCIÓN (Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // necesario para Render
      },
    },
  });

  console.log('🌍 Conectando a PostgreSQL en PRODUCCIÓN');
} else {
  // 💻 DESARROLLO LOCAL
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );

  console.log('💻 Conectando a PostgreSQL en LOCAL');
}

module.exports = sequelize;
