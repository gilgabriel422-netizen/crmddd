const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  paquete_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  numero_reserva: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fecha_entrada: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_salida: {
    type: DataTypes.DATE,
    allowNull: true
  },
  noches: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  personas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  tipo_habitacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING,
    allowNull: true
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
    defaultValue: 'pendiente'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reservas',
  timestamps: false
});

module.exports = Reserva;
