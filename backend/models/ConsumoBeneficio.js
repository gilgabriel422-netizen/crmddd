const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConsumoBeneficio = sequelize.define('ConsumoBeneficio', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  beneficio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'beneficios',
      key: 'id'
    }
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  monto_consumido: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referencia: {
    type: DataTypes.STRING,
    allowNull: true // ej: número de reserva, transacción, etc.
  },
  estado: {
    type: DataTypes.ENUM(
      'pendiente',
      'confirmado',
      'cancelado',
      'rechazado'
    ),
    defaultValue: 'pendiente'
  },
  aprobado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_confirmacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'consumo_beneficios',
  timestamps: false
});

module.exports = ConsumoBeneficio;
