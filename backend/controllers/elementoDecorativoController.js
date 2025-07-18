const { ElementoDecorativo, ElementoDecorativoPorTorta } = require('../models');

/**
 * @route POST /api/elementos-decorativos
 * @desc Crea un nuevo elemento decorativo.
 * @body { nombre, descripcion?, precio_unitario }
 * @access Private (Admin)
 */
const createElementoDecorativo = async (req, res) => {
  // Ahora se esperan nombre, descripcion y precio_unitario del cuerpo de la solicitud
  const { nombre, descripcion, precio_unitario } = req.body;

  // Validar que los campos requeridos estén presentes
  if (!nombre || precio_unitario === undefined || precio_unitario === null) {
    return res.status(400).json({ mensaje: 'Nombre y precio_unitario son requeridos' });
  }

  try {
    const elementoDecorativo = await ElementoDecorativo.create({ 
      nombre, 
      descripcion, // La descripción es opcional según el modelo
      precio_unitario,
      activo: true // Por defecto, un nuevo elemento está activo
    });
    res.status(201).json(elementoDecorativo);
  } catch (error) {
    console.error('Error al crear el elemento decorativo:', error); // Log del error para depuración
    res.status(500).json({ mensaje: 'Error al crear el elemento decorativo', error: error.message });
  }
};

/**
 * @route GET /api/elementos-decorativos
 * @desc Obtiene todos los elementos decorativos activos.
 * @access Public
 */
const getAllElementosDecorativos = async (req, res) => {
  try {
    const elementosDecorativos = await ElementoDecorativo.findAll({ where: { activo: true } });
    res.json(elementosDecorativos);
  } catch (error) {
    console.error('Error al obtener elementos decorativos:', error);
    res.status(500).json({ mensaje: 'Error al obtener elementos decorativos', error: error.message });
  }
};

/**
 * @route GET /api/elementos-decorativos/:id
 * @desc Obtiene un elemento decorativo por su ID.
 * @access Public
 */
const getElementoDecorativoById = async (req, res) => {
  const { id } = req.params;

  try {
    const elementoDecorativo = await ElementoDecorativo.findByPk(id);
    if (!elementoDecorativo) {
      return res.status(404).json({ mensaje: 'Elemento decorativo no encontrado' });
    }
    res.json(elementoDecorativo);
  } catch (error) {
    console.error('Error al obtener el elemento decorativo:', error);
    res.status(500).json({ mensaje: 'Error al obtener el elemento decorativo', error: error.message });
  }
};

/**
 * @route PUT /api/elementos-decorativos/:id
 * @desc Actualiza un elemento decorativo existente por su ID.
 * @body { nombre?, descripcion?, precio_unitario?, activo? }
 * @access Private (Admin)
 */
const updateElementoDecorativo = async (req, res) => {
  const { id } = req.params;
  // Ahora se esperan nombre, descripcion, precio_unitario y activo del cuerpo de la solicitud
  const { nombre, descripcion, precio_unitario, activo } = req.body;

  // Al menos un campo debe ser proporcionado para la actualización
  if (!nombre && descripcion === undefined && precio_unitario === undefined && activo === undefined) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const elementoDecorativo = await ElementoDecorativo.findByPk(id);
    if (!elementoDecorativo) {
      return res.status(404).json({ mensaje: 'Elemento decorativo no encontrado' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    // La descripción es opcional, permitir actualizar a null o vacío
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    // Asegurarse de que precio_unitario sea un número válido si se proporciona
    if (precio_unitario !== undefined && precio_unitario !== null) {
      updateData.precio_unitario = precio_unitario;
    } else if (precio_unitario === null) {
      // Si se envía null explícitamente y la columna no lo permite, esto podría causar un error.
      // Tu modelo tiene allowNull: false para precio_unitario, así que no deberías permitir null.
      return res.status(400).json({ mensaje: 'El precio_unitario no puede ser nulo' });
    }
    if (activo !== undefined) updateData.activo = activo;

    await elementoDecorativo.update(updateData);
    res.json(elementoDecorativo);
  } catch (error) {
    console.error('Error al actualizar el elemento decorativo:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el elemento decorativo', error: error.message });
  }
};

/**
 * @route DELETE /api/elementos-decorativos/:id
 * @desc Desactiva (suspende) un elemento decorativo por su ID.
 * @access Private (Admin)
 */
const deleteElementoDecorativo = async (req, res) => {
  const { id } = req.params;

  try {
    const elementoDecorativo = await ElementoDecorativo.findByPk(id);
    if (!elementoDecorativo) {
      return res.status(404).json({ mensaje: 'Elemento decorativo no encontrado' });
    }

    // Si ya está inactivo, no hacer nada
    if (!elementoDecorativo.activo) {
      return res.status(400).json({ mensaje: 'El elemento decorativo ya está inactivo' });
    }

    // Verificar si el elemento decorativo está siendo referenciado en alguna torta completa
    const referencias = await ElementoDecorativoPorTorta.count({ where: { id_elemento_decorativo: id } });
    if (referencias > 0) {
      return res.status(400).json({ mensaje: 'No se puede suspender el elemento decorativo porque está referenciado en tortas completas' });
    }

    // Desactivar el elemento decorativo
    await elementoDecorativo.update({ activo: false });
    res.json({ mensaje: 'Elemento decorativo suspendido exitosamente' });
  } catch (error) {
    console.error('Error al suspender el elemento decorativo:', error);
    res.status(500).json({ mensaje: 'Error al suspender el elemento decorativo', error: error.message });
  }
};

module.exports = {
  createElementoDecorativo,
  getAllElementosDecorativos,
  getElementoDecorativoById,
  updateElementoDecorativo,
  deleteElementoDecorativo
};
