const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mensaje = sequelize.define('Mensaje', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asunto: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'respondido'),
    defaultValue: 'pendiente'
  },
  respuesta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_respuesta: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tipo_remitente: {
    type: DataTypes.ENUM('cliente', 'atención'),
    defaultValue: 'cliente'
  }
}, {
  timestamps: false,
  tableName: 'mensajes'
});

module.exports = Mensaje;