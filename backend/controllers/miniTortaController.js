const { MiniTorta, PrecioPorcionMiniTorta, ItemCotizacion } = require('../models');

const getAllMiniTortas = async (req, res) => {
  const { activas } = req.query;

  try {
    const where = activas === 'true' ? { activo: true } : {};
    const miniTortas = await MiniTorta.findAll({
      where,
      include: [{ model: PrecioPorcionMiniTorta, as: 'Precios' }]
    });
    res.json(miniTortas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mini tortas', error: error.message });
  }
};

const getMiniTortaById = async (req, res) => {
  const { id } = req.params;

  try {
    const miniTorta = await MiniTorta.findOne({
      where: { id },
      include: [{ model: PrecioPorcionMiniTorta, as: 'Precios' }]
    });
    if (!miniTorta) {
      return res.status(404).json({ mensaje: 'Mini torta no encontrada' });
    }
    res.json(miniTorta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la mini torta', error: error.message });
  }
};

const createMiniTorta = async (req, res) => {
  const { nombre, descripcion, precio, porciones } = req.body;

  if (!nombre || !precio || !porciones) {
    return res.status(400).json({ 
      mensaje: 'Nombre, precio y porciones son campos requeridos' 
    });
  }

  try {
    const miniTorta = await MiniTorta.create({ 
      nombre, 
      descripcion: descripcion || null,
      precio,
      porciones,
      activo: true 
    });
    res.status(201).json(miniTorta);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al crear la mini torta', 
      error: error.message 
    });
  }
};

const updateMiniTorta = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, porciones, activo } = req.body;

  if (!nombre && !descripcion && !precio && !porciones && activo === undefined) {
    return res.status(400).json({ 
      mensaje: 'Se requiere al menos un campo para actualizar' 
    });
  }

  try {
    const miniTorta = await MiniTorta.findByPk(id);
    if (!miniTorta) {
      return res.status(404).json({ mensaje: 'Mini torta no encontrada' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (precio) updateData.precio = precio;
    if (porciones) updateData.porciones = porciones;
    if (activo !== undefined) updateData.activo = activo;

    await miniTorta.update(updateData);
    res.json(miniTorta);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al actualizar la mini torta', 
      error: error.message 
    });
  }
};

const deleteMiniTorta = async (req, res) => {
  const { id } = req.params;

  try {
    const miniTorta = await MiniTorta.findByPk(id);
    if (!miniTorta) {
      return res.status(404).json({ mensaje: 'Mini torta no encontrada' });
    }

    if (!miniTorta.activo) {
      return res.status(400).json({ mensaje: 'La mini torta ya está inactiva' });
    }

    const referencias = await ItemCotizacion.count({ 
      where: { id_mini_tortas: id } 
    });
    if (referencias > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede eliminar la mini torta porque está referenciada en ítems de cotización' 
      });
    }

    await miniTorta.update({ activo: false });
    await PrecioPorcionMiniTorta.destroy({ where: { id_mini_tortas: id } });
    res.json({ mensaje: 'Mini torta suspendida exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al suspender la mini torta', 
      error: error.message 
    });
  }
};

const addPrecioPorcion = async (req, res) => {
  const { id } = req.params;
  const { porciones, precio } = req.body;

  if (!porciones || !precio) {
    return res.status(400).json({ mensaje: 'Porciones y precio son requeridos' });
  }

  try {
    const miniTorta = await MiniTorta.findOne({ where: { id, activo: true } });
    if (!miniTorta) {
      return res.status(404).json({ mensaje: 'Mini torta no encontrada o inactiva' });
    }

    const precioExistente = await PrecioPorcionMiniTorta.findOne({
      where: { id_mini_tortas: id, porciones }
    });
    if (precioExistente) {
      return res.status(400).json({ 
        mensaje: 'Ya existe un precio para este número de porciones' 
      });
    }

    const nuevoPrecio = await PrecioPorcionMiniTorta.create({
      id_mini_tortas: id,
      porciones,
      precio
    });
    res.status(201).json(nuevoPrecio);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al agregar el precio', 
      error: error.message 
    });
  }
};

const updatePrecioPorcion = async (req, res) => {
  const { id, precio_id } = req.params;
  const { porciones, precio } = req.body;

  if (!porciones && !precio) {
    return res.status(400).json({ 
      mensaje: 'Se requiere al menos un campo para actualizar' 
    });
  }

  try {
    const miniTorta = await MiniTorta.findOne({ where: { id, activo: true } });
    if (!miniTorta) {
      return res.status(404).json({ mensaje: 'Mini torta no encontrada o inactiva' });
    }

    const precioPorcion = await PrecioPorcionMiniTorta.findByPk(precio_id);
    if (!precioPorcion || precioPorcion.id_mini_tortas !== parseInt(id)) {
      return res.status(404).json({ 
        mensaje: 'Precio no encontrado o no pertenece a esta mini torta' 
      });
    }

    if (porciones && porciones !== precioPorcion.porciones) {
      const precioExistente = await PrecioPorcionMiniTorta.findOne({
        where: { id_mini_tortas: id, porciones }
      });
      if (precioExistente) {
        return res.status(400).json({ 
          mensaje: 'Ya existe un precio para este número de porciones' 
        });
      }
    }

    const updateData = {};
    if (porciones) updateData.porciones = porciones;
    if (precio) updateData.precio = precio;

    await precioPorcion.update(updateData);
    res.json(precioPorcion);
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al actualizar el precio', 
      error: error.message 
    });
  }
};

const deletePrecioPorcion = async (req, res) => {
  const { id, precio_id } = req.params;

  try {
    const miniTorta = await MiniTorta.findOne({ where: { id, activo: true } });
    if (!miniTorta) {
      return res.status(404).json({ mensaje: 'Mini torta no encontrada o inactiva' });
    }

    const precioPorcion = await PrecioPorcionMiniTorta.findByPk(precio_id);
    if (!precioPorcion || precioPorcion.id_mini_tortas !== parseInt(id)) {
      return res.status(404).json({ 
        mensaje: 'Precio no encontrado o no pertenece a esta mini torta' 
      });
    }

    await precioPorcion.destroy();
    res.json({ mensaje: 'Precio eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error al eliminar el precio', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllMiniTortas,
  getMiniTortaById,
  createMiniTorta,
  updateMiniTorta,
  deleteMiniTorta,
  addPrecioPorcion,
  updatePrecioPorcion,
  deletePrecioPorcion
};