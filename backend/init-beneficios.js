#!/usr/bin/env node
const pool = require('./config/pg-pool');

async function crearTablasBeneficios() {
  console.log('🔧 Creando tablas de beneficios...\n');

  try {
    // Crear tabla beneficios
    console.log('📋 Creando tabla "beneficios"...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS beneficios (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'puntos',
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        valor DECIMAL(10, 2) NOT NULL,
        saldo_disponible DECIMAL(10, 2) NOT NULL DEFAULT 0,
        fecha_vencimiento TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabla "beneficios" creada\n');

    // Crear tabla consumo_beneficios
    console.log('📋 Creando tabla "consumo_beneficios"...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consumo_beneficios (
        id SERIAL PRIMARY KEY,
        beneficio_id INTEGER NOT NULL,
        cliente_id INTEGER NOT NULL,
        monto_consumido DECIMAL(10, 2) NOT NULL,
        descripcion TEXT,
        referencia VARCHAR(255),
        estado VARCHAR(50) DEFAULT 'pendiente',
        aprobado_por INTEGER,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_confirmacion TIMESTAMP,
        FOREIGN KEY (beneficio_id) REFERENCES beneficios(id) ON DELETE CASCADE,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
        FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Tabla "consumo_beneficios" creada\n');

    // Crear índices
    console.log('🔍 Creando índices...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_beneficios_cliente ON beneficios(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_beneficios_activo ON beneficios(activo);
      CREATE INDEX IF NOT EXISTS idx_consumo_cliente ON consumo_beneficios(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_consumo_estado ON consumo_beneficios(estado);
      CREATE INDEX IF NOT EXISTS idx_consumo_beneficio ON consumo_beneficios(beneficio_id);
    `);
    console.log('✅ Índices creados\n');

    console.log('✨ ¡Tablas de beneficios creadas exitosamente!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

crearTablasBeneficios();
