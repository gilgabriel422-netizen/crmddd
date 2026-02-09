const pool = require('../config/pg-pool');

class Cliente {
  // Obtener todos los clientes
  static async getAll() {
    try {
      const result = await pool.query(`
        SELECT * FROM clientes ORDER BY fecha_creacion DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  // Obtener cliente por ID
  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Crear nuevo cliente
  static async create(clienteData) {
    const { 
      first_name, last_name, email, phone, document_number,
      contract_number, fecha_registro, status, total_nights, remaining_nights,
      anos, anos_indefinido, international_bonus, total_amount, iva, neto,
      payment_status, categoria_cliente, pago_mixto, cantidad_tarjetas, tarjetas,
      datafast, tipo_tarjeta, forma_pago, tiempo_meses, pagare, fecha_pagare,
      monto_pagare, pagare_cuotas, pagare_cuotas_asumidas, pagare_valor_cuota,
      pagare_total, linner, closer, empresa, telefono, direccion, ciudad, pais,
      usuario_asignado_id, notas
    } = clienteData;

    const result = await pool.query(
      `INSERT INTO clientes (
        first_name, last_name, email, phone, document_number, contract_number,
        fecha_registro, status, total_nights, remaining_nights, anos, anos_indefinido,
        international_bonus, total_amount, iva, neto, payment_status, categoria_cliente,
        pago_mixto, cantidad_tarjetas, tarjetas, datafast, tipo_tarjeta, forma_pago,
        tiempo_meses, pagare, fecha_pagare, monto_pagare, pagare_cuotas,
        pagare_cuotas_asumidas, pagare_valor_cuota, pagare_total, linner, closer,
        empresa, telefono, direccion, ciudad, pais, usuario_asignado_id, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40) RETURNING *`,
      [first_name, last_name, email, phone, document_number, contract_number,
        fecha_registro, status, total_nights, remaining_nights, anos, anos_indefinido,
        international_bonus, total_amount, iva, neto, payment_status, categoria_cliente,
        pago_mixto, cantidad_tarjetas, tarjetas ? JSON.stringify(tarjetas) : null,
        datafast, tipo_tarjeta, forma_pago, tiempo_meses, pagare, fecha_pagare,
        monto_pagare, pagare_cuotas, pagare_cuotas_asumidas, pagare_valor_cuota,
        pagare_total, linner, closer, empresa, telefono, direccion, ciudad, pais,
        usuario_asignado_id, notas]
    );
    return result.rows[0];
  }

  // Actualizar cliente
  static async update(id, clienteData) {
    const { 
      first_name, last_name, email, phone, document_number, contract_number,
      fecha_registro, status, total_nights, remaining_nights, anos, anos_indefinido,
      international_bonus, total_amount, iva, neto, payment_status, categoria_cliente,
      pago_mixto, cantidad_tarjetas, tarjetas, datafast, tipo_tarjeta, forma_pago,
      tiempo_meses, pagare, fecha_pagare, monto_pagare, pagare_cuotas,
      pagare_cuotas_asumidas, pagare_valor_cuota, pagare_total, linner, closer,
      empresa, telefono, direccion, ciudad, pais, usuario_asignado_id, notas
    } = clienteData;

    const result = await pool.query(
      `UPDATE clientes SET 
        first_name = $1, last_name = $2, email = $3, phone = $4, document_number = $5,
        contract_number = $6, fecha_registro = $7, status = $8, total_nights = $9,
        remaining_nights = $10, anos = $11, anos_indefinido = $12, international_bonus = $13,
        total_amount = $14, iva = $15, neto = $16, payment_status = $17,
        categoria_cliente = $18, pago_mixto = $19, cantidad_tarjetas = $20, tarjetas = $21,
        datafast = $22, tipo_tarjeta = $23, forma_pago = $24, tiempo_meses = $25,
        pagare = $26, fecha_pagare = $27, monto_pagare = $28, pagare_cuotas = $29,
        pagare_cuotas_asumidas = $30, pagare_valor_cuota = $31, pagare_total = $32,
        linner = $33, closer = $34, empresa = $35, telefono = $36, direccion = $37,
        ciudad = $38, pais = $39, usuario_asignado_id = $40, notas = $41,
        fecha_actualizacion = NOW() WHERE id = $42 RETURNING *`,
      [first_name, last_name, email, phone, document_number, contract_number,
        fecha_registro, status, total_nights, remaining_nights, anos, anos_indefinido,
        international_bonus, total_amount, iva, neto, payment_status, categoria_cliente,
        pago_mixto, cantidad_tarjetas, tarjetas ? JSON.stringify(tarjetas) : null,
        datafast, tipo_tarjeta, forma_pago, tiempo_meses, pagare, fecha_pagare,
        monto_pagare, pagare_cuotas, pagare_cuotas_asumidas, pagare_valor_cuota,
        pagare_total, linner, closer, empresa, telefono, direccion, ciudad, pais,
        usuario_asignado_id, notas, id]
    );
    return result.rowCount;
  }

  // Eliminar cliente
  static async delete(id) {
    const result = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    return result.rowCount;
  }

  // Buscar clientes
  static async search(query) {
    const searchTerm = `%${query}%`;
    const result = await pool.query(`
      SELECT * FROM clientes 
      WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 
        OR contract_number ILIKE $1 OR document_number ILIKE $1
      ORDER BY fecha_creacion DESC
    `, [searchTerm]);
    return result.rows;
  }

  // Obtener clientes creados por admin
  static async getCreatedByAdmin() {
    const result = await pool.query(`
      SELECT * FROM clientes WHERE usuario_asignado_id IS NULL
      ORDER BY fecha_creacion DESC
    `);
    return result.rows;
  }
}

module.exports = Cliente;
