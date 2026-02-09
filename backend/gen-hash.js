const bcrypt = require('bcryptjs');

const password = 'admin123';
bcrypt.hash(password, 10).then(hash => {
  console.log('Hash para admin123:');
  console.log(hash);
  
  // Verificar que funciona
  bcrypt.compare('admin123', hash).then(result => {
    console.log('Verificación:', result ? 'OK' : 'FALLO');
    process.exit(0);
  });
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
