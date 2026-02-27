const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'postgres',
  });

  try {
    console.log('Intentando conectar a PostgreSQL...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    await client.connect();
    console.log('✅ Conexión exitosa');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query exitoso:', result.rows[0]);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();
