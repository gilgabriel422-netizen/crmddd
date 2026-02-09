const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
});

async function diagnosticar() {
  try {
    // Buscar clientes con contrato 0001
    const clientesResult = await pool.query(
      `SELECT id, first_name, last_name, email, contract_number, document_number 
       FROM clientes 
       WHERE contract_number LIKE '%0001%' 
       ORDER BY id DESC LIMIT 5`
    );
    
    console.log('\n📋 CLIENTES ENCONTRADOS:');
    if (clientesResult.rows.length === 0) {
      console.log('❌ No se encontró ningún cliente con contrato 0001');
    } else {
      clientesResult.rows.forEach(c => {
        console.log(`  - ID: ${c.id}, Nombre: ${c.first_name} ${c.last_name}`);
        console.log(`    Email: ${c.email}`);
        console.log(`    Contrato: ${c.contract_number}`);
        console.log(`    Cédula: ${c.document_number}`);
      });
    }

    // Buscar todos los usuarios
    const usuariosResult = await pool.query(
      `SELECT id, nombre, email, rol FROM usuarios ORDER BY id DESC LIMIT 10`
    );
    
    console.log('\n👥 ÚLTIMOS USUARIOS CREADOS:');
    usuariosResult.rows.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Rol: ${u.rol}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

diagnosticar();
