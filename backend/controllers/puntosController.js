const Punto = require('../models/Punto');

exports.getByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const punto = await Punto.findOne({ where: { email } });
    if (!punto) return res.json({ email, puntos: 0 });
    res.json({ email: punto.email, puntos: punto.puntos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo puntos' });
  }
}

exports.setPoints = async (req, res) => {
  try {
    const { email, cliente_id, puntos } = req.body;
    const [record, created] = await Punto.findOrCreate({ 
      where: { email }, 
      defaults: { cliente_id, puntos } 
    });
    if (!created) {
      record.puntos = Number(puntos || 0);
      record.cliente_id = cliente_id || record.cliente_id;
      record.actualizado_en = new Date();
      await record.save();
    }
    res.json({ email: record.email, puntos: record.puntos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error seteando puntos' });
  }
}

exports.addPoints = async (req, res) => {
  try {
    const { email } = req.params;
    const { delta } = req.body;
    const [record] = await Punto.findOrCreate({ 
      where: { email }, 
      defaults: { puntos: 0 } 
    });
    record.puntos = Number(record.puntos || 0) + Number(delta || 0);
    record.actualizado_en = new Date();
    await record.save();
    res.json({ email: record.email, puntos: record.puntos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sumando puntos' });
  }
}

exports.clearAll = async (req, res) => {
  try {
    await Punto.destroy({ where: {} });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error limpiando puntos' });
  }
}
