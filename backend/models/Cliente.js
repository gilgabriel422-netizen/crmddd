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
      contract_number, total_nights, remaining_nights,
      international_bonus, total_amount, payment_status, pagare,
      pagare_fecha, pagare_monto, pagare_cuotas, pagare_cuotas_asumidas,
      pagare_valor_cuota, pagare_total, city, country, notes
    } = clienteData;

    const result = await pool.query(
      `INSERT INTO clientes (
        first_name, last_name, email, phone, document_number, contract_number,
        total_nights, remaining_nights, international_bonus, total_amount,
        payment_status, pagare, fecha_pagare, monto_pagare, pagare_cuotas,
        pagare_cuotas_asumidas, pagare_valor_cuota, pagare_total, ciudad, pais, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
      [first_name, last_name, email, phone, document_number, contract_number,
        total_nights, remaining_nights, international_bonus, total_amount,
        payment_status, pagare || 'No', pagare_fecha || null, pagare_monto || 0,
        pagare_cuotas || 1, pagare_cuotas_asumidas || 0, pagare_valor_cuota || 0,
        pagare_total || 0, city, country, notes]
    );
    return result.rows[0];
  }

  // Actualizar cliente
  static async update(id, clienteData) {
    // Construir dinámicamente el UPDATE basado en los campos proporcionados
    const campos = [];
    const valores = [];
    let paramCount = 1;

    // Campos que pueden ser actualizados
    const camposPermitidos = [
      'first_name', 'last_name', 'email', 'phone', 'document_number',
      'contract_number', 'fecha_registro', 'status', 'total_nights', 'remaining_nights',
      'anos', 'anos_indefinido', 'international_bonus', 'total_amount', 'iva', 'neto',
      'payment_status', 'categoria_cliente', 'pago_mixto', 'cantidad_tarjetas', 'tarjetas',
      'datafast', 'tipo_tarjeta', 'forma_pago', 'tiempo_meses', 'pagare', 'fecha_pagare',
      'monto_pagare', 'pagare_cuotas', 'pagare_cuotas_asumidas', 'pagare_valor_cuota',
      'pagare_total', 'linner', 'closer', 'empresa', 'telefono', 'direccion', 'ciudad', 'pais',
      'usuario_asignado_id', 'notas'
    ];

    // Mapear city/country/notes a ciudad/pais/notas
    const mapeo = {
      'city': 'ciudad',
      'country': 'pais',
      'notes': 'notas'
    };

    // Construir dinámicamente el UPDATE
    Object.keys(clienteData).forEach(key => {
      const nombreColumna = mapeo[key] || key;
      
      if (camposPermitidos.includes(nombreColumna)) {
        let valor = clienteData[key];
        
        // Manejo especial para tarjetas
        if (nombreColumna === 'tarjetas' && valor) {
          valor = JSON.stringify(valor);
        }
        
        campos.push(`${nombreColumna} = $${paramCount}`);
        valores.push(valor);
        paramCount++;
      }
    });

    // Agregar fecha_actualizacion
    campos.push(`fecha_actualizacion = NOW()`);
    valores.push(id);

    const sql = `UPDATE clientes SET ${campos.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(sql, valores);
    return result.rows[0];
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
