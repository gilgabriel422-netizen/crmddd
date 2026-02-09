const db = require('./config/database');

async function crearRolesYUsuarios() {
  // Actualizar rol del admin
  await db.query("UPDATE usuarios SET rol='admin' WHERE email='admin@crm.com';");

  // Crear clientes blue, gold y black
  const passwordHash = '$2a$10$kr66QtV8DmTzS897GhPVjeUg9DSdIkzDIWmpW5mmfQyd4RKLEQ7Um'; // admin123
  await db.query(`
    INSERT INTO usuarios (nombre, email, password, rol) VALUES
      ('Cliente Blue', 'blue@crm.com', '${passwordHash}', 'blue'),
      ('Cliente Gold', 'gold@crm.com', '${passwordHash}', 'gold'),
      ('Cliente Black', 'black@crm.com', '${passwordHash}', 'black')
    ON CONFLICT (email) DO NOTHING;
  `);

  const r = await db.query('SELECT id, nombre, email, rol FROM usuarios');
  console.log(r.rows);
  process.exit(0);
}

crearRolesYUsuarios();
