const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function poblarDatos() {
  try {
    console.log('🔄 Poblando base de datos con datos de prueba...\n');

    // Limpiar datos existentes (excepto el admin)
    console.log('🧹 Limpiando datos existentes...');
    await db.query('DELETE FROM actividades WHERE id > 0');
    await db.query('DELETE FROM contactos WHERE id > 0');
    await db.query('DELETE FROM clientes WHERE id > 0');
    await db.query('DELETE FROM usuarios WHERE id > 1'); // Mantener el admin
    console.log('✅ Datos limpiados\n');

    // Insertar usuarios adicionales
    console.log('👥 Insertando usuarios...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const usuarios = [
      { nombre: 'María García', email: 'maria.garcia@crm.com', password: hashedPassword, rol: 'vendedor' },
      { nombre: 'Carlos López', email: 'carlos.lopez@crm.com', password: hashedPassword, rol: 'vendedor' },
      { nombre: 'Ana Martínez', email: 'ana.martinez@crm.com', password: hashedPassword, rol: 'admin' }
    ];

    const usuariosIds = [];
    for (const usuario of usuarios) {
      const result = await db.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id',
        [usuario.nombre, usuario.email, usuario.password, usuario.rol]
      );
      usuariosIds.push(result.rows[0].id);
    }
    console.log(`✅ ${usuarios.length} usuarios insertados\n`);

    // Insertar clientes
    console.log('🏢 Insertando clientes...');
    const clientes = [
      {
        nombre: 'Juan Pérez',
        empresa: 'Tech Solutions S.A.',
        email: 'juan.perez@techsolutions.com',
        telefono: '+34 600 123 456',
        direccion: 'Calle Mayor 123',
        ciudad: 'Madrid',
        pais: 'España',
        estado: 'activo',
        notas: 'Cliente premium con contrato anual',
        usuario_asignado_id: usuariosIds[0]
      },
      {
        nombre: 'Laura Fernández',
        empresa: 'Innovate Corp',
        email: 'laura.fernandez@innovate.com',
        telefono: '+34 611 234 567',
        direccion: 'Avenida Principal 456',
        ciudad: 'Barcelona',
        pais: 'España',
        estado: 'activo',
        notas: 'Interesado en servicios cloud',
        usuario_asignado_id: usuariosIds[1]
      },
      {
        nombre: 'Roberto Silva',
        empresa: 'Digital Marketing Pro',
        email: 'roberto.silva@digitalmp.com',
        telefono: '+34 622 345 678',
        direccion: 'Plaza Central 789',
        ciudad: 'Valencia',
        pais: 'España',
        estado: 'prospecto',
        notas: 'Contacto inicial realizado',
        usuario_asignado_id: usuariosIds[0]
      },
      {
        nombre: 'Carmen Ruiz',
        empresa: 'Global Logistics Ltd',
        email: 'carmen.ruiz@globallog.com',
        telefono: '+34 633 456 789',
        direccion: 'Calle Comercio 321',
        ciudad: 'Sevilla',
        pais: 'España',
        estado: 'activo',
        notas: 'Cliente desde 2023',
        usuario_asignado_id: usuariosIds[2]
      },
      {
        nombre: 'Miguel Torres',
        empresa: 'EcoEnergy S.L.',
        email: 'miguel.torres@ecoenergy.com',
        telefono: '+34 644 567 890',
        direccion: 'Paseo Verde 555',
        ciudad: 'Bilbao',
        pais: 'España',
        estado: 'prospecto',
        notas: 'Evaluando propuesta',
        usuario_asignado_id: usuariosIds[1]
      },
      {
        nombre: 'Isabel Moreno',
        empresa: 'HealthCare Plus',
        email: 'isabel.moreno@healthcare.com',
        telefono: '+34 655 678 901',
        direccion: 'Calle Salud 888',
        ciudad: 'Málaga',
        pais: 'España',
        estado: 'activo',
        notas: 'Renovación de contrato próxima',
        usuario_asignado_id: usuariosIds[0]
      },
      {
        nombre: 'David Jiménez',
        empresa: 'FoodTech Innovations',
        email: 'david.jimenez@foodtech.com',
        telefono: '+34 666 789 012',
        direccion: 'Avenida Gastronomía 999',
        ciudad: 'Zaragoza',
        pais: 'España',
        estado: 'inactivo',
        notas: 'Sin actividad desde hace 6 meses',
        usuario_asignado_id: usuariosIds[2]
      },
      {
        nombre: 'Patricia Sánchez',
        empresa: 'EduLearn Platform',
        email: 'patricia.sanchez@edulearn.com',
        telefono: '+34 677 890 123',
        direccion: 'Calle Educación 147',
        ciudad: 'Murcia',
        pais: 'España',
        estado: 'activo',
        notas: 'Cliente estratégico',
        usuario_asignado_id: usuariosIds[1]
      },
      {
        nombre: 'Francisco Vega',
        empresa: 'AutoParts Express',
        email: 'francisco.vega@autoparts.com',
        telefono: '+34 688 901 234',
        direccion: 'Polígono Industrial 25',
        ciudad: 'Granada',
        pais: 'España',
        estado: 'prospecto',
        notas: 'Solicitud de presupuesto enviada',
        usuario_asignado_id: usuariosIds[0]
      },
      {
        nombre: 'Elena Castro',
        empresa: 'Fashion Design Studio',
        email: 'elena.castro@fashiondesign.com',
        telefono: '+34 699 012 345',
        direccion: 'Calle Moda 369',
        ciudad: 'Alicante',
        pais: 'España',
        estado: 'activo',
        notas: 'Colaboración en campaña de verano',
        usuario_asignado_id: usuariosIds[2]
      }
    ];

    const clientesIds = [];
    for (const cliente of clientes) {
      const result = await db.query(
        `INSERT INTO clientes (nombre, empresa, email, telefono, direccion, ciudad, pais, estado, notas, usuario_asignado_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [cliente.nombre, cliente.empresa, cliente.email, cliente.telefono, cliente.direccion, 
         cliente.ciudad, cliente.pais, cliente.estado, cliente.notas, cliente.usuario_asignado_id]
      );
      clientesIds.push(result.rows[0].id);
    }
    console.log(`✅ ${clientes.length} clientes insertados\n`);

    // Insertar contactos
    console.log('📞 Insertando contactos...');
    const contactos = [
      { cliente_id: clientesIds[0], nombre: 'María González', cargo: 'CTO', email: 'maria.gonzalez@techsolutions.com', telefono: '+34 600 111 111', es_principal: true },
      { cliente_id: clientesIds[0], nombre: 'Pedro Ramírez', cargo: 'Director IT', email: 'pedro.ramirez@techsolutions.com', telefono: '+34 600 111 112', es_principal: false },
      { cliente_id: clientesIds[1], nombre: 'Sofía Navarro', cargo: 'CEO', email: 'sofia.navarro@innovate.com', telefono: '+34 611 222 222', es_principal: true },
      { cliente_id: clientesIds[2], nombre: 'Javier Ortiz', cargo: 'Marketing Manager', email: 'javier.ortiz@digitalmp.com', telefono: '+34 622 333 333', es_principal: true },
      { cliente_id: clientesIds[3], nombre: 'Lucía Herrera', cargo: 'Operations Director', email: 'lucia.herrera@globallog.com', telefono: '+34 633 444 444', es_principal: true },
      { cliente_id: clientesIds[4], nombre: 'Alberto Díaz', cargo: 'Technical Director', email: 'alberto.diaz@ecoenergy.com', telefono: '+34 644 555 555', es_principal: true },
      { cliente_id: clientesIds[5], nombre: 'Rosa Molina', cargo: 'Medical Director', email: 'rosa.molina@healthcare.com', telefono: '+34 655 666 666', es_principal: true },
      { cliente_id: clientesIds[6], nombre: 'Andrés Guerrero', cargo: 'Innovation Manager', email: 'andres.guerrero@foodtech.com', telefono: '+34 666 777 777', es_principal: true },
      { cliente_id: clientesIds[7], nombre: 'Marta Romero', cargo: 'Academic Director', email: 'marta.romero@edulearn.com', telefono: '+34 677 888 888', es_principal: true },
      { cliente_id: clientesIds[8], nombre: 'Jorge Blanco', cargo: 'Sales Manager', email: 'jorge.blanco@autoparts.com', telefono: '+34 688 999 999', es_principal: true },
      { cliente_id: clientesIds[9], nombre: 'Cristina Medina', cargo: 'Creative Director', email: 'cristina.medina@fashiondesign.com', telefono: '+34 699 000 000', es_principal: true }
    ];

    for (const contacto of contactos) {
      await db.query(
        'INSERT INTO contactos (cliente_id, nombre, cargo, email, telefono, es_principal) VALUES ($1, $2, $3, $4, $5, $6)',
        [contacto.cliente_id, contacto.nombre, contacto.cargo, contacto.email, contacto.telefono, contacto.es_principal]
      );
    }
    console.log(`✅ ${contactos.length} contactos insertados\n`);

    // Insertar actividades
    console.log('📅 Insertando actividades...');
    const actividades = [
      { cliente_id: clientesIds[0], usuario_id: usuariosIds[0], titulo: 'Reunión inicial', descripcion: 'Presentación de servicios', tipo: 'reunion', fecha_actividad: '2026-01-15', completada: true },
      { cliente_id: clientesIds[0], usuario_id: usuariosIds[0], titulo: 'Seguimiento proyecto', descripcion: 'Revisión de avances', tipo: 'llamada', fecha_actividad: '2026-01-22', completada: false },
      { cliente_id: clientesIds[1], usuario_id: usuariosIds[1], titulo: 'Envío de propuesta', descripcion: 'Propuesta comercial cloud', tipo: 'email', fecha_actividad: '2026-01-18', completada: true },
      { cliente_id: clientesIds[1], usuario_id: usuariosIds[1], titulo: 'Reunión de cierre', descripcion: 'Firma de contrato', tipo: 'reunion', fecha_actividad: '2026-01-25', completada: false },
      { cliente_id: clientesIds[2], usuario_id: usuariosIds[0], titulo: 'Primera llamada', descripcion: 'Contacto inicial', tipo: 'llamada', fecha_actividad: '2026-01-10', completada: true },
      { cliente_id: clientesIds[3], usuario_id: usuariosIds[2], titulo: 'Renovación contrato', descripcion: 'Discutir términos de renovación', tipo: 'reunion', fecha_actividad: '2026-02-01', completada: false },
      { cliente_id: clientesIds[4], usuario_id: usuariosIds[1], titulo: 'Envío presupuesto', descripcion: 'Presupuesto servicios energía', tipo: 'email', fecha_actividad: '2026-01-20', completada: true },
      { cliente_id: clientesIds[5], usuario_id: usuariosIds[0], titulo: 'Revisión trimestral', descripcion: 'Revisión de resultados Q1', tipo: 'reunion', fecha_actividad: '2026-01-28', completada: false },
      { cliente_id: clientesIds[6], usuario_id: usuariosIds[2], titulo: 'Reactivación cuenta', descripcion: 'Intentar reactivar cliente', tipo: 'llamada', fecha_actividad: '2026-01-30', completada: false },
      { cliente_id: clientesIds[7], usuario_id: usuariosIds[1], titulo: 'Presentación productos', descripcion: 'Demo de nuevas funcionalidades', tipo: 'reunion', fecha_actividad: '2026-01-23', completada: false },
      { cliente_id: clientesIds[8], usuario_id: usuariosIds[0], titulo: 'Respuesta consulta', descripcion: 'Aclarar dudas técnicas', tipo: 'email', fecha_actividad: '2026-01-17', completada: true },
      { cliente_id: clientesIds[9], usuario_id: usuariosIds[2], titulo: 'Planificación campaña', descripcion: 'Estrategia campaña verano', tipo: 'reunion', fecha_actividad: '2026-01-26', completada: false }
    ];

    for (const actividad of actividades) {
      await db.query(
        `INSERT INTO actividades (cliente_id, usuario_id, titulo, descripcion, tipo, fecha_actividad, completada) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [actividad.cliente_id, actividad.usuario_id, actividad.titulo, actividad.descripcion, 
         actividad.tipo, actividad.fecha_actividad, actividad.completada]
      );
    }
    console.log(`✅ ${actividades.length} actividades insertadas\n`);

    console.log('🎉 ¡Base de datos poblada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Usuarios: ${usuarios.length}`);
    console.log(`   - Clientes: ${clientes.length}`);
    console.log(`   - Contactos: ${contactos.length}`);
    console.log(`   - Actividades: ${actividades.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

poblarDatos();
