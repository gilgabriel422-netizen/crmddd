const ContratoFisico = require('../models/ContratoFisico');
 
 // Crear un nuevo contrato físico
 exports.createContratoFisico = async (req, res) => {
   try {
     const { cliente_id, numero_contrato, fecha, archivo_url, observaciones, usuario_subida_id } = req.body;
     const contrato = await ContratoFisico.create({
       cliente_id,
       numero_contrato,
       fecha,
       archivo_url,
       observaciones,
       usuario_subida_id
     });
     res.status(201).json(contrato);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
 
 // Obtener todos los contratos físicos
 exports.getContratosFisicos = async (req, res) => {
   try {
     const contratos = await ContratoFisico.findAll();
     res.json(contratos);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };

// Obtener contratos físicos por cliente
exports.getContratosFisicosByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const contratos = await ContratoFisico.findAll({
      where: { cliente_id: clienteId },
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(contratos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
 // Obtener un contrato físico por ID
 exports.getContratoFisicoById = async (req, res) => {
   try {
     const contrato = await ContratoFisico.findByPk(req.params.id);
     if (!contrato) return res.status(404).json({ error: 'No encontrado' });
     res.json(contrato);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
 
 // Eliminar un contrato físico
 exports.deleteContratoFisico = async (req, res) => {
   try {
     const deleted = await ContratoFisico.destroy({ where: { id: req.params.id } });
     if (!deleted) return res.status(404).json({ error: 'No encontrado' });
     res.json({ message: 'Contrato eliminado' });
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };