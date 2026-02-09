const fs = require('fs');
const path = require('path');

const envContent = `# API del backend
VITE_API_URL=http://localhost:5000/api

# false = usar backend real; true = modo offline (mocks)
VITE_OFFLINE_MODE=false

# Entorno
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  El archivo .env.local ya existe. No se sobrescribirá.');
  console.log('   Si deseas recrearlo, elimínalo primero.');
} else {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Archivo .env.local creado exitosamente en:', envPath);
  console.log('');
  console.log('📝 IMPORTANTE: Reinicia el servidor de desarrollo (npm run dev)');
  console.log('   para que Vite lea las nuevas variables de entorno.');
}
