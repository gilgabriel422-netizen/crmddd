const db = require('./config/database');

async function crearMasRoles() {
  const passwordHash = '$2a$10$kr66QtV8DmTzS897GhPVjeUg9DSdIkzDIWmpW5mmfQyd4RKLEQ7Um'; // admin123
  await db.query(`
    INSERT INTO usuarios (nombre, email, password, rol) VALUES
      ('Usuario Cobranzas', 'cobranzas@crm.com', '${passwordHash}', 'cobranzas'),
      ('Usuario Servicio al Cliente', 'servicio@crm.com', '${passwordHash}', 'servicio'),
      ('Usuario Contracto', 'contracto@crm.com', '${passwordHash}', 'contracto'),
      ('Usuario Postventa', 'postventa@crm.com', '${passwordHash}', 'postventa')
    ON CONFLICT (email) DO NOTHING;
  `);

  const r = await db.query('SELECT id, nombre, email, rol FROM usuarios');
  console.log(r.rows);
  process.exit(0);
}

crearMasRoles();
