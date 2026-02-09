// Modelo de Paquete Turístico
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paquete = sequelize.define('Paquete', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  duracion: {
    type: DataTypes.STRING,
    allowNull: true // ej: "7 días / 6 noches"
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true // URL o ruta de la imagen
  },
  grupo: {
    type: DataTypes.STRING,
    allowNull: true // ej: "2-8 personas"
  },
  calificacion: {
    type: DataTypes.DECIMAL(2,1),
    allowNull: true // rating de 0-5
  },
  tipo: {
    type: DataTypes.ENUM('Nacional', 'Internacional'),
    allowNull: true,
    defaultValue: 'Internacional'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'paquetes',
  timestamps: false
});

module.exports = Paquete;
