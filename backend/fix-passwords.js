const pool = require('./config/pg-pool');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    // Hash para 'admin123'
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Hash generado:', hash);
    
    const result = await pool.query(
      'UPDATE usuarios SET password = $1 WHERE email = ANY($2) RETURNING email, password',
      [hash, ['admin@crm.com', 'cliente@crm.com', 'cobranzas@crm.com', 'contratos@crm.com', 'atencion@crm.com', 'postventa@crm.com', 'clienteib1@crm.com', 'clienteib2@crm.com']]
    );
    
    console.log('✅ Contraseñas actualizadas:');
    result.rows.forEach(row => console.log(`  ${row.email}: OK`));
    
    // Verificar que el hash funciona
    const testResult = await pool.query('SELECT password FROM usuarios WHERE email = $1', ['admin@crm.com']);
    const storedHash = testResult.rows[0].password;
    const isValid = await bcrypt.compare('admin123', storedHash);
    console.log('\n🔍 Test de validación:');
    console.log(`  admin123 vs hash almacenado: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPasswords();
