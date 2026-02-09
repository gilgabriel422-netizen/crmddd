// Modelo de Departamento
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Locacion = require('./Locacion');

const Departamento = sequelize.define('Departamento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  locacionid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Locacion,
      key: 'id'
    }
  }
}, {
  tableName: 'departamentos',
  timestamps: false
});

Departamento.belongsTo(Locacion, { foreignKey: 'locacionid' });
Locacion.hasMany(Departamento, { foreignKey: 'locacionid' });

module.exports = Departamento;
