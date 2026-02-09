const db = require('../config/database');

class Contacto {
  // Obtener todos los contactos
  static async getAll() {
    const result = await db.query(
      'SELECT * FROM contactos ORDER BY nombre ASC'
    );
    return result.rows;
  }

  // Obtener todos los contactos de un cliente
  static async getByClienteId(clienteId) {
    const result = await db.query(
      'SELECT * FROM contactos WHERE cliente_id = $1 ORDER BY es_principal DESC, nombre ASC',
      [clienteId]
    );
    return result.rows;
  }

  // Obtener contacto por ID
  static async getById(id) {
    const result = await db.query('SELECT * FROM contactos WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Crear nuevo contacto
  static async create(contactoData) {
    const { cliente_id, nombre, cargo, email, telefono, es_principal } = contactoData;
    const result = await db.query(
      'INSERT INTO contactos (cliente_id, nombre, cargo, email, telefono, es_principal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [cliente_id, nombre, cargo, email, telefono, es_principal || false]
    );
    return result.rows[0].id;
  }

  // Actualizar contacto
  static async update(id, contactoData) {
    const { nombre, cargo, email, telefono, es_principal } = contactoData;
    const result = await db.query(
      'UPDATE contactos SET nombre = $1, cargo = $2, email = $3, telefono = $4, es_principal = $5 WHERE id = $6',
      [nombre, cargo, email, telefono, es_principal, id]
    );
    return result.rowCount;
  }

  // Eliminar contacto
  static async delete(id) {
    const result = await db.query('DELETE FROM contactos WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = Contacto;
