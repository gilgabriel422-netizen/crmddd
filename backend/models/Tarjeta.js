const pool = require('../config/pg-pool');

class Tarjeta {
  /**
   * Obtener todas las tarjetas de un cliente
   */
  static async getByClienteId(clienteId) {
    try {
      const result = await pool.query(
        `SELECT * FROM clientes_tarjetas 
         WHERE cliente_id = $1 
         ORDER BY es_principal DESC, fecha_creacion DESC`,
        [clienteId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getByClienteId:', error);
      throw error;
    }
  }

  /**
   * Obtener tarjeta por ID
   */
  static async getById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM clientes_tarjetas WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  /**
   * Crear nueva tarjeta
   */
  static async create(tarjetaData) {
    const {
      cliente_id,
      nombre_tarjetahabiente,
      tipo_tarjeta,
      numero_tarjeta,
      fecha_caducidad,
      es_principal = false
    } = tarjetaData;

    try {
      // Extraer últimos 4 dígitos
      const ultimos_digitos = numero_tarjeta ? numero_tarjeta.slice(-4) : null;
      
      // Si es principal, desmarcar otras tarjetas principales
      if (es_principal) {
        await pool.query(
          'UPDATE clientes_tarjetas SET es_principal = false WHERE cliente_id = $1',
          [cliente_id]
        );
      }

      const result = await pool.query(
        `INSERT INTO clientes_tarjetas (
          cliente_id, nombre_tarjetahabiente, tipo_tarjeta, 
          numero_tarjeta, ultimos_digitos, fecha_caducidad, es_principal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          cliente_id,
          nombre_tarjetahabiente,
          tipo_tarjeta,
          numero_tarjeta, // En producción deberías encriptar esto
          ultimos_digitos,
          fecha_caducidad,
          es_principal
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  /**
   * Actualizar tarjeta
   */
  static async update(id, tarjetaData) {
    const {
      nombre_tarjetahabiente,
      tipo_tarjeta,
      fecha_caducidad,
      estado,
      es_principal
    } = tarjetaData;

    try {
      // Si se marca como principal, desmarcar otras
      if (es_principal) {
        const tarjeta = await this.getById(id);
        if (tarjeta) {
          await pool.query(
            'UPDATE clientes_tarjetas SET es_principal = false WHERE cliente_id = $1 AND id != $2',
            [tarjeta.cliente_id, id]
          );
        }
      }

      const result = await pool.query(
        `UPDATE clientes_tarjetas 
         SET nombre_tarjetahabiente = COALESCE($1, nombre_tarjetahabiente),
             tipo_tarjeta = COALESCE($2, tipo_tarjeta),
             fecha_caducidad = COALESCE($3, fecha_caducidad),
             estado = COALESCE($4, estado),
             es_principal = COALESCE($5, es_principal)
         WHERE id = $6 
         RETURNING *`,
        [nombre_tarjetahabiente, tipo_tarjeta, fecha_caducidad, estado, es_principal, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  /**
   * Eliminar tarjeta
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM clientes_tarjetas WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  /**
   * Obtener tarjeta principal de un cliente
   */
  static async getPrincipal(clienteId) {
    try {
      const result = await pool.query(
        `SELECT * FROM clientes_tarjetas 
         WHERE cliente_id = $1 AND es_principal = true 
         LIMIT 1`,
        [clienteId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en getPrincipal:', error);
      throw error;
    }
  }

  /**
   * Validar si tarjeta está expirada
   */
  static estaExpirada(fecha_caducidad) {
    if (!fecha_caducidad) return false;
    
    const [mes, anio] = fecha_caducidad.split('/');
    const fechaExpiracion = new Date(parseInt(anio), parseInt(mes) - 1);
    const hoy = new Date();
    
    return fechaExpiracion < hoy;
  }

  /**
   * Marcar como principal
   */
  static async marcarComoPrincipal(id) {
    try {
      const tarjeta = await this.getById(id);
      if (!tarjeta) {
        throw new Error('Tarjeta no encontrada');
      }

      // Desmarcar todas las tarjetas del cliente
      await pool.query(
        'UPDATE clientes_tarjetas SET es_principal = false WHERE cliente_id = $1',
        [tarjeta.cliente_id]
      );

      // Marcar esta como principal
      const result = await pool.query(
        'UPDATE clientes_tarjetas SET es_principal = true WHERE id = $1 RETURNING *',
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en marcarComoPrincipal:', error);
      throw error;
    }
  }
}

module.exports = Tarjeta;
