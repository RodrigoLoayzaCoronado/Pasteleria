const { Extra, ExtraPorTorta } = require('../models');

/**
 * @route POST /api/extras
 * @desc Crea un nuevo extra.
 * @body { nombre, descripcion?, precio_unitario? }
 * @access Private (Admin)
 */
const createExtra = async (req, res) => {
  // Ahora se esperan nombre, descripcion y precio_unitario del cuerpo de la solicitud
  const { nombre, descripcion, precio_unitario } = req.body;

  // Validar que el campo 'nombre' esté presente.
  // 'descripcion' y 'precio_unitario' son allowNull: true en el modelo, por lo que no son estrictamente requeridos aquí.
  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre es requerido' });
  }

  try {
    const extra = await Extra.create({ 
      nombre, 
      descripcion, // La descripción es opcional según el modelo
      precio_unitario, // El precio_unitario es opcional según el modelo
      activo: true // Por defecto, un nuevo extra está activo
    });
    res.status(201).json(extra);
  } catch (error) {
    console.error('Error al crear el extra:', error); // Log del error para depuración
    res.status(500).json({ mensaje: 'Error al crear el extra', error: error.message });
  }
};

/**
 * @route GET /api/extras
 * @desc Obtiene todos los extras activos.
 * @access Public
 */
const getAllExtras = async (req, res) => {
  try {
    const extras = await Extra.findAll({ where: { activo: true } });
    res.json(extras);
  } catch (error) {
    console.error('Error al obtener extras:', error);
    res.status(500).json({ mensaje: 'Error al obtener extras', error: error.message });
  }
};

/**
 * @route GET /api/extras/:id
 * @desc Obtiene un extra por su ID.
 * @access Public
 */
const getExtraById = async (req, res) => {
  const { id } = req.params;

  try {
    const extra = await Extra.findByPk(id);
    if (!extra) {
      return res.status(404).json({ mensaje: 'Extra no encontrado' });
    }
    res.json(extra);
  } catch (error) {
    console.error('Error al obtener el extra:', error);
    res.status(500).json({ mensaje: 'Error al obtener el extra', error: error.message });
  }
};

/**
 * @route PUT /api/extras/:id
 * @desc Actualiza un extra existente por su ID.
 * @body { nombre?, descripcion?, precio_unitario?, activo? }
 * @access Private (Admin)
 */
const updateExtra = async (req, res) => {
  const { id } = req.params;
  // Ahora se esperan nombre, descripcion, precio_unitario y activo del cuerpo de la solicitud
  const { nombre, descripcion, precio_unitario, activo } = req.body;

  // Al menos un campo debe ser proporcionado para la actualización
  if (!nombre && descripcion === undefined && precio_unitario === undefined && activo === undefined) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const extra = await Extra.findByPk(id);
    if (!extra) {
      return res.status(404).json({ mensaje: 'Extra no encontrado' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    // La descripción es opcional, permitir actualizar a null o vacío
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    // El precio_unitario es opcional, permitir actualizar a null o un valor
    if (precio_unitario !== undefined) updateData.precio_unitario = precio_unitario;
    if (activo !== undefined) updateData.activo = activo;

    await extra.update(updateData);
    res.json(extra);
  } catch (error) {
    console.error('Error al actualizar el extra:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el extra', error: error.message });
  }
};

/**
 * @route DELETE /api/extras/:id
 * @desc Desactiva (suspende) un extra por su ID.
 * @access Private (Admin)
 */
const deleteExtra = async (req, res) => {
  const { id } = req.params;

  try {
    const extra = await Extra.findByPk(id);
    if (!extra) {
      return res.status(404).json({ mensaje: 'Extra no encontrado' });
    }

    // Si ya está inactivo, no hacer nada
    if (!extra.activo) {
      return res.status(400).json({ mensaje: 'El extra ya está inactivo' });
    }

    // Verificar si el extra está siendo referenciado en alguna torta completa
    const referencias = await ExtraPorTorta.count({ where: { id_extra: id } });
    if (referencias > 0) {
      return res.status(400).json({ mensaje: 'No se puede desactivar el extra porque está referenciado en tortas completas' });
    }

    // Desactivar el extra
    await extra.update({ activo: false });
    res.json({ mensaje: 'Extra desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar el extra:', error);
    res.status(500).json({ mensaje: 'Error al desactivar el extra', error: error.message });
  }
};

/**
 * @route PUT /api/extras/:id/reactivar
 * @desc Reactiva un extra por su ID.
 * @access Private (Admin)
 */
const reactivarExtra = async (req, res) => {
  const { id } = req.params;

  try {
    const extra = await Extra.findByPk(id);
    if (!extra) {
      return res.status(404).json({ mensaje: 'Extra no encontrado' });
    }

    if (extra.activo) {
      return res.status(400).json({ mensaje: 'El extra ya está activo' });
    }

    await extra.update({ activo: true });
    res.json({ mensaje: 'Extra reactivado exitosamente', activo: true });
  } catch (error) {
    console.error('Error al reactivar el extra:', error);
    res.status(500).json({ mensaje: 'Error al reactivar el extra', error: error.message });
  }
};

module.exports = {
  createExtra,
  getAllExtras,
  getExtraById,
  updateExtra,
  deleteExtra,
  reactivarExtra
};
