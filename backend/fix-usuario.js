const { sequelize } = require('./config/database');

async function fixUser() {
  try {
    // Actualizar el email del usuario a 0005@cliente.crm.com
    const result = await sequelize.query(
      `UPDATE usuarios SET email = '0005@cliente.crm.com' 
       WHERE email LIKE '%KMPRY SDSD%'`
    );
    
    console.log('✅ Usuario actualizado correctamente');
    console.log('\n🔑 Credenciales correctas para login:');
    console.log('   📧 Email: 0005@cliente.crm.com');
    console.log('   🔐 Contraseña: 1111111111');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixUser();
