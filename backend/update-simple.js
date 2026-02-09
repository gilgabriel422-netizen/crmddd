const pg = require('pg');

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'kempery_crm',
  user: 'postgres',
  password: 'password'
});

client.on('error', (err) => {
  console.error('Client error:', err);
  process.exit(1);
});

client.connect(function(err) {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }

  // Actualizar
  client.query(
    `UPDATE usuarios SET email = '0005@cliente.crm.com' 
     WHERE email LIKE '%KMPRY SDSD%'`,
    function(err, res) {
      if (err) {
        console.error('Update error:', err);
        client.end();
        process.exit(1);
      }
      
      console.log('✅ Actualizado:', res.rowCount, 'filas');
      
      // Verificar
      client.query(
        `SELECT id, email FROM usuarios WHERE email = '0005@cliente.crm.com'`,
        function(err, res) {
          if (err) {
            console.error('Check error:', err);
          } else if (res.rows.length > 0) {
            console.log('✅ Usuario existe:', res.rows[0].email);
          } else {
            console.log('❌ Usuario no encontrado');
          }
          
          client.end();
          process.exit(0);
        }
      );
    }
  );
});
