require('dotenv').config();
const { Client } = require('pg');
const sequelize = require('./config/database');

async function syncMensajes() {
  let pgClient;
  
  try {
    console.log('🔄 Sincronizando tabla Mensaje...');
    
    // Conexión directa a PostgreSQL para verificar y crear columnas
    pgClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    await pgClient.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Verificar si la tabla existe
    const tableExists = await pgClient.query(
      "SELECT to_regclass('public.mensajes')"
    );
    
    if (tableExists.rows[0].to_regclass === null) {
      console.log('📋 Tabla mensajes no existe, creándola con Sequelize...');
      
      // Usar Sequelize para crear la tabla
      const Mensaje = require('./models/Mensaje');
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Tabla Mensaje creada con Sequelize');
    } else {
      console.log('📋 Tabla mensajes existe, verificando columnas...');
      
      // Obtener información de las columnas existentes
      const columns = await pgClient.query(
        `SELECT column_name, data_type FROM information_schema.columns 
         WHERE table_name = 'mensajes' ORDER BY ordinal_position`
      );
      
      console.log('Columnas actuales:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
      
      const columnNames = columns.rows.map(col => col.column_name);
      
      // Verificar qué columnas faltan
      const requiredColumns = {
        'asunto': 'VARCHAR(255)',
        'contenido': 'TEXT',
        'usuario_id': 'INTEGER',
        'estado': "VARCHAR(20)",
        'respuesta': 'TEXT',
        'fecha_creacion': 'TIMESTAMP',
        'fecha_respuesta': 'TIMESTAMP',
        'tipo_remitente': "VARCHAR(20)"
      };
      
      for (const [colName, colType] of Object.entries(requiredColumns)) {
        if (!columnNames.includes(colName)) {
          console.log(`➕ Agregando columna: ${colName}`);
          
          if (colName === 'asunto' || colName === 'contenido' || colName === 'usuario_id') {
            await pgClient.query(`
              ALTER TABLE mensajes 
              ADD COLUMN ${colName} ${colType} NOT NULL DEFAULT 'N/A'
            `);
          } else if (colName === 'fecha_creacion') {
            await pgClient.query(`
              ALTER TABLE mensajes 
              ADD COLUMN ${colName} ${colType} DEFAULT CURRENT_TIMESTAMP
            `);
          } else {
            await pgClient.query(`
              ALTER TABLE mensajes 
              ADD COLUMN ${colName} ${colType}
            `);
          }
          console.log(`✅ Columna ${colName} agregada`);
        }
      }
      
      // Crear enums si no existen
      const enumCheckEstado = await pgClient.query(
        "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_mensajes_estado')"
      );
      
      if (!enumCheckEstado.rows[0].exists) {
        console.log('➕ Creando tipo ENUM para estado');
        await pgClient.query(`
          CREATE TYPE enum_mensajes_estado AS ENUM ('pendiente', 'en_proceso', 'respondido')
        `);
        console.log('✅ ENUM estado creado');
      }
      
      const enumCheckTipo = await pgClient.query(
        "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_mensajes_tipo_remitente')"
      );
      
      if (!enumCheckTipo.rows[0].exists) {
        console.log('➕ Creando tipo ENUM para tipo_remitente');
        await pgClient.query(`
          CREATE TYPE enum_mensajes_tipo_remitente AS ENUM ('cliente', 'atención')
        `);
        console.log('✅ ENUM tipo_remitente creado');
      }
    }
    
    console.log('✅ Sincronización completada');
    await pgClient.end();
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    if (pgClient) await pgClient.end();
    if (sequelize) await sequelize.close();
    process.exit(1);
  }
}

syncMensajes();
