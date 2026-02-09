const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContratoFisico = sequelize.define('ContratoFisico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'clientes', key: 'id' }
  },
  numero_contrato: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  archivo_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  usuario_subida_id: {
    type: DataTypes.INTEGER,
    references: { model: 'usuarios', key: 'id' }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'contratos_fisicos',
  timestamps: false
});

module.exports = ContratoFisico;
