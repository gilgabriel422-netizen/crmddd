// Modelo de Locacion
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Locacion = sequelize.define('Locacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'locaciones',
  timestamps: false
});

module.exports = Locacion;
