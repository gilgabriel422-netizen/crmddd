const pool = require('../config/pg-pool');

class ContratoViaje {
  /**
   * Generar número único de contrato
   */
  static generarNumeroContrato() {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CT${year}${month}-${random}`;
  }

  /**
   * Obtener todos los contratos
   */
  static async getAll() {
    try {
      const result = await pool.query(`
        SELECT cv.*, 
               c.first_name, c.last_name, c.email,
               ap.estado as estado_pago
        FROM contratos_viajes cv
        LEFT JOIN clientes c ON cv.cliente_id = c.id
        LEFT JOIN autorizaciones_pago ap ON cv.autorizacion_pago_id = ap.id
        ORDER BY cv.fecha_creacion DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  /**
   * Obtener contrato por ID
   */
  static async getById(id) {
    try {
      const result = await pool.query(
        `SELECT cv.*, 
                c.first_name, c.last_name, c.email, c.phone, c.document_number,
                c.ciudad, c.pais, c.direccion,
                ap.monto_numerico, ap.estado as estado_pago, ap.voucher_referencia
         FROM contratos_viajes cv
         LEFT JOIN clientes c ON cv.cliente_id = c.id
         LEFT JOIN autorizaciones_pago ap ON cv.autorizacion_pago_id = ap.id
         WHERE cv.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  /**
   * Obtener contratos de un cliente
   */
  static async getByClienteId(clienteId) {
    try {
      const result = await pool.query(
        `SELECT cv.*, 
                ap.monto_numerico, ap.estado as estado_pago
         FROM contratos_viajes cv
         LEFT JOIN autorizaciones_pago ap ON cv.autorizacion_pago_id = ap.id
         WHERE cv.cliente_id = $1
         ORDER BY cv.fecha_creacion DESC`,
        [clienteId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getByClienteId:', error);
      throw error;
    }
  }

  /**
   * Buscar por número de contrato
   */
  static async getByNumeroContrato(numeroContrato) {
    try {
      const result = await pool.query(
        `SELECT cv.*, 
                c.first_name, c.last_name, c.email
         FROM contratos_viajes cv
         LEFT JOIN clientes c ON cv.cliente_id = c.id
         WHERE cv.numero_contrato = $1`,
        [numeroContrato]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en getByNumeroContrato:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo contrato completo
   */
  static async create(contratoData) {
    const {
      cliente_id,
      autorizacion_pago_id,
      fecha_contrato,
      valor_contrato,
      anos_contrato,
      tarjeta_y_banco,
      numero_noches,
      pagare_numero,
      pagare_fecha_vencimiento,
      estadia_internacional,
      estadia_nacional,
      cortesias_por_asistencia,
      ofrecimientos_adicionales,
      aceptacion_cliente,
      datos_completos, // JSON con toda la plantilla
      creado_por,
      metadata = {}
    } = contratoData;

    try {
      // Generar número único de contrato
      let numero_contrato = this.generarNumeroContrato();
      let intentos = 0;
      
      // Verificar que el número sea único
      while (intentos < 10) {
        const existe = await this.getByNumeroContrato(numero_contrato);
        if (!existe) break;
        numero_contrato = this.generarNumeroContrato();
        intentos++;
      }

      const result = await pool.query(
        `INSERT INTO contratos_viajes (
          cliente_id, autorizacion_pago_id, numero_contrato, fecha_contrato,
          valor_contrato, anos_contrato, tarjeta_y_banco, numero_noches,
          pagare_numero, pagare_fecha_vencimiento,
          estadia_internacional, estadia_nacional,
          cortesias_por_asistencia, ofrecimientos_adicionales,
          aceptacion_cliente, datos_completos, creado_por, metadata, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *`,
        [
          cliente_id,
          autorizacion_pago_id,
          numero_contrato,
          fecha_contrato || new Date(),
          valor_contrato,
          anos_contrato,
          tarjeta_y_banco,
          numero_noches,
          pagare_numero,
          pagare_fecha_vencimiento,
          JSON.stringify(estadia_internacional || {}),
          JSON.stringify(estadia_nacional || {}),
          cortesias_por_asistencia,
          ofrecimientos_adicionales,
          JSON.stringify(aceptacion_cliente || {}),
          JSON.stringify(datos_completos || {}),
          creado_por,
          JSON.stringify(metadata),
          'pendiente'
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  /**
   * Actualizar contrato
   */
  static async update(id, contratoData) {
    const {
      valor_contrato,
      anos_contrato,
      tarjeta_y_banco,
      numero_noches,
      pagare_numero,
      pagare_fecha_vencimiento,
      estadia_internacional,
      estadia_nacional,
      cortesias_por_asistencia,
      ofrecimientos_adicionales,
      aceptacion_cliente,
      datos_completos,
      estado,
      metadata
    } = contratoData;

    try {
      const result = await pool.query(
        `UPDATE contratos_viajes 
         SET valor_contrato = COALESCE($1, valor_contrato),
             anos_contrato = COALESCE($2, anos_contrato),
             tarjeta_y_banco = COALESCE($3, tarjeta_y_banco),
             numero_noches = COALESCE($4, numero_noches),
             pagare_numero = COALESCE($5, pagare_numero),
             pagare_fecha_vencimiento = COALESCE($6, pagare_fecha_vencimiento),
             estadia_internacional = COALESCE($7, estadia_internacional),
             estadia_nacional = COALESCE($8, estadia_nacional),
             cortesias_por_asistencia = COALESCE($9, cortesias_por_asistencia),
             ofrecimientos_adicionales = COALESCE($10, ofrecimientos_adicionales),
             aceptacion_cliente = COALESCE($11, aceptacion_cliente),
             datos_completos = COALESCE($12, datos_completos),
             estado = COALESCE($13, estado),
             metadata = COALESCE($14, metadata)
         WHERE id = $15 
         RETURNING *`,
        [
          valor_contrato,
          anos_contrato,
          tarjeta_y_banco,
          numero_noches,
          pagare_numero,
          pagare_fecha_vencimiento,
          estadia_internacional ? JSON.stringify(estadia_internacional) : null,
          estadia_nacional ? JSON.stringify(estadia_nacional) : null,
          cortesias_por_asistencia,
          ofrecimientos_adicionales,
          aceptacion_cliente ? JSON.stringify(aceptacion_cliente) : null,
          datos_completos ? JSON.stringify(datos_completos) : null,
          estado,
          metadata ? JSON.stringify(metadata) : null,
          id
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  /**
   * Firmar contrato (cliente acepta)
   */
  static async firmar(id, datosAceptacion) {
    const { firma, nombre, fecha } = datosAceptacion;

    try {
      const aceptacion = {
        firma,
        nombre,
        fecha: fecha || new Date().toISOString()
      };

      const result = await pool.query(
        `UPDATE contratos_viajes 
         SET aceptacion_cliente = $1,
             estado = 'firmado'
         WHERE id = $2 
         RETURNING *`,
        [JSON.stringify(aceptacion), id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en firmar:', error);
      throw error;
    }
  }

  /**
   * Activar contrato
   */
  static async activar(id) {
    try {
      const result = await pool.query(
        `UPDATE contratos_viajes 
         SET estado = 'activo'
         WHERE id = $1 
         RETURNING *`,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en activar:', error);
      throw error;
    }
  }

  /**
   * Cancelar contrato
   */
  static async cancelar(id, motivo) {
    try {
      const result = await pool.query(
        `UPDATE contratos_viajes 
         SET estado = 'cancelado',
             metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{motivo_cancelacion}', $1)
         WHERE id = $2 
         RETURNING *`,
        [JSON.stringify(motivo), id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en cancelar:', error);
      throw error;
    }
  }

  /**
   * Eliminar contrato
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM contratos_viajes WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  /**
   * Obtener contratos por estado
   */
  static async getByEstado(estado) {
    try {
      const result = await pool.query(
        `SELECT cv.*, 
                c.first_name, c.last_name, c.email
         FROM contratos_viajes cv
         LEFT JOIN clientes c ON cv.cliente_id = c.id
         WHERE cv.estado = $1
         ORDER BY cv.fecha_creacion DESC`,
        [estado]
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getByEstado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de contratos
   */
  static async getEstadisticas() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'firmado' THEN 1 END) as firmados,
          COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
          COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as cancelados,
          COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
          SUM(valor_contrato) as valor_total,
          AVG(valor_contrato) as valor_promedio
        FROM contratos_viajes
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      throw error;
    }
  }
}

module.exports = ContratoViaje;
