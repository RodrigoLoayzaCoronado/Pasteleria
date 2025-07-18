const { Op } = require('sequelize');
// Importa el modelo Decoracion, PrecioPorcionDecoracion, DecoracionPorTorta y TortaCompleta
const { Decoracion, PrecioPorcionDecoracion, DecoracionPorTorta, TortaCompleta } = require('../models');

/**
 * @route POST /api/decoraciones
 * @desc Crea una nueva decoración.
 * @body { nombre, descripcion }
 * @access Private (Admin)
 */
const createDecoracion = async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({ mensaje: 'Nombre y descripción son campos requeridos' });
  }

  try {
    const decoracion = await Decoracion.create({ nombre, descripcion, activo: true });
    res.status(201).json(decoracion);
  } catch (error) {
    console.error('Error al crear la decoración:', error);
    res.status(500).json({ mensaje: 'Error al crear la decoración', error: error.message });
  }
};

/**
 * @route GET /api/decoraciones
 * @desc Obtiene todas las decoraciones activas, incluyendo sus precios por porciones.
 * @access Public
 */
const getAllDecoraciones = async (req, res) => {
  try {
    const decoraciones = await Decoracion.findAll({ 
      where: { activo: true },
      // Incluye los precios por porciones asociados a cada decoración
      include: [{ model: PrecioPorcionDecoracion, as: 'preciosPorciones' }] // Usar 'preciosPorciones' como alias consistente
    });
    res.json(decoraciones);
  } catch (error) {
    console.error('Error al obtener decoraciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener decoraciones', error: error.message });
  }
};

/**
 * @route GET /api/decoraciones/:id
 * @desc Obtiene una decoración por su ID, incluyendo sus precios por porciones.
 * @access Public
 */
const getDecoracionById = async (req, res) => {
  const { id } = req.params;

  try {
    const decoracion = await Decoracion.findByPk(id, {
      // Incluye los precios por porciones asociados
      include: [{ model: PrecioPorcionDecoracion, as: 'preciosPorciones' }] // Usar 'preciosPorciones' como alias consistente
    });
    if (!decoracion) {
      return res.status(404).json({ mensaje: 'Decoración no encontrada' });
    }
    res.json(decoracion);
  } catch (error) {
    console.error('Error al obtener la decoración:', error);
    res.status(500).json({ mensaje: 'Error al obtener la decoración', error: error.message });
  }
};

/**
 * @route PUT /api/decoraciones/:id
 * @desc Actualiza una decoración existente por su ID.
 * @body { nombre?, descripcion?, activo? }
 * @access Private (Admin)
 */
const updateDecoracion = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activo } = req.body;

  if (!nombre && descripcion === undefined && activo === undefined) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const decoracion = await Decoracion.findByPk(id);
    if (!decoracion) {
      return res.status(404).json({ mensaje: 'Decoración no encontrada' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (activo !== undefined) updateData.activo = activo;

    await decoracion.update(updateData);
    res.json(decoracion);
  } catch (error) {
    console.error('Error al actualizar la decoración:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la decoración', error: error.message });
  }
};

/**
 * @route PUT /api/decoraciones/:id/toggle-estado
 * @desc Activa/Inactiva una decoración por su ID.
 * @access Private (Admin)
 */
const toggleEstadoDecoracion = async (req, res) => {
  const { id } = req.params;

  try {
    const decoracion = await Decoracion.findByPk(id);
    if (!decoracion) {
      return res.status(404).json({ mensaje: 'Decoración no encontrada' });
    }

    const nuevoEstado = !decoracion.activo;
    await decoracion.update({ activo: nuevoEstado });
    res.json({ mensaje: `Decoración ${nuevoEstado ? 'activada' : 'inactivada'} exitosamente`, activo: nuevoEstado });
  } catch (error) {
    console.error('Error al activar/inactivar la decoración:', error);
    res.status(500).json({ mensaje: 'Error al activar/inactivar la decoración', error: error.message });
  }
};

/**
 * @route DELETE /api/decoraciones/:id
 * @desc Desactiva (suspende) una decoración por su ID.
 * @access Private (Admin)
 */
const deleteDecoracion = async (req, res) => {
  const { id } = req.params;

  try {
    const decoracion = await Decoracion.findByPk(id);
    if (!decoracion) {
      return res.status(404).json({ mensaje: 'Decoración no encontrada' });
    }

    if (!decoracion.activo) {
      return res.status(400).json({ mensaje: 'La decoración ya está inactiva' });
    }

    // Verificar si la decoración está siendo referenciada como decoración principal en detalle_torta
    const referenciasEnDetalleTortaPrincipal = await TortaCompleta.count({ where: { id_decoracion: id } });
    if (referenciasEnDetalleTortaPrincipal > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede suspender la decoración porque está referenciada como decoración principal en tortas.' 
      });
    }

    // Verificar si la decoración está siendo referenciada en decoracion_por_torta (decoraciones adicionales)
    const referenciasEnDecoracionPorTorta = await DecoracionPorTorta.count({ where: { id_decoracion: id } });
    if (referenciasEnDecoracionPorTorta > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede suspender la decoración porque está referenciada en decoraciones adicionales de tortas.' 
      });
    }

    await decoracion.update({ activo: false });
    // NOTA: La tabla 'precios_porciones_decoraciones' no tiene una columna 'activo'.
    // Si una decoración se desactiva, sus precios por porciones seguirán existiendo en esa tabla.
    
    res.json({ mensaje: 'Decoración suspendida exitosamente' });
  } catch (error) {
    console.error('Error al suspender la decoración:', error);
    res.status(500).json({ mensaje: 'Error al suspender la decoración', error: error.message });
  }
};

/**
 * @route POST /api/decoraciones/:id/precios-porciones
 * @desc Agrega un precio por porciones para una decoración.
 * @body { porciones, precio }
 * @access Private (Admin)
 */
const addPrecioPorcion = async (req, res) => {
  const { id } = req.params;
  const { porciones, precio } = req.body;

  if (!porciones || !precio) {
    return res.status(400).json({ mensaje: 'Porciones y precio son requeridos' });
  }

  try {
    const decoracion = await Decoracion.findOne({ where: { id, activo: true } });
    if (!decoracion) {
      return res.status(404).json({ mensaje: 'Decoración no encontrada o inactiva' });
    }

    const precioExistente = await PrecioPorcionDecoracion.findOne({
      where: {
        id_decoracion: id,
        porciones: porciones
      }
    });

    if (precioExistente) {
      return res.status(400).json({ mensaje: `Ya existe un precio definido para ${porciones} porciones para esta decoración.` });
    }

    const nuevoPrecio = await PrecioPorcionDecoracion.create({
      id_decoracion: id,
      porciones,
      precio
    });
    res.status(201).json(nuevoPrecio);
  } catch (error) {
    console.error('Error al agregar el precio por porciones:', error);
    res.status(500).json({ mensaje: 'Error al agregar el precio por porciones', error: error.message });
  }
};

/**
 * @route GET /api/decoraciones/:id/precios-porciones
 * @desc Obtiene los precios por porciones para una decoración específica.
 * @access Public
 */
const getPreciosByDecoracion = async (req, res) => {
  const { id } = req.params;

  try {
    const decoracion = await Decoracion.findOne({ where: { id, activo: true } });
    if (!decoracion) {
      return res.status(404).json({ mensaje: 'Decoración no encontrada o inactiva' });
    }

    const precios = await PrecioPorcionDecoracion.findAll({ where: { id_decoracion: id } });
    res.json(precios);
  } catch (error) {
    console.error('Error al obtener los precios por porciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener los precios por porciones', error: error.message });
  }
};

/**
 * @route PUT /api/decoraciones/:id/precios-porciones/:precio_id
 * @desc Actualiza un precio por porciones existente para una decoración.
 * @body { porciones?, precio? }
 * @access Private (Admin)
 */
const updatePrecioPorcion = async (req, res) => {
  const { id, precio_id } = req.params;
  const { porciones, precio } = req.body;

  if (porciones === undefined && precio === undefined) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo (porciones o precio) para actualizar' });
  }

  try {
    const decoracion = await Decoracion.findOne({ where: { id, activo: true } });
    if (!decoracion) {
      return res.status(404).json({ mensaje: 'Decoración no encontrada o inactiva' });
    }

    const precioPorcion = await PrecioPorcionDecoracion.findByPk(precio_id);
    if (!precioPorcion || precioPorcion.id_decoracion !== parseInt(id)) {
      return res.status(404).json({ mensaje: 'Precio por porciones no encontrado o no pertenece a esta decoración' });
    }

    const updateData = {};
    if (porciones !== undefined) updateData.porciones = porciones;
    if (precio !== undefined) updateData.precio = precio;

    if (porciones !== undefined && porciones !== precioPorcion.porciones) {
      const precioExistente = await PrecioPorcionDecoracion.findOne({
        where: {
          id_decoracion: id,
          porciones: porciones,
          id: { [Op.ne]: precio_id }
        }
      });

      if (precioExistente) {
        return res.status(400).json({ mensaje: `Ya existe un precio definido para ${porciones} porciones para esta decoración.` });
      }
    }

    await precioPorcion.update(updateData);
    res.json(precioPorcion);
  } catch (error) {
    console.error('Error al actualizar el precio por porciones:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el precio por porciones', error: error.message });
  }
};

/**
 * @route DELETE /api/decoraciones/:id/precios-porciones/:precio_id
 * @desc Elimina un precio por porciones específico para una decoración.
 * @access Private (Admin)
 */
const deletePrecioPorcion = async (req, res) => {
  const { id, precio_id } = req.params;

  try {
    const decoracion = await Decoracion.findOne({ where: { id, activo: true } });
    if (!decoracion) {
      return res.status(404).json({ mensaje: 'Decoración no encontrada o inactiva' });
    }

    const precioPorcion = await PrecioPorcionDecoracion.findByPk(precio_id);
    if (!precioPorcion || precioPorcion.id_decoracion !== parseInt(id)) {
      return res.status(404).json({ mensaje: 'Precio por porciones no encontrado o no pertenece a esta decoración' });
    }

    await precioPorcion.destroy();
    res.json({ mensaje: 'Precio por porciones eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el precio por porciones:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el precio por porciones', error: error.message });
  }
};

module.exports = {
  createDecoracion,
  getAllDecoraciones,
  getDecoracionById,
  updateDecoracion,
  toggleEstadoDecoracion,
  deleteDecoracion,
  addPrecioPorcion,
  getPreciosByDecoracion,
  updatePrecioPorcion,
  deletePrecioPorcion
};
