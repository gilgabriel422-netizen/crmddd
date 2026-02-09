const pool = require('./config/pg-pool');

const createTablesScript = async () => {
  try {
    console.log('📋 Creando tabla adjuntos_contratos...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS adjuntos_contratos (
        id SERIAL PRIMARY KEY,
        contrato_id INTEGER NOT NULL REFERENCES contratos_viajes(id) ON DELETE CASCADE,
        nombre_original VARCHAR(255) NOT NULL,
        nombre_guardado VARCHAR(255) NOT NULL UNIQUE,
        ruta VARCHAR(512) NOT NULL,
        tamaño INTEGER,
        tipo_mime VARCHAR(50) DEFAULT 'application/pdf',
        descripcion TEXT,
        tipo_documento VARCHAR(50) DEFAULT 'otro' CHECK(
          tipo_documento IN ('contrato', 'carta_diferimiento', 'autorizacion', 'beneficios', 'terminos', 'otro')
        ),
        usuario_id INTEGER,
        fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_adjuntos_contrato_id ON adjuntos_contratos(contrato_id);
      CREATE INDEX IF NOT EXISTS idx_adjuntos_fecha ON adjuntos_contratos(fecha_subida);
    `);

    console.log('✅ Tabla adjuntos_contratos creada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear tabla:', error);
    process.exit(1);
  }
};

createTablesScript();
