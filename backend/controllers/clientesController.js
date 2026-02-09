const Cliente = require('../models/Cliente');

// Obtener todos los clientes
exports.getAllClientes = async (req, res) => {
  try {
    console.log('📋 Solicitando lista de clientes...');
    const clientes = await Cliente.getAll();
    console.log(`✅ Se encontraron ${clientes.length} clientes`);
    
    // Enviar en el formato que espera el frontend
    res.json({
      clients: clientes,
      pagination: {
        page: 1,
        limit: clientes.length,
        total: clientes.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Obtener cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.getById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// DUPLICADO ELIMINADO - Ver definición principal más abajo (línea ~215)
// exports.createCliente = async (req, res) => { ... }

// Actualizar cliente
exports.updateCliente = async (req, res) => {
  try {
    console.log('📤 Datos recibidos para actualizar cliente:', req.body);
    
    await Cliente.update(req.params.id, req.body);
    const cliente = await Cliente.getById(req.params.id);
    res.json(cliente);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// Eliminar cliente
exports.deleteCliente = async (req, res) => {
  try {
    await Cliente.delete(req.params.id);
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

// Buscar clientes
exports.searchClientes = async (req, res) => {
  try {
    const { q } = req.query;
    const clientes = await Cliente.search(q);
    res.json(clientes);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ error: 'Error al buscar clientes' });
  }
};

// Obtener clientes creados por el admin
exports.getClientesCreadoPorAdmin = async (req, res) => {
  try {
    const clientes = await Cliente.getCreatedByAdmin();
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes del admin:', error);
    res.status(500).json({ error: 'Error al obtener clientes del admin' });
  }
};

// Obtener cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// DUPLICADO ELIMINADO - Ver definición principal más abajo (línea ~200)
// exports.createCliente = async (req, res) => { ... }

// Actualizar cliente
exports.updateCliente = async (req, res) => {
  try {
    console.log('📤 Datos recibidos para actualizar cliente:', req.body);
    
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    await cliente.update(req.body);
    res.json(cliente);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// Eliminar cliente
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    await cliente.destroy();
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

// Buscar clientes
exports.searchClientes = async (req, res) => {
  try {
    const { q } = req.query;
    const clientes = await Cliente.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { first_name: { [require('sequelize').Op.iLike]: `%${q}%` } },
          { last_name: { [require('sequelize').Op.iLike]: `%${q}%` } },
          { email: { [require('sequelize').Op.iLike]: `%${q}%` } },
          { contract_number: { [require('sequelize').Op.iLike]: `%${q}%` } }
        ]
      },
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(clientes);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ error: 'Error al buscar clientes' });
  }
};

// Obtener clientes creados por el admin
exports.getClientesCreadoPorAdmin = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: {
        usuario_asignado_id: null
      },
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes del admin:', error);
    res.status(500).json({ error: 'Error al obtener clientes del admin' });
  }
};

// Obtener cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.getById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// Crear nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    console.log('📥 Datos recibidos para crear cliente:', req.body);
    
    // Usar crearClienteConUsuario para crear cliente + usuario + contrato
    const crearClienteConUsuario = require('../utils/crearClienteConUsuario');
    
    // Determinar el rol basado en categoria_cliente o usar 'blue' por defecto
    const rolCliente = req.body.categoria_cliente?.toLowerCase() || 'blue';
    
    const resultado = await crearClienteConUsuario(req.body, rolCliente);
    
    // Retornar respuesta con cliente, usuario y credenciales
    res.status(201).json({
      success: true,
      cliente: resultado.cliente,
      usuario: resultado.usuario,
      contrato: resultado.contrato,
      credenciales: resultado.credenciales,
      mensaje: resultado.mensaje
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al crear cliente' 
    });
  }
};

// Actualizar cliente
exports.updateCliente = async (req, res) => {
  try {
    const affectedRows = await Cliente.update(req.params.id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    const clienteActualizado = await Cliente.getById(req.params.id);
    res.json(clienteActualizado);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// Eliminar cliente
exports.deleteCliente = async (req, res) => {
  try {
    const affectedRows = await Cliente.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

// Buscar clientes
exports.searchClientes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Se requiere parámetro de búsqueda "q"' });
    }
    const clientes = await Cliente.search(q);
    res.json({
      clients: clientes,
      pagination: {
        page: 1,
        limit: clientes.length,
        total: clientes.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ error: 'Error al buscar clientes' });
  }
};

// Obtener clientes creados por admin@crm.com
exports.getClientesCreadoPorAdmin = async (req, res) => {
  try {
    const clientes = await Cliente.getCreatedByAdmin();
    res.json({
      clients: clientes,
      pagination: {
        page: 1,
        limit: clientes.length,
        total: clientes.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes creados por admin:', error);
    res.status(500).json({ error: 'Error al obtener clientes creados por admin' });
  }
};

/**
 * Crear cliente con usuario asociado
 * POST /api/clientes/crear-con-usuario
 * Body: { clienteData, rolCliente: 'blue'|'gold'|'black' }
 */
exports.crearClienteConUsuario = async (req, res) => {
  try {
    const { clienteData, rolCliente = 'blue' } = req.body;

    if (!clienteData) {
      return res.status(400).json({
        success: false,
        message: 'Datos del cliente requeridos'
      });
    }

    const crearClienteConUsuario = require('../utils/crearClienteConUsuario');
    const resultado = await crearClienteConUsuario(clienteData, rolCliente);

    res.status(201).json(resultado);
  } catch (error) {
    console.error('❌ Error al crear cliente con usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente con usuario',
      error: error.message
    });
  }
};
