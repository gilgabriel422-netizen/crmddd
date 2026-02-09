const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

async function initDatabase() {
  let client;

  try {
    // Conectar a PostgreSQL (a la base de datos postgres por defecto)
    client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: "postgres", // Conectar a la base postgres por defecto
    });

    await client.connect();
    console.log("✅ Conectado a PostgreSQL");

    // Verificar si la base de datos existe
    const dbExists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME],
    );

    if (dbExists.rows.length === 0) {
      // Crear la base de datos
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ Base de datos '${process.env.DB_NAME}' creada`);
    } else {
      console.log(`ℹ️  Base de datos '${process.env.DB_NAME}' ya existe`);
      console.log(
        `ℹ️  Las tablas existentes serán eliminadas y recreadas por el schema`,
      );
    }

    await client.end();

    // Conectar a la base de datos específica del CRM
    client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await client.connect();

    // Leer y ejecutar el schema (SIN usuarios)
    const schemaPath = path.join(__dirname, "database", "schema.sql");
    let schema = fs.readFileSync(schemaPath, "utf8");
    
    // Eliminar las líneas de INSERT de usuarios del schema
    schema = schema.replace(/-- Insertar usuario administrador[\s\S]*?'black'\);/g, '');
    
    await client.query(schema);
    console.log("✅ Tablas creadas correctamente");

    // Generar hash para 'admin123'
    console.log("🔐 Generando hash bcryptjs para contraseñas...");
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    console.log("✅ Hash generado");

    // Insertar usuarios con el hash generado
    const usuarios = [
      { nombre: 'Administrador', email: 'admin@crm.com', rol: 'admin' },
      { nombre: 'Cobranzas', email: 'cobranzas@crm.com', rol: 'cobranzas' },
      { nombre: 'Contratos', email: 'contratos@crm.com', rol: 'contratos' },
      { nombre: 'Atención Cliente', email: 'atencion@crm.com', rol: 'atencion' },
      { nombre: 'Postventa', email: 'postventa@crm.com', rol: 'postventa' },
      { nombre: 'Cliente Blue', email: 'cliente@crm.com', rol: 'blue' },
      { nombre: 'Cliente Blue (alias)', email: 'clientes@crm.com', rol: 'blue' },
      { nombre: 'Cliente Gold', email: 'clienteib1@crm.com', rol: 'gold' },
      { nombre: 'Cliente Black', email: 'clienteib2@crm.com', rol: 'black' }
    ];

    for (const usuario of usuarios) {
      await client.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
        [usuario.nombre, usuario.email, hashedPassword, usuario.rol]
      );
    }
    console.log("✅ Usuarios insertados correctamente");

    // Insertar clientes de prueba
    console.log("📋 Insertando clientes de prueba...");
    await client.query(`
      INSERT INTO clientes (
        first_name, last_name, email, phone, document_number, contract_number, 
        fecha_registro, status, total_nights, remaining_nights, anos, 
        international_bonus, total_amount, iva, neto, payment_status,
        ciudad, pais, usuario_asignado_id, notas, linner, closer
      ) VALUES
        ('Carlos', 'Rodríguez', 'carlos@techsolutions.com', '+34 600 123 456', '1234567890', 'KMPRY UIO 0001', 
         '2024-01-15', 'activo', 7, 7, 2, 'Si', 2500.00, 326.09, 2173.91, 'pagado',
         'Madrid', 'España', 2, 'Cliente potencial interesado en servicios de consultoría', 'María González', 'Juan Pérez'),
         
        ('Ana', 'Martínez', 'ana@globalimports.com', '+34 600 234 567', '0987654321', 'KMPRY GYE 0002', 
         '2024-02-10', 'activo', 14, 10, 3, 'No', 3500.00, 456.52, 3043.48, 'pago_parcial',
         'Barcelona', 'España', 2, 'Primera reunión programada para la próxima semana', 'Pedro Sánchez', 'Carlos López'),
         
        ('Luis', 'Fernández', 'luis@innovatech.com', '+34 600 345 678', '1122334455', 'KMPRY CUE 0003', 
         '2024-03-05', 'activo', 10, 10, 0, 'Si', 1800.00, 234.78, 1565.22, 'sin_pago',
         'Valencia', 'España', 3, 'Budget confirmado, esperando propuesta', 'Ana Torres', 'Luis García'),
         
        ('Elena', 'Torres', 'elena@digitalmarketingpro.com', '+34 600 456 789', '5566778899', 'KMPRY UIO 0004', 
         '2024-03-20', 'activo', 21, 21, 5, 'No', 5000.00, 652.17, 4347.83, 'pagado',
         'Sevilla', 'España', 3, 'Propuesta enviada, seguimiento en 3 días', 'María González', 'Juan Pérez');
    `);
    console.log("✅ Clientes insertados correctamente");

    // Insertar contactos
    console.log("👥 Insertando contactos...");
    await client.query(`
      INSERT INTO contactos (cliente_id, nombre, cargo, email, telefono, es_principal) VALUES
        (1, 'Carlos Rodríguez', 'CEO', 'carlos@techsolutions.com', '+34 600 123 456', TRUE),
        (1, 'Pedro Sánchez', 'CTO', 'pedro@techsolutions.com', '+34 600 111 222', FALSE),
        (2, 'Ana Martínez', 'Directora de Compras', 'ana@globalimports.com', '+34 600 234 567', TRUE),
        (3, 'Luis Fernández', 'CEO', 'luis@innovatech.com', '+34 600 345 678', TRUE),
        (4, 'Elena Torres', 'CMO', 'elena@digitalmarketingpro.com', '+34 600 456 789', TRUE);
    `);
    console.log("✅ Contactos insertados correctamente");

    // Insertar actividades
    console.log("📅 Insertando actividades...");
    await client.query(`
      INSERT INTO actividades (cliente_id, contacto_id, usuario_id, tipo, titulo, descripcion, fecha_actividad, completada) VALUES
        (1, 1, 2, 'llamada', 'Primera llamada de contacto', 'Contacto inicial para presentar servicios', CURRENT_TIMESTAMP - INTERVAL '2 days', TRUE),
        (1, 2, 2, 'reunion', 'Reunión técnica', 'Discutir requisitos técnicos del proyecto', CURRENT_TIMESTAMP + INTERVAL '3 days', FALSE),
        (2, 3, 2, 'email', 'Envío de información', 'Enviar catálogo de productos y precios', CURRENT_TIMESTAMP - INTERVAL '1 day', TRUE),
        (2, 3, 2, 'tarea', 'Preparar propuesta', 'Elaborar propuesta comercial personalizada', CURRENT_TIMESTAMP + INTERVAL '2 days', FALSE),
        (3, 4, 3, 'llamada', 'Seguimiento de propuesta', 'Verificar recepción y resolver dudas', CURRENT_TIMESTAMP - INTERVAL '5 hours', TRUE),
        (4, 5, 3, 'reunion', 'Presentación de propuesta', 'Presentación formal de la propuesta comercial', CURRENT_TIMESTAMP + INTERVAL '1 day', FALSE);
    `);
    console.log("✅ Actividades insertadas correctamente");

    console.log("");
    console.log("📝 Usuarios de desarrollo (contraseña: admin123):");
    console.log("   admin@crm.com (admin)");
    console.log(
      "   cobranzas@crm.com, contratos@crm.com, atencion@crm.com, postventa@crm.com",
    );
    console.log(
      "   cliente@crm.com (Blue), clienteib1@crm.com (Gold), clienteib2@crm.com (Black)",
    );
    console.log("");
    console.log("⚠️  IMPORTANTE: Cambia las contraseñas en producción");

    await client.end();
    console.log("");
    console.log(
      "🎉 ¡Inicialización completada! Puedes iniciar el servidor con: npm run dev",
    );
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error.message);
    if (client) await client.end();
    process.exit(1);
  }
}

initDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
