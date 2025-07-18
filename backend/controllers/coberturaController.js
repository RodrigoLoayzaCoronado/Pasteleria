const { Op } = require('sequelize');
// Asegúrate de que Cobertura y PrecioPorcionesCobertura estén correctamente importados.
// Si 'TortaCompleta' es el modelo para 'detalle_torta', asegúrate de que su nombre de archivo y exportación sean correctos.
// Por ejemplo, si el modelo para 'detalle_torta' se llama 'DetalleTorta', deberías importarlo así:
// const { Cobertura, PrecioPorcionesCobertura, DetalleTorta } = require('../models');
// Y usar DetalleTorta en lugar de TortaCompleta en la función deleteCobertura.
const { Cobertura, PrecioPorcionesCobertura, TortaCompleta } = require('../models'); 

/**
 * @route GET /api/coberturas
 * @desc Obtiene todas las coberturas, opcionalmente filtradas por estado activo.
 * @access Public
 */
const getAllCoberturas = async (req, res) => {
  const { activas } = req.query;

  try {
    const where = activas === 'true' ? { activo: true } : {};
    const coberturas = await Cobertura.findAll({
      where,
      // Incluye los precios por porciones asociados a cada cobertura
      include: [{ model: PrecioPorcionesCobertura, as: 'Precios' }] // Actualizado el 'as' a 'Precios'
    });
    res.json(coberturas);
  } catch (error) {
    console.error('Error al obtener coberturas:', error); // Log del error para depuración
    res.status(500).json({ 
      mensaje: 'Error al obtener coberturas', 
      error: error.message 
    });
  }
};

/**
 * @route GET /api/coberturas/:id
 * @desc Obtiene una cobertura por su ID.
 * @access Public
 */
const getCoberturaById = async (req, res) => {
  const { id } = req.params;

  try {
    const cobertura = await Cobertura.findByPk(id, {
      // Incluye los precios por porciones asociados
      include: [{ model: PrecioPorcionesCobertura, as: 'Precios' }] // Actualizado el 'as' a 'Precios'
    });
    if (!cobertura) {
      return res.status(404).json({ mensaje: 'Cobertura no encontrada' });
    }
    res.json(cobertura);
  } catch (error) {
    console.error('Error al obtener la cobertura:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener la cobertura', 
      error: error.message 
    });
  }
};

/**
 * @route POST /api/coberturas
 * @desc Crea una nueva cobertura.
 * @access Private (Admin)
 */
const createCobertura = async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) { // La descripción puede ser opcional
    return res.status(400).json({ 
      mensaje: 'El nombre es un campo requerido' 
    });
  }

  try {
    const cobertura = await Cobertura.create({ 
      nombre, 
      descripcion,
      activo: true // Por defecto, una nueva cobertura está activa
    });
    res.status(201).json(cobertura);
  } catch (error) {
    console.error('Error al crear la cobertura:', error);
    res.status(500).json({ 
      mensaje: 'Error al crear la cobertura', 
      error: error.message 
    });
  }
};

/**
 * @route PUT /api/coberturas/:id
 * @desc Actualiza una cobertura existente por su ID.
 * @access Private (Admin)
 */
const updateCobertura = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activo } = req.body;

  // Al menos un campo debe ser proporcionado para la actualización
  if (!nombre && descripcion === undefined && activo === undefined) {
    return res.status(400).json({ 
      mensaje: 'Se requiere al menos un campo para actualizar' 
    });
  }

  try {
    const cobertura = await Cobertura.findByPk(id);
    if (!cobertura) {
      return res.status(404).json({ mensaje: 'Cobertura no encontrada' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    // Permite que la descripción sea null o vacía si se envía explícitamente
    if (descripcion !== undefined) updateData.descripcion = descripcion; 
    // Permite actualizar el estado activo/inactivo
    if (activo !== undefined) updateData.activo = activo;

    await cobertura.update(updateData);
    res.json(cobertura);
  } catch (error) {
    console.error('Error al actualizar la cobertura:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar la cobertura', 
      error: error.message 
    });
  }
};

/**
 * @route DELETE /api/coberturas/:id
 * @desc Desactiva (suspende) una cobertura por su ID.
 * @access Private (Admin)
 */
const deleteCobertura = async (req, res) => {
  const { id } = req.params;

  try {
    const cobertura = await Cobertura.findByPk(id);
    if (!cobertura) {
      return res.status(404).json({ mensaje: 'Cobertura no encontrada' });
    }

    // Si ya está inactiva, no hacer nada
    if (!cobertura.activo) {
      return res.status(400).json({ mensaje: 'La cobertura ya está inactiva' });
    }

    // Verificar si la cobertura está siendo referenciada en alguna torta completa (detalle_torta)
    // Asumiendo que TortaCompleta es el modelo para la tabla 'detalle_torta'
    const referencias = await TortaCompleta.count({ 
      where: { id_cobertura: id } 
    });
    if (referencias > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede suspender la cobertura porque está referenciada en tortas completas' 
      });
    }

    // Desactivar la cobertura
    await cobertura.update({ activo: false });
    
    // NOTA: La tabla 'precios_porciones_coberturas' no tiene una columna 'activo'.
    // Si una cobertura se desactiva, sus precios por porciones seguirán existiendo.
    // Si se desea que los precios asociados también se "desactiven" o eliminen al suspender la cobertura,
    // se necesitaría una columna 'activo' en 'precios_porciones_coberturas' o una eliminación en cascada.
    // Por ahora, no se realiza ninguna acción sobre los rangos de precios aquí.

    res.json({ mensaje: 'Cobertura suspendida exitosamente' });
  } catch (error) {
    console.error('Error al suspender la cobertura:', error);
    res.status(500).json({ 
      mensaje: 'Error al suspender la cobertura', 
      error: error.message 
    });
  }
};

/**
 * @route POST /api/coberturas/:id/precios-porciones
 * @desc Agrega un precio por porciones para una cobertura.
 * @body { porciones, precio }
 * @access Private (Admin)
 */
const addPrecioPorcion = async (req, res) => {
  const { id } = req.params; // id de la cobertura
  const { porciones, precio } = req.body; // porciones y precio directo

  if (!porciones || !precio) {
    return res.status(400).json({ 
      mensaje: 'Porciones y precio son requeridos' 
    });
  }

  try {
    const cobertura = await Cobertura.findOne({ 
      where: { id, activo: true } 
    });
    if (!cobertura) {
      return res.status(404).json({ 
        mensaje: 'Cobertura no encontrada o inactiva' 
      });
    }

    // Verificar si ya existe un precio para esta cantidad de porciones para esta cobertura
    const precioExistente = await PrecioPorcionesCobertura.findOne({ 
      where: {
        id_cobertura: id,
        porciones: porciones
      }
    });

    if (precioExistente) {
      return res.status(400).json({ 
        mensaje: `Ya existe un precio definido para ${porciones} porciones para esta cobertura.` 
      });
    }

    const nuevoPrecio = await PrecioPorcionesCobertura.create({ 
      id_cobertura: id,
      porciones,
      precio
    });
    res.status(201).json(nuevoPrecio);
  } catch (error) {
    console.error('Error al agregar el precio por porciones:', error);
    res.status(500).json({ 
      mensaje: 'Error al agregar el precio por porciones', 
      error: error.message 
    });
  }
};

/**
 * @route PUT /api/coberturas/:id/precios-porciones/:precio_id
 * @desc Actualiza un precio por porciones existente para una cobertura.
 * @body { porciones?, precio? }
 * @access Private (Admin)
 */
const updatePrecioPorcion = async (req, res) => { 
  const { id, precio_id } = req.params; // id de la cobertura, id del registro de precio por porciones
  const { porciones, precio } = req.body; // nuevos valores de porciones o precio

  // Al menos un campo debe ser proporcionado para la actualización
  if (porciones === undefined && precio === undefined) {
    return res.status(400).json({ 
      mensaje: 'Se requiere al menos un campo (porciones o precio) para actualizar' 
    });
  }

  try {
    const cobertura = await Cobertura.findOne({ 
      where: { id, activo: true } 
    });
    if (!cobertura) {
      return res.status(404).json({ 
        mensaje: 'Cobertura no encontrada o inactiva' 
      });
    }

    const precioPorcion = await PrecioPorcionesCobertura.findByPk(precio_id); 
    // Verifica que el precio por porciones exista y que pertenezca a la cobertura correcta
    if (!precioPorcion || precioPorcion.id_cobertura !== parseInt(id)) {
      return res.status(404).json({ 
        mensaje: 'Precio por porciones no encontrado o no pertenece a esta cobertura' 
      });
    }

    const updateData = {};
    if (porciones !== undefined) updateData.porciones = porciones;
    if (precio !== undefined) updateData.precio = precio;

    // Si se intenta cambiar las porciones, verificar unicidad
    if (porciones !== undefined && porciones !== precioPorcion.porciones) {
      const precioExistente = await PrecioPorcionesCobertura.findOne({ 
        where: {
          id_cobertura: id,
          porciones: porciones, // Comprobar si ya existe este número de porciones
          id: { [Op.ne]: precio_id } // Excluir el precio por porciones que estamos actualizando
        }
      });

      if (precioExistente) {
        return res.status(400).json({ 
          mensaje: `Ya existe un precio definido para ${porciones} porciones para esta cobertura.` 
        });
      }
    }

    await precioPorcion.update(updateData);
    res.json(precioPorcion);
  } catch (error) {
    console.error('Error al actualizar el precio por porciones:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar el precio por porciones', 
      error: error.message 
    });
  }
};

/**
 * @route DELETE /api/coberturas/:id/precios-porciones/:precio_id
 * @desc Elimina un precio por porciones específico para una cobertura.
 * @access Private (Admin)
 */
const deletePrecioPorcion = async (req, res) => { 
  const { id, precio_id } = req.params; // id de la cobertura, id del registro de precio por porciones

  try {
    const cobertura = await Cobertura.findOne({ 
      where: { id, activo: true } 
    });
    if (!cobertura) {
      return res.status(404).json({ 
        mensaje: 'Cobertura no encontrada o inactiva' 
      });
    }

    const precioPorcion = await PrecioPorcionesCobertura.findByPk(precio_id); 
    // Verifica que el precio por porciones exista y que pertenezca a la cobertura correcta
    if (!precioPorcion || precioPorcion.id_cobertura !== parseInt(id)) {
      return res.status(404).json({ 
        mensaje: 'Precio por porciones no encontrado o no pertenece a esta cobertura' 
      });
    }

    await precioPorcion.destroy(); // Elimina el registro de precio por porciones
    res.json({ 
      mensaje: 'Precio por porciones eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar el precio por porciones:', error);
    res.status(500).json({ 
      mensaje: 'Error al eliminar el precio por porciones', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllCoberturas,
  getCoberturaById,
  createCobertura,
  updateCobertura,
  deleteCobertura,
  addPrecioPorcion, 
  updatePrecioPorcion, 
  deletePrecioPorcion 
};
