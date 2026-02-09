const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * PaymentAgreement Model - Convertido a Sequelize
 * 
 * DECISIÓN TÉCNICA: Convertir de pg-pool a Sequelize para consistencia
 * con el resto del proyecto GB.
 */
const PaymentAgreement = sequelize.define('PaymentAgreement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contract_number: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  installment_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  installment_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: 'active'
  }
}, {
  tableName: 'payment_agreements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = PaymentAgreement;
