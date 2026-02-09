const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');

async function crearUsuarioContratos() {
  try {
    // Sincronizar base de datos
    await sequelize.sync();
    console.log('✅ Conexión a base de datos establecida');

    // Password hash para "admin123"
    const passwordHash = '$2a$10$kr66QtV8DmTzS897GhPVjeUg9DSdIkzDIWmpW5mmfQyd4RKLEQ7Um';

    // Verificar si el usuario ya existe
    const existente = await Usuario.findOne({ where: { email: 'contratos@crm.com' } });
    
    if (existente) {
      console.log('⚠️  El usuario ya existe. Actualizando rol...');
      existente.rol = 'contratos';
      await existente.save();
      console.log('✅ Usuario actualizado correctamente');
    } else {
      // Crear nuevo usuario
      const nuevoUsuario = await Usuario.create({
        nombre: 'Usuario Contratos',
        email: 'contratos@crm.com',
        password: passwordHash,
        rol: 'contratos'
      });
      console.log('✅ Usuario creado correctamente');
    }

    // Mostrar todos los usuarios
    console.log('\n📋 Usuarios en el sistema:');
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol'],
      raw: true
    });
    console.table(usuarios);

    console.log('\n🔐 Credenciales del usuario de contratos:');
    console.log('   Email: contratos@crm.com');
    console.log('   Password: admin123');
    console.log('\n✅ Script completado exitosamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

crearUsuarioContratos();
