const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * ClientManagement Model - Convertido a Sequelize
 * 
 * DECISIÓN TÉCNICA: Convertir de pg-pool a Sequelize para consistencia
 * con el resto del proyecto GB.
 */
const ClientManagement = sequelize.define('ClientManagement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  from_user: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'client_managements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ClientManagement;
