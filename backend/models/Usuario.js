const sequelize = require('../config/database');
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');


class Usuario extends Model {
  // Métodos estáticos personalizados si los necesitas
  static async getAll() {
    return await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'fecha_creacion'],
      order: [['nombre', 'ASC']]
    });
  }

  static async getAllNoClientes() {
    return await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'fecha_creacion'],
      where: { rol: { [sequelize.Sequelize.Op.ne]: 'cliente' } },
      order: [['nombre', 'ASC']]
    });
  }

  static async getById(id) {
    return await Usuario.findByPk(id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'fecha_creacion']
    });
  }

  static async getByEmail(email) {
    return await Usuario.findOne({ where: { email } });
  }


  static async createUser(usuarioData) {
    const { nombre, email, password, rol } = usuarioData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol: rol || 'vendedor'
    });
    return user.id;
  }


  static async updateUser(id, usuarioData) {
    const { nombre, email, rol, activo } = usuarioData;
    const [updated] = await Usuario.update(
      { nombre, email, rol, activo },
      { where: { id } }
    );
    return updated;
  }

  static async deleteUser(id) {
    return await Usuario.destroy({ where: { id } });
  }

  // Validar password
  static async validatePassword(plainPassword, hashedPassword) {
    console.log('📝 DEBUG validatePassword:');
    console.log('  plainPassword:', plainPassword);
    console.log('  hashedPassword:', hashedPassword.substring(0, 20) + '...');
    
    try {
      // Si la contraseña almacenada no es un hash bcrypt, compararla directamente
      if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
        console.log('  Comparación de texto plano');
        const result = plainPassword === hashedPassword;
        console.log('  Resultado:', result);
        return result;
      }
      
      // Si es un hash bcrypt, usar bcrypt.compare
      console.log('  Comparación con bcrypt');
      const result = await bcrypt.compare(plainPassword, hashedPassword);
      console.log('  Resultado:', result);
      return result;
    } catch (err) {
      console.error('  ERROR en validación:', err);
      throw err;
    }
  }

}

Usuario.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Usuario',
  tableName: 'usuarios',
  timestamps: false
});

module.exports = Usuario;