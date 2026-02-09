const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
});

async function diagnostic() {
  try {
    // Obtener el usuario creado
    const result = await pool.query(
      `SELECT id, nombre, email, password, rol FROM usuarios WHERE email LIKE '%cliente.crm.com%' ORDER BY id DESC LIMIT 1`
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontró ningún usuario con dominio @cliente.crm.com');
      return;
    }

    const usuario = result.rows[0];
    console.log('\n✅ Usuario encontrado:');
    console.log('  ID:', usuario.id);
    console.log('  Nombre:', usuario.nombre);
    console.log('  Email:', usuario.email);
    console.log('  Rol:', usuario.rol);
    console.log('  Hash guardado:', usuario.password.substring(0, 20) + '...');

    // Extraer contrato del email
    const contrato = usuario.email.split('@')[0];
    console.log('\n📋 Número de contrato (= email):', contrato);
    
    // Intentar validar con el contrato
    console.log('\n🔍 Intentando validaciones:');
    const isValidWithContrato = await bcrypt.compare(contrato, usuario.password);
    console.log(`  ¿Es válida contraseña '${contrato}'?:`, isValidWithContrato);
    
    // Intentar encontrar la cédula del cliente
    const clienteResult = await pool.query(
      `SELECT document_number FROM clientes WHERE email = $1`,
      [usuario.email]
    );
    
    if (clienteResult.rows.length > 0) {
      const cedula = clienteResult.rows[0].document_number;
      console.log('  Cédula del cliente:', cedula);
      const isValidWithCedula = await bcrypt.compare(cedula, usuario.password);
      console.log(`  ¿Es válida contraseña '${cedula}'?:`, isValidWithCedula);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

diagnostic();
