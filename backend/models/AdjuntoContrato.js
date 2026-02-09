const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdjuntoContrato = sequelize.define('AdjuntoContrato', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contrato_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // Nota: La referencia a contratos_viajes se crea mediante migración SQL
    // Ver: database/migrations/create-contratos-tables.sql
  },
  nombre_original: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre original del archivo PDF'
  },
  nombre_guardado: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'Nombre único del archivo guardado en servidor'
  },
  ruta: {
    type: DataTypes.STRING(512),
    allowNull: false,
    comment: 'Ruta relativa del archivo'
  },
  tamaño: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tamaño en bytes'
  },
  tipo_mime: {
    type: DataTypes.STRING(50),
    defaultValue: 'application/pdf'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción opcional del adjunto (ej: Carta de diferimiento, Contrato, etc)'
  },
  tipo_documento: {
    type: DataTypes.ENUM(
      'contrato',
      'carta_diferimiento',
      'autorizacion',
      'beneficios',
      'terminos',
      'otro'
    ),
    defaultValue: 'otro',
    comment: 'Tipo de documento para categorizar'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del usuario que subió el archivo'
  },
  fecha_subida: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'adjuntos_contratos',
  timestamps: false,
  underscored: true
});

// Métodos estáticos
AdjuntoContrato.getByContratoId = async (contratoId) => {
  return await AdjuntoContrato.findAll({
    where: { contrato_id: contratoId },
    order: [['fecha_subida', 'DESC']]
  });
};

AdjuntoContrato.getById = async (id) => {
  return await AdjuntoContrato.findByPk(id);
};

AdjuntoContrato.crear = async (data) => {
  return await AdjuntoContrato.create(data);
};

AdjuntoContrato.eliminar = async (id) => {
  return await AdjuntoContrato.destroy({
    where: { id }
  });
};

module.exports = AdjuntoContrato;
