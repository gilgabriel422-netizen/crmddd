const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Payment Model - Convertido a Sequelize
 * 
 * DECISIÓN TÉCNICA: Convertir de pg-pool a Sequelize para consistencia
 * con el resto del proyecto GB.
 */
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  payment_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  payment_method: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receipt_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Payment;
