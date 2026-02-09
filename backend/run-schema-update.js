const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function runSchema() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'update-reservas-schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Ejecutar cada statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`\n⚙️  Ejecutando: ${statement.substring(0, 50)}...`);
        await sequelize.query(statement);
        console.log('✅ Completado');
      }
    }

    console.log('\n✨ Schema actualizado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runSchema();
