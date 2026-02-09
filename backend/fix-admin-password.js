const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdminPassword() {
  let client;

  try {
    // Conexión a la base de datos
    client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

      // 🔐 Contraseña DEFINITIVA
      const password = 'juan123';
      const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🔐 Hash generado correctamente');

    // Actualizar contraseña si el usuario existe
    const result = await client.query(
      `UPDATE usuarios
       SET password = $1
       WHERE email = $2`,
      [hashedPassword, 'admin@crm.com']
    );

    if (result.rowCount > 0) {
      console.log('✅ Contraseña del usuario admin actualizada');
    } else {
      console.log('⚠️ Usuario admin no existe, creando uno nuevo...');

      await client.query(
        `INSERT INTO usuarios (nombre, email, password, rol)
         VALUES ($1, $2, $3, $4)`,
        ['Administrador', 'admin@crm.com', hashedPassword, 'admin']
      );

      console.log('✅ Usuario admin creado');
    }

    // Verificación final
    const verify = await client.query(
      'SELECT email, rol FROM usuarios WHERE email = $1',
      ['admin@crm.com']
    );

    if (verify.rows.length > 0) {
      console.log('✅ Usuario verificado:', verify.rows[0]);
    }

    await client.end();

    console.log('');
    console.log('🎉 ¡Proceso completado con éxito!');
    console.log('📝 Credenciales finales:');
    console.log('   Email: admin@crm.com');
      console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) await client.end();
    process.exit(1);
  }
}

fixAdminPassword();
