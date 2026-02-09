#!/usr/bin/env node
require('dotenv').config();

console.log('✅ 1. Dotenv cargado');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: console.log,
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ 2. BD conectada'))
  .catch(err => console.error('❌ Error BD:', err.message));
