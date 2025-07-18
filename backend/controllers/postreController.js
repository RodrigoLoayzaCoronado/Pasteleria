const { Postre, ItemCotizacion } = require('../models');

const createPostre = async (req, res) => {
  const { nombre, precio, descripcion, porciones } = req.body;

  if (!nombre || !precio  || !porciones) {
    return res.status(400).json({ mensaje: 'El nombre, precio y porciones son requeridos' });
  }

  try {
    const postre = await Postre.create({ nombre, precio, descripcion, porciones, activo: true });
    res.status(201).json(postre);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el postre', error: error.message });
  }
};

const getAllPostres = async (req, res) => {
  try {
    const postres = await Postre.findAll({ where: { activo: true } });
    res.json(postres);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener postres', error: error.message });
  }
};

const getPostreById = async (req, res) => {
  const { id } = req.params;

  try {
    const postre = await Postre.findByPk(id);
    if (!postre) {
      return res.status(404).json({ mensaje: 'Postre no encontrado' });
    }
    res.json(postre);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el postre', error: error.message });
  }
};

const updatePostre = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, descripcion, porciones, activo } = req.body;

  if (!nombre && !precio && !porciones === undefined && activo === undefined) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const postre = await Postre.findByPk(id);
    if (!postre) {
      return res.status(404).json({ mensaje: 'Postre no encontrado' });
    }

    await postre.update({ nombre, precio, imagen_url, activo });
    res.json(postre);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el postre', error: error.message });
  }
};

const toggleActivarPostre = async (req, res) => {
  const { id } = req.params;

  try {
    const postre = await Postre.findByPk(id);
    if (!postre) {
      return res.status(404).json({ mensaje: 'Postre no encontrado' });
    }

    const nuevoEstado = !postre.activo;
    await postre.update({ activo: nuevoEstado });
    res.json({ mensaje: `Postre ${nuevoEstado ? 'activado' : 'inactivado'} exitosamente`, activo: nuevoEstado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al activar/inactivar el postre', error: error.message });
  }
};

const deletePostre = async (req, res) => {
  const { id } = req.params;

  try {
    const postre = await Postre.findByPk(id);
    if (!postre) {
      return res.status(404).json({ mensaje: 'Postre no encontrado' });
    }

    if (!postre.activo) {
      return res.status(400).json({ mensaje: 'El postre ya está inactivo' });
    }

    const referencias = await ItemCotizacion.count({ where: { id_postre: id } });
    if (referencias > 0) {
      return res.status(400).json({ mensaje: 'No se puede eliminar el postre porque está referenciado en ítems de cotización' });
    }

    await postre.update({ activo: false });
    res.json({ mensaje: 'Postre suspendido exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al suspender el postre', error: error.message });
  }
};

module.exports = {
  createPostre,
  getAllPostres,
  getPostreById,
  updatePostre,
  toggleActivarPostre,
  deletePostre
};