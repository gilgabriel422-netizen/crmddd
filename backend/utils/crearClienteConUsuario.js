const pool = require('../config/pg-pool');

/**
 * Crear un cliente con su usuario asociado
 * @param {Object} clienteData - Datos del cliente
 * @param {string} rolCliente - Rol del cliente: 'blue', 'gold', 'black'
 * @returns {Object} - Cliente y usuario creados con sus credenciales
 */
async function crearClienteConUsuario(clienteData, rolCliente = 'blue') {
  const client = await pool.connect();
  
  try {
    console.log('\n📝 Iniciando creación de cliente con usuario...');
    console.log('📊 Datos recibidos:', JSON.stringify(clienteData, null, 2));
    
    await client.query('BEGIN');
    console.log('✅ Transacción iniciada');

    // 1. Crear el cliente
    const resultCliente = await client.query(
      `INSERT INTO clientes (
        first_name, last_name, email, phone, document_number, contract_number,
        fecha_registro, status, total_nights, remaining_nights, anos, anos_indefinido,
        international_bonus, total_amount, iva, neto, payment_status, categoria_cliente,
        pago_mixto, cantidad_tarjetas, datafast, tipo_tarjeta, forma_pago, tiempo_meses,
        empresa, telefono, direccion, ciudad, pais, notas, sala
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      ) RETURNING id, first_name, last_name, email`,
      [
        clienteData.first_name || '',
        clienteData.last_name || '',
        clienteData.email || '',
        clienteData.phone || '',
        clienteData.document_number || '',
        clienteData.contract_number || '',
        new Date().toISOString().split('T')[0],
        clienteData.status || 'activo',
        clienteData.total_nights || 0,
        clienteData.remaining_nights || 0,
        clienteData.anos || 0,
        clienteData.anos_indefinido || false,
        clienteData.international_bonus || 'No',
        clienteData.total_amount || 0,
        clienteData.iva || 0,
        clienteData.neto || 0,
        clienteData.payment_status || 'sin_pago',
        clienteData.categoria_cliente || null,
        clienteData.pago_mixto || 'No',
        clienteData.cantidad_tarjetas || 1,
        clienteData.datafast || false,
        clienteData.tipo_tarjeta || '',
        clienteData.forma_pago || '',
        clienteData.tiempo_meses || 0,
        clienteData.empresa || '',
        clienteData.telefono || '',
        clienteData.direccion || '',
        clienteData.ciudad || '',
        clienteData.pais || '',
        clienteData.notas || '',
        (clienteData.sala && (clienteData.sala === 'Sala 2' ? 'Sala 2' : 'Sala 1')) || 'Sala 1'
      ]
    );

    const clienteId = resultCliente.rows[0].id;
    const nombreCliente = `${resultCliente.rows[0].first_name} ${resultCliente.rows[0].last_name}`;
    console.log(`✅ Cliente creado con ID: ${clienteId}, Nombre: ${nombreCliente}`);

    // 2. Usar número de contrato como email y cédula como contraseña
    let numeroContrato = (clienteData.contract_number || '').trim();
    const cedula = (clienteData.document_number || '').trim();

    // Extraer solo el número final del contrato (después del último espacio)
    // Ej: "KMPRY SDSD 0005" → "0005"
    const partes = numeroContrato.split(' ');
    const numeroContratoFinal = partes[partes.length - 1];

    console.log(`📋 Número de contrato completo: '${numeroContrato}'`);
    console.log(`📋 Número de contrato para email: '${numeroContratoFinal}'`);
    console.log(`🆔 Cédula: '${cedula}'`);

    if (!numeroContratoFinal) {
      throw new Error('El número de contrato es requerido para crear las credenciales del usuario');
    }
    if (!cedula) {
      throw new Error('La cédula es requerida para crear las credenciales del usuario');
    }

    // Email: número de contrato FINAL + dominio
    const emailUsuario = `${numeroContratoFinal}@cliente.crm.com`;
    
    // Contraseña: la cédula del cliente (sin hashear, texto plano)
    const passwordPlain = cedula;

    console.log(`📧 Email a crear: ${emailUsuario}`);
    console.log(`🔐 Contraseña: ${passwordPlain}`);

    // 3. Crear el usuario
    const resultUsuario = await client.query(
      `INSERT INTO usuarios (nombre, email, password, rol, activo, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email) DO UPDATE 
       SET password = $3, rol = $4, activo = $5
       RETURNING id, nombre, email, rol`,
      [nombreCliente, emailUsuario, passwordPlain, rolCliente, true]
    );

    console.log(`✅ Usuario creado/actualizado con ID: ${resultUsuario.rows[0].id}`);

    const usuario = resultUsuario.rows[0];

    // 4. Actualizar cliente con referencia al usuario
    await client.query(
      'UPDATE clientes SET usuario_asignado_id = $1 WHERE id = $2',
      [usuario.id, clienteId]
    );

    // 5. Crear un contrato inicial para el cliente
    const numeroContrato = `CT${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const resultContrato = await client.query(
      `INSERT INTO contratos_viajes (
        cliente_id, numero_contrato, fecha_contrato, estado, creado_por
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, numero_contrato`,
      [clienteId, numeroContrato, new Date(), 'pendiente', 'admin']
    );

    console.log(`✅ Contrato creado con ID: ${resultContrato.rows[0].id}, Número: ${resultContrato.rows[0].numero_contrato}`);

    await client.query('COMMIT');

    return {
      success: true,
      cliente: {
        id: clienteId,
        nombre: nombreCliente,
        email: clienteData.email
      },
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      },
      contrato: {
        id: resultContrato.rows[0].id,
        numero_contrato: resultContrato.rows[0].numero_contrato
      },
      credenciales: {
        email: emailUsuario,
        password: passwordPlain,
        rol: rolCliente
      },
      mensaje: `✅ Cliente, usuario y contrato creados exitosamente.\n\n📧 Email: ${emailUsuario}\n🔐 Contraseña: ${passwordPlain}\n👤 Rol: ${rolCliente}\n📋 Contrato: ${resultContrato.rows[0].numero_contrato}`
    };
  } catch (error) {
    console.error('\n❌ ERROR en crearClienteConUsuario:', error.message);
    console.error('Stack:', error.stack);
    await client.query('ROLLBACK');
    console.log('⏮️ Transacción revertida');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = crearClienteConUsuario;
