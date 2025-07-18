const { TortaBase, PrecioPorcionTortaBase } = require('../models');

const getAllTortasBase = async (req, res) => {
  try {
    const tortas = await TortaBase.findAll({
      where: { activo: true },
      include: [{ model: PrecioPorcionTortaBase, as: 'preciosPorciones' }]
    });
    res.json(tortas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tortas base', error: error.message });
  }
};

const getTortaBaseById = async (req, res) => {
  const { id } = req.params;

  try {
    const torta = await TortaBase.findOne({
      where: { id, activo: true },
      include: [{ model: PrecioPorcionTortaBase, as: 'preciosPorciones' }]
    });
    if (!torta) {
      return res.status(404).json({ mensaje: 'Torta base no encontrada o inactiva' });
    }
    res.json(torta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la torta base', error: error.message });
  }
};

const createTortaBase = async (req, res) => {
  const { nombre,descripcion, imagen_url } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre es requerido' });
  }

  try {
    const torta = await TortaBase.create({ nombre, descripcion, imagen_url, activo: true });
    res.status(201).json(torta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la torta base', error: error.message });
  }
};

const updateTortaBase = async (req, res) => {
  const { id } = req.params;
  const { nombre,descripcion, imagen_url, activo } = req.body;

  if (!nombre && !descripcion && !imagen_url && activo === undefined) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const torta = await TortaBase.findByPk(id);
    if (!torta) {
      return res.status(404).json({ mensaje: 'Torta base no encontrada' });
    }

    await torta.update({ nombre, descripcion, imagen_url, activo });
    res.json(torta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la torta base', error: error.message });
  }
};

const deleteTortaBase = async (req, res) => {
  const { id } = req.params;
  try {
    const tortaBase = await TortaBase.findByPk(id);
    if (!tortaBase) {
      return res.status(404).json({ mensaje: 'Torta base no encontrada' });
    }
    if (!tortaBase.activo) {
      return res.status(400).json({ mensaje: 'La torta base ya está inactiva' });
    }

    const referencias = await TortaCompleta.count({ where: { id_tortas_base: id } });
    if (referencias > 0) {
      return res.status(400).json({ mensaje: 'No se puede eliminar la torta base porque está referenciada en tortas completas' });
    }

    await tortaBase.update({ activo: false });
    res.json({ mensaje: 'Torta base suspendida exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al suspender la torta base', error: error.message });
  }
};

const addPrecioPorcion = async (req, res) => {
  const { id } = req.params;
  const { porciones, precio } = req.body;

  if (!porciones || !precio) {
    return res.status(400).json({ mensaje: 'Porciones y precio son requeridos' });
  }

  try {
    const torta = await TortaBase.findOne({ where: { id, activo: true } });
    if (!torta) {
      return res.status(404).json({ mensaje: 'Torta base no encontrada o inactiva' });
    }

    const precioExistente = await PrecioPorcionTortaBase.findOne({
      where: { id_tortas_base: id, porciones }
    });
    if (precioExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un precio para este número de porciones' });
    }

    const nuevoPrecio = await PrecioPorcionTortaBase.create({
      id_tortas_base: id,
      porciones,
      precio
    });
    res.status(201).json(nuevoPrecio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar el precio', error: error.message });
  }
};

const updatePrecioPorcion = async (req, res) => {
  const { id, precio_id } = req.params;
  const { porciones, precio } = req.body;

  if (!porciones && !precio) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const torta = await TortaBase.findOne({ where: { id, activo: true } });
    if (!torta) {
      return res.status(404).json({ mensaje: 'Torta base no encontrada o inactiva' });
    }

    const precioPorcion = await PrecioPorcionTortaBase.findByPk(precio_id);
    if (!precioPorcion || precioPorcion.id_tortas_base !== parseInt(id)) {
      return res.status(404).json({ mensaje: 'Precio no encontrado o no pertenece a esta torta base' });
    }

    if (porciones && porciones !== precioPorcion.porciones) {
      const precioExistente = await PrecioPorcionTortaBase.findOne({
        where: { id_tortas_base: id, porciones }
      });
      if (precioExistente) {
        return res.status(400).json({ mensaje: 'Ya existe un precio para este número de porciones' });
      }
    }

    await precioPorcion.update({ porciones, precio });
    res.json(precioPorcion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el precio', error: error.message });
  }
};

const deletePrecioPorcion = async (req, res) => {
  const { id, precio_id } = req.params;

  try {
    const torta = await TortaBase.findOne({ where: { id, activo: true } });
    if (!torta) {
      return res.status(404).json({ mensaje: 'Torta base no encontrada o inactiva' });
    }

    const precioPorcion = await PrecioPorcionTortaBase.findByPk(precio_id);
    if (!precioPorcion || precioPorcion.id_tortas_base !== parseInt(id)) {
      return res.status(404).json({ mensaje: 'Precio no encontrado o no pertenece a esta torta base' });
    }

    await precioPorcion.destroy();
    res.json({ mensaje: 'Precio eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el precio', error: error.message });
  }
};

module.exports = {
  getAllTortasBase,
  getTortaBaseById,
  createTortaBase,
  updateTortaBase,
  deleteTortaBase,
  addPrecioPorcion,
  updatePrecioPorcion,
  deletePrecioPorcion
};