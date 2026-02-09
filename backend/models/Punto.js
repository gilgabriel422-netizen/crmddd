const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Punto = sequelize.define('Punto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  puntos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'puntos',
  timestamps: false
});

module.exports = Punto;
