const bcrypt = require('bcryptjs');

const password = 'admin123';

bcrypt.hash(password, 10).then(hash => {
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('');
  console.log('Usa este hash en tu archivo schema.sql');
}).catch(err => {
  console.error('Error:', err);
});
