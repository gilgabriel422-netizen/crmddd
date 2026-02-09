const bcryptjs = require('bcryptjs');

console.log('Generando hash para admin123...');

bcryptjs.hash('admin123', 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('HASH:', hash);
  
  // Test it
  bcryptjs.compare('admin123', hash, (err, isMatch) => {
    console.log('Validación:', isMatch);
    process.exit(0);
  });
});
