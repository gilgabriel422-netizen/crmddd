const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
});

async function actualizarUsuario() {
  try {
    // Buscar el usuario con email antiguo
    const resultUsuario = await pool.query(
      `SELECT id, nombre, email, password FROM usuarios 
       WHERE email LIKE '%KMPRY SDSD 0005%'`
    );

    if (resultUsuario.rows.length === 0) {
      console.log('❌ No se encontró el usuario');
      return;
    }

    const usuario = resultUsuario.rows[0];
    const nuevoEmail = '0005@cliente.crm.com';
    
    console.log(`\n📧 Usuario encontrado:`);
    console.log(`  ID: ${usuario.id}`);
    console.log(`  Nombre: ${usuario.nombre}`);
    console.log(`  Email actual: ${usuario.email}`);
    console.log(`  Email nuevo: ${nuevoEmail}`);
    
    // Actualizar el email
    const result = await pool.query(
      `UPDATE usuarios SET email = $1 WHERE id = $2 RETURNING *`,
      [nuevoEmail, usuario.id]
    );

    console.log(`\n✅ Usuario actualizado exitosamente`);
    console.log(`\n🔑 Credenciales de login:`);
    console.log(`  📧 Email: ${nuevoEmail}`);
    console.log(`  🔐 Contraseña: 1111111111`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

actualizarUsuario();
