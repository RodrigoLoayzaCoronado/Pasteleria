const { Op } = require('sequelize');
const {
  TortaCompleta,
  ItemCotizacion,
  TortaBase,
  Cobertura,
  Decoracion,
  ElementoDecorativo,
  Extra,
  DecoracionPorTorta,
  ElementoDecorativoPorTorta,
  ExtraPorTorta,
  PrecioPorcionTortaBase,
  PrecioPorcionesCobertura,
  PrecioPorcionDecoracion,
  sequelize
} = require('../models');

/**
 * Función auxiliar para obtener el precio de un componente (torta base, cobertura, decoración)
 * basado en las porciones.
 * @param {object} model - El modelo Sequelize del componente (TortaBase, Cobertura, Decoracion).
 * @param {number} idComponente - El ID del componente.
 * @param {number} porciones - El número de porciones para buscar el precio.
 * @param {object} transaction - La transacción de Sequelize.
 * @returns {Promise<number>} El precio del componente para las porciones dadas.
 * @throws {Error} Si el precio no se encuentra o el tipo de componente no es soportado.
 */
async function getPriceForComponent(model, idComponente, porciones, transaction) {
  let priceModel;
  let fkColumn;

  if (model === TortaBase) {
    priceModel = PrecioPorcionTortaBase;
    fkColumn = 'id_tortas_base';
  } else if (model === Cobertura) {
    priceModel = PrecioPorcionesCobertura;
    fkColumn = 'id_cobertura';
  } else if (model === Decoracion) {
    priceModel = PrecioPorcionDecoracion;
    fkColumn = 'id_decoracion';
  } else {
    console.error(`Error: Tipo de componente no soportado para búsqueda de precio por porciones: ${model.name}`);
    throw new Error('Tipo de componente no soportado para búsqueda de precio por porciones.');
  }

  const priceRecord = await priceModel.findOne({
    where: {
      [fkColumn]: idComponente,
      porciones: porciones
    },
    transaction
  });

  if (!priceRecord) {
    console.error(`Error: Precio no encontrado para el componente ${model.name} (ID: ${idComponente}) y porciones: ${porciones}`);
    throw new Error(`Precio no encontrado para el componente ${model.name} (ID: ${idComponente}) y porciones: ${porciones}`);
  }
  
  const parsedPrecio = parseFloat(priceRecord.precio);
  if (isNaN(parsedPrecio)) {
      console.error(`Error: El precio recuperado para ${model.name} (ID: ${idComponente}, Porciones: ${porciones}) es NaN: ${priceRecord.precio}`);
      throw new Error(`El precio recuperado para ${model.name} (ID: ${idComponente}) es inválido.`);
  }
  console.log(`getPriceForComponent - Componente: ${model.name}, ID: ${idComponente}, Porciones: ${porciones}, Precio: ${parsedPrecio}`);
  return parsedPrecio;
}

/**
 * Función auxiliar para calcular el precio total de un DetalleTorta, incluyendo sus sub-componentes.
 * @param {number} detalleTortaId - El ID del DetalleTorta.
 * @param {object} transaction - La transacción de Sequelize.
 * @returns {Promise<number>} El precio total calculado para el DetalleTorta.
 */
async function calculateDetalleTortaTotalPrice(detalleTortaId, transaction) {
    let total = 0;
    const detalle = await TortaCompleta.findByPk(detalleTortaId, { transaction });

    if (!detalle) {
        console.error(`Error: Detalle de torta con ID ${detalleTortaId} no encontrado para cálculo de precio.`);
        throw new Error('Detalle de torta no encontrado para cálculo de precio.');
    }

    // Sumar precios base, cobertura y decoración principal (ya guardados en detalle_torta)
    const precioBase = parseFloat(detalle.precio_base || 0);
    const precioCobertura = parseFloat(detalle.precio_cobertura || 0);
    const precioDecoracion = parseFloat(detalle.precio_decoracion || 0);

    if (isNaN(precioBase)) console.warn(`Advertencia: precio_base para detalle ${detalleTortaId} es NaN: ${detalle.precio_base}`);
    if (isNaN(precioCobertura)) console.warn(`Advertencia: precio_cobertura para detalle ${detalleTortaId} es NaN: ${detalle.precio_cobertura}`);
    if (isNaN(precioDecoracion)) console.warn(`Advertencia: precio_decoracion para detalle ${detalleTortaId} es NaN: ${detalle.precio_decoracion}`);

    total += (isNaN(precioBase) ? 0 : precioBase);
    total += (isNaN(precioCobertura) ? 0 : precioCobertura);
    total += (isNaN(precioDecoracion) ? 0 : precioDecoracion);

    console.log(`calculateDetalleTortaTotalPrice - Detalle ID: ${detalleTortaId}, Base: ${precioBase}, Cobertura: ${precioCobertura}, Decoracion: ${precioDecoracion}. Total parcial: ${total}`);

    // Sumar precios de Elementos Decorativos por Torta
    const elementos = await ElementoDecorativoPorTorta.findAll({
        where: { id_detalle_torta: detalleTortaId },
        transaction
    });
    elementos.forEach(el => {
        const elPrecioTotal = parseFloat(el.precio_total || 0);
        if (isNaN(elPrecioTotal)) {
            console.warn(`Advertencia: ElementoDecorativoPorTorta (ID: ${el.id}) tiene precio_total NaN: ${el.precio_total}. Se usará 0.`);
        }
        total += (isNaN(elPrecioTotal) ? 0 : elPrecioTotal);
        console.log(`  + Elemento ID ${el.id}: ${elPrecioTotal}. Total actual: ${total}`);
    });

    // Sumar precios de Extras por Torta
    const extras = await ExtraPorTorta.findAll({
        where: { id_detalle_torta: detalleTortaId },
        transaction
    });
    extras.forEach(ex => {
        const exPrecioTotal = parseFloat(ex.precio_total || 0);
        if (isNaN(exPrecioTotal)) {
            console.warn(`Advertencia: ExtraPorTorta (ID: ${ex.id}) tiene precio_total NaN: ${ex.precio_total}. Se usará 0.`);
        }
        total += (isNaN(exPrecioTotal) ? 0 : exPrecioTotal);
        console.log(`  + Extra ID ${ex.id}: ${exPrecioTotal}. Total actual: ${total}`);
    });

    // Sumar precios de Decoraciones Adicionales por Torta
    const decoracionesAdicionales = await DecoracionPorTorta.findAll({
        where: { id_detalle_torta: detalleTortaId },
        transaction
    });
    decoracionesAdicionales.forEach(da => {
        const daPrecioTotal = parseFloat(da.precio_total || 0);
        if (isNaN(daPrecioTotal)) {
            console.warn(`Advertencia: DecoracionPorTorta (ID: ${da.id}) tiene precio_total NaN: ${da.precio_total}. Se usará 0.`);
        }
        total += (isNaN(daPrecioTotal) ? 0 : daPrecioTotal);
        console.log(`  + Decoracion Adicional ID ${da.id}: ${daPrecioTotal}. Total actual: ${total}`);
    });

    console.log(`calculateDetalleTortaTotalPrice - Total final para detalle ${detalleTortaId}: ${total}`);
    return total;
}

/**
 * Función auxiliar para procesar la creación de un DetalleTorta y sus componentes.
 * Reutilizada por createCotizacion y addItemToCotizacion.
 * @param {object} detalleTortaData - Datos para crear el detalle de la torta.
 * @param {number} idItemCotizacion - El ID del ItemCotizacion al que se vinculará este detalle de torta.
 * @param {object} transaction - Transacción de Sequelize.
 * @returns {Promise<{detalleTorta: object, itemPrecioUnitario: number}>} El detalle de torta creado y su precio unitario.
 * @throws {Error} Si algún componente no se encuentra o las porciones no son válidas.
 */
async function processDetalleTortaComponents(detalleTortaData, idItemCotizacion, transaction) {
  const {
    id_torta_base,
    id_cobertura,
    id_decoracion,
    porciones,
    imagen_url,
    elementos_decorativos = [],
    extras = [],
    decoraciones_adicionales = []
  } = detalleTortaData;

  const parsedPorciones = parseFloat(porciones);
  if (isNaN(parsedPorciones) || parsedPorciones <= 0) {
    console.error(`Error: Las porciones proporcionadas son inválidas: ${porciones}`);
    throw new Error('Las porciones son requeridas y deben ser un número positivo.');
  }

  let precioBase = id_torta_base ? parseFloat(await getPriceForComponent(TortaBase, id_torta_base, parsedPorciones, transaction) || 0) : 0;
  let precioCobertura = id_cobertura ? parseFloat(await getPriceForComponent(Cobertura, id_cobertura, parsedPorciones, transaction) || 0) : 0;
  let precioDecoracion = id_decoracion ? parseFloat(await getPriceForComponent(Decoracion, id_decoracion, parsedPorciones, transaction) || 0) : 0;

  // Asegurarse de que los precios obtenidos sean números
  if (isNaN(precioBase)) { console.warn(`Advertencia: precioBase es NaN después de getPriceForComponent para torta_base ${id_torta_base}. Se usará 0.`); precioBase = 0; }
  if (isNaN(precioCobertura)) { console.warn(`Advertencia: precioCobertura es NaN después de getPriceForComponent para cobertura ${id_cobertura}. Se usará 0.`); precioCobertura = 0; }
  if (isNaN(precioDecoracion)) { console.warn(`Advertencia: precioDecoracion es NaN después de getPriceForComponent para decoracion ${id_decoracion}. Se usará 0.`); precioDecoracion = 0; }


  const detalleTorta = await TortaCompleta.create({
    id_item_cotizacion: idItemCotizacion,
    id_torta_base,
    id_cobertura,
    id_decoracion,
    porciones: parsedPorciones,
    precio_base: precioBase,
    precio_cobertura: precioCobertura,
    precio_decoracion: precioDecoracion,
    imagen_url
  }, { transaction });

  console.log(`processDetalleTortaComponents - DetalleTorta creado con ID: ${detalleTorta.id}`);

  // Añadir Elementos Decorativos por Torta
  for (const el of elementos_decorativos) {
    const elemento = await ElementoDecorativo.findByPk(el.id_elemento_decorativo, { transaction });
    if (!elemento) { 
      console.error(`Error: Elemento decorativo con ID ${el.id_elemento_decorativo} no encontrado.`);
      throw new Error(`Elemento decorativo con ID ${el.id_elemento_decorativo} no encontrado.`); 
    }
    const precioUnitarioEl = parseFloat(elemento.precio_unitario || 0);
    const elCantidad = parseFloat(el.cantidad || 0);
    if (isNaN(precioUnitarioEl) || isNaN(elCantidad)) {
        console.error(`Error: Precio unitario (${elemento.precio_unitario}) o cantidad (${el.cantidad}) de Elemento Decorativo (ID: ${el.id_elemento_decorativo}) es inválido.`);
        throw new Error(`Error: Precio o cantidad de Elemento Decorativo (ID: ${el.id_elemento_decorativo}) es inválido.`);
    }
    await ElementoDecorativoPorTorta.create({
      id_detalle_torta: detalleTorta.id,
      id_elemento_decorativo: el.id_elemento_decorativo,
      cantidad: elCantidad,
      precio_unitario: precioUnitarioEl,
      precio_total: precioUnitarioEl * elCantidad
    }, { transaction });
    console.log(`  - Añadido Elemento Decorativo: ${elemento.nombre}, Cantidad: ${elCantidad}, Precio Unitario: ${precioUnitarioEl}`);
  }

  // Añadir Extras por Torta
  for (const ex of extras) {
    const extra = await Extra.findByPk(ex.id_extra, { transaction });
    if (!extra) { 
      console.error(`Error: Extra con ID ${ex.id_extra} no encontrado.`);
      throw new Error(`Extra con ID ${ex.id_extra} no encontrado.`); 
    }
    const precioUnitarioEx = parseFloat(extra.precio_unitario || 0);
    const exCantidad = parseFloat(ex.cantidad || 0);
    if (isNaN(precioUnitarioEx) || isNaN(exCantidad)) {
        console.error(`Error: Precio unitario (${extra.precio_unitario}) o cantidad (${ex.cantidad}) de Extra (ID: ${ex.id_extra}) es inválido.`);
        throw new Error(`Error: Precio o cantidad de Extra (ID: ${ex.id_extra}) es inválido.`);
    }
    await ExtraPorTorta.create({
      id_detalle_torta: detalleTorta.id,
      id_extra: ex.id_extra,
      cantidad: exCantidad,
      precio_unitario: precioUnitarioEx,
      precio_total: precioUnitarioEx * exCantidad
    }, { transaction });
    console.log(`  - Añadido Extra: ${extra.nombre}, Cantidad: ${exCantidad}, Precio Unitario: ${precioUnitarioEx}`);
  }

  // Añadir Decoraciones Adicionales por Torta
  for (const da of decoraciones_adicionales) {
    const daCantidad = parseFloat(da.cantidad || 0);
    if (isNaN(daCantidad)) {
        console.error(`Error: Cantidad (${da.cantidad}) de Decoración Adicional (ID: ${da.id_decoracion}) es inválida.`);
        throw new Error(`Error: Cantidad de Decoración Adicional (ID: ${da.id_decoracion}) es inválida.`);
    }
    const precioDecoracionAdicional = parseFloat(await getPriceForComponent(Decoracion, da.id_decoracion, parsedPorciones, transaction) || 0);
    if (isNaN(precioDecoracionAdicional)) {
        console.error(`Error: Precio de Decoración Adicional (ID: ${da.id_decoracion}) es inválido.`);
        throw new Error(`Error: Precio de Decoración Adicional (ID: ${da.id_decoracion}) es inválido.`);
    }
    await DecoracionPorTorta.create({
      id_detalle_torta: detalleTorta.id,
      id_decoracion: da.id_decoracion,
      cantidad: daCantidad,
      precio_unitario: precioDecoracionAdicional,
      precio_total: precioDecoracionAdicional * daCantidad
    }, { transaction });
    console.log(`  - Añadida Decoración Adicional: ID ${da.id_decoracion}, Cantidad: ${daCantidad}, Precio Unitario: ${precioDecoracionAdicional}`);
  }

  const itemPrecioUnitario = await calculateDetalleTortaTotalPrice(detalleTorta.id, transaction);
  console.log(`processDetalleTortaComponents - Precio unitario final del ítem de torta: ${itemPrecioUnitario}`);
  return { detalleTorta, itemPrecioUnitario };
}


/**
 * @route POST /api/detalle-tortas
 * @desc Crea un nuevo detalle de torta para un item de cotización.
 * @body {
 * id_item_cotizacion, nombre_torta, id_torta_base?, id_cobertura?, id_decoracion?, porciones,
 * imagen_url?: string,
 * elementos_decorativos?: [{ id_elemento_decorativo, cantidad }],
 * extras?: [{ id_extra, cantidad }],
 * decoraciones_adicionales?: [{ id_decoracion, cantidad }]
 * }
 * @access Private (Operario/Admin)
 */
const createDetalleTorta = async (req, res) => {
  const {
    id_item_cotizacion,
    nombre_torta,
    id_torta_base,
    id_cobertura,
    id_decoracion,
    porciones,
    imagen_url,
    elementos_decorativos = [],
    extras = [],
    decoraciones_adicionales = []
  } = req.body;

  if (!id_item_cotizacion || !porciones || !nombre_torta) {
    return res.status(400).json({ mensaje: 'ID de ítem de cotización, porciones y nombre_torta son requeridos.' });
  }

  const t = await sequelize.transaction();

  try {
    const itemCotizacion = await ItemCotizacion.findByPk(id_item_cotizacion, { transaction: t });
    if (!itemCotizacion) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Ítem de cotización no encontrado.' });
    }
    if (itemCotizacion.tipo_producto !== 'torta') {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El ítem de cotización debe ser de tipo "torta" para crear un detalle de torta.' });
    }
    if (itemCotizacion.id_producto !== null) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Este ítem de cotización ya tiene un detalle de torta asociado.' });
    }

    // Usar la función auxiliar para crear el detalle de la torta
    const { detalleTorta, itemPrecioUnitario } = await processDetalleTortaComponents(
        { id_torta_base, id_cobertura, id_decoracion, porciones, imagen_url, elementos_decorativos, extras, decoraciones_adicionales },
        id_item_cotizacion,
        t
    );

    // Actualizar el ItemCotizacion con el ID del detalle de torta y el precio final
    await itemCotizacion.update({
      id_producto: detalleTorta.id,
      nombre_producto: nombre_torta,
      precio_unitario: itemPrecioUnitario,
      precio_total: itemPrecioUnitario * itemCotizacion.cantidad
    }, { transaction: t });

    await t.commit();

    const createdDetalleTorta = await TortaCompleta.findByPk(detalleTorta.id, {
      include: [
        { model: TortaBase, as: 'tortaBase' },
        { model: Cobertura, as: 'cobertura' },
        { model: Decoracion, as: 'decoracionPrincipal' },
        { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
        { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
        { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
      ]
    });

    res.status(201).json(createdDetalleTorta);

  } catch (error) {
    await t.rollback();
    console.error('Error al crear el detalle de torta:', error);
    res.status(500).json({ 
      mensaje: 'Error al crear el detalle de torta', 
      error: error.message 
    });
  }
};

/**
 * @route GET /api/detalle-tortas/:id
 * @desc Obtiene un detalle de torta por su ID, incluyendo todos sus componentes.
 * @access Public
 */
const getDetalleTortaById = async (req, res) => {
  const { id } = req.params;

  try {
    const detalleTorta = await TortaCompleta.findByPk(id, {
      include: [
        { model: TortaBase, as: 'tortaBase' },
        { model: Cobertura, as: 'cobertura' },
        { model: Decoracion, as: 'decoracionPrincipal' },
        { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
        { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
        { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
      ]
    });

    if (!detalleTorta) {
      return res.status(404).json({ mensaje: 'Detalle de torta no encontrado.' });
    }
    res.json(detalleTorta);
  } catch (error) {
    console.error('Error al obtener el detalle de torta:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener el detalle de torta', 
      error: error.message 
    });
  }
};

/**
 * @route PUT /api/detalle-tortas/:id
 * @desc Actualiza un detalle de torta existente y sus componentes.
 * @body {
 * nombre_torta?,
 * id_torta_base?, id_cobertura?, id_decoracion?, porciones?,
 * imagen_url?: string,
 * elementos_decorativos?: [{ id_elemento_decorativo, cantidad, id? }],
 * extras?: [{ id_extra, cantidad, id? }],
 * decoraciones_adicionales?: [{ id_decoracion, cantidad, id? }]
 * }
 * @access Private (Operario/Admin)
 */
const updateDetalleTorta = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_torta,
    id_torta_base,
    id_cobertura,
    id_decoracion,
    porciones,
    imagen_url,
    elementos_decorativos,
    extras,
    decoraciones_adicionales
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const detalleTorta = await TortaCompleta.findByPk(id, { transaction: t });
    if (!detalleTorta) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Detalle de torta no encontrado.' });
    }

    const updateData = {};
    let recalculatePrices = false;

    const currentPorciones = parseFloat(porciones || detalleTorta.porciones || 0);
    if (isNaN(currentPorciones) || currentPorciones <= 0) {
        await t.rollback();
        return res.status(400).json({ mensaje: `Las porciones para el detalle de torta no son válidas: ${porciones}.` });
    }

    if (porciones !== undefined && currentPorciones !== detalleTorta.porciones) {
      updateData.porciones = currentPorciones;
      recalculatePrices = true;
    }
    if (id_torta_base !== undefined && id_torta_base !== detalleTorta.id_torta_base) {
      updateData.id_torta_base = id_torta_base;
      recalculatePrices = true;
    }
    if (id_cobertura !== undefined && id_cobertura !== detalleTorta.id_cobertura) {
      updateData.id_cobertura = id_cobertura;
      recalculatePrices = true;
    }
    if (id_decoracion !== undefined && id_decoracion !== detalleTorta.id_decoracion) {
      updateData.id_decoracion = id_decoracion;
      recalculatePrices = true;
    }
    if (imagen_url !== undefined) {
      updateData.imagen_url = imagen_url;
    }

    if (recalculatePrices) {
      updateData.precio_base = id_torta_base ? parseFloat(await getPriceForComponent(TortaBase, id_torta_base, currentPorciones, t) || 0) : null;
      updateData.precio_cobertura = id_cobertura ? parseFloat(await getPriceForComponent(Cobertura, id_cobertura, currentPorciones, t) || 0) : null;
      updateData.precio_decoracion = id_decoracion ? parseFloat(await getPriceForComponent(Decoracion, id_decoracion, currentPorciones, t) || 0) : null;
    }

    await detalleTorta.update(updateData, { transaction: t });

    // Lógica para actualizar/añadir/eliminar Elementos Decorativos
    if (elementos_decorativos !== undefined) {
      const existingElementos = await ElementoDecorativoPorTorta.findAll({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
      const existingIds = new Set(existingElementos.map(e => e.id));
      const incomingIds = new Set(elementos_decorativos.filter(el => el.id).map(el => el.id));

      for (const existingEl of existingElementos) {
        if (!incomingIds.has(existingEl.id)) {
          await existingEl.destroy({ transaction: t });
        }
      }

      for (const el of elementos_decorativos) {
        const elemento = await ElementoDecorativo.findByPk(el.id_elemento_decorativo, { transaction: t });
        if (!elemento) { 
          await t.rollback(); 
          return res.status(404).json({ mensaje: `Elemento decorativo con ID ${el.id_elemento_decorativo} no encontrado.` }); 
        }
        const precioUnitarioEl = parseFloat(elemento.precio_unitario || 0);
        const elCantidad = parseFloat(el.cantidad || 0);
        if (isNaN(precioUnitarioEl) || isNaN(elCantidad)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: Precio o cantidad de Elemento Decorativo (ID: ${el.id_elemento_decorativo}) es inválido.` });
        }
        const precioTotalEl = precioUnitarioEl * elCantidad;

        if (el.id && existingIds.has(el.id)) {
          await ElementoDecorativoPorTorta.update(
            { cantidad: elCantidad, precio_unitario: precioUnitarioEl, precio_total: precioTotalEl },
            { where: { id: el.id, id_detalle_torta: detalleTorta.id }, transaction: t }
          );
        } else {
          await ElementoDecorativoPorTorta.create({
            id_detalle_torta: detalleTorta.id,
            id_elemento_decorativo: el.id_elemento_decorativo,
            cantidad: elCantidad,
            precio_unitario: precioUnitarioEl,
            precio_total: precioTotalEl
          }, { transaction: t });
        }
      }
    }

    // Lógica para actualizar/añadir/eliminar Extras
    if (extras !== undefined) {
      const existingExtras = await ExtraPorTorta.findAll({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
      const existingIds = new Set(existingExtras.map(e => e.id));
      const incomingIds = new Set(extras.filter(ex => ex.id).map(ex => ex.id));

      for (const existingEx of existingExtras) {
        if (!incomingIds.has(existingEx.id)) {
          await existingEx.destroy({ transaction: t });
        }
      }

      for (const ex of extras) {
        const extra = await Extra.findByPk(ex.id_extra, { transaction: t });
        if (!extra) { 
          await t.rollback(); 
          return res.status(404).json({ mensaje: `Extra con ID ${ex.id_extra} no encontrado.` }); 
        }
        const precioUnitarioEx = parseFloat(extra.precio_unitario || 0);
        const exCantidad = parseFloat(ex.cantidad || 0);
        if (isNaN(precioUnitarioEx) || isNaN(exCantidad)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: Precio o cantidad de Extra (ID: ${ex.id_extra}) es inválido.` });
        }
        const precioTotalEx = precioUnitarioEx * exCantidad;

        if (ex.id && existingIds.has(ex.id)) {
          await ExtraPorTorta.update(
            { cantidad: exCantidad, precio_unitario: precioUnitarioEx, precio_total: precioTotalEx },
            { where: { id: ex.id, id_detalle_torta: detalleTorta.id }, transaction: t }
          );
        } else {
          await ExtraPorTorta.create({
            id_detalle_torta: detalleTorta.id,
            id_extra: ex.id_extra,
            cantidad: exCantidad,
            precio_unitario: precioUnitarioEx,
            precio_total: precioTotalEx
          }, { transaction: t });
        }
      }
    }

    // Lógica para actualizar/añadir/eliminar Decoraciones Adicionales
    if (decoraciones_adicionales !== undefined) {
      const existingDecoracionesAdicionales = await DecoracionPorTorta.findAll({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
      const existingIds = new Set(existingDecoracionesAdicionales.map(da => da.id));
      const incomingIds = new Set(decoraciones_adicionales.filter(da => da.id).map(da => da.id));

      for (const existingDa of existingDecoracionesAdicionales) {
        if (!incomingIds.has(existingDa.id)) {
          await existingDa.destroy({ transaction: t });
        }
      }

      for (const da of decoraciones_adicionales) {
        const daCantidad = parseFloat(da.cantidad || 0);
        if (isNaN(daCantidad)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: Cantidad de Decoración Adicional (ID: ${da.id_decoracion}) es inválida.` });
        }
        const precioDecoracionAdicional = parseFloat(await getPriceForComponent(Decoracion, da.id_decoracion, currentPorciones, t) || 0);
        if (isNaN(precioDecoracionAdicional)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: Precio de Decoración Adicional (ID: ${da.id_decoracion}) es inválido.` });
        }
        const precioTotalDa = precioDecoracionAdicional * daCantidad;

        if (da.id && existingIds.has(da.id)) {
          await DecoracionPorTorta.update(
            { cantidad: daCantidad, precio_unitario: precioDecoracionAdicional, precio_total: precioTotalDa },
            { where: { id: da.id, id_detalle_torta: detalleTorta.id }, transaction: t }
          );
        } else {
          await DecoracionPorTorta.create({
            id_detalle_torta: detalleTorta.id,
            id_decoracion: da.id_decoracion,
            cantidad: daCantidad,
            precio_unitario: precioDecoracionAdicional,
            precio_total: precioTotalDa
          }, { transaction: t });
        }
      }
    }

    // Recalcular el precio total del DetalleTorta y actualizar ItemCotizacion
    const precioTotalDetalleTorta = parseFloat(await calculateDetalleTortaTotalPrice(detalleTorta.id, t) || 0);
    if (isNaN(precioTotalDetalleTorta)) {
        console.error(`Error: precioTotalDetalleTorta es NaN después de calculateDetalleTortaTotalPrice para detalle ${detalleTorta.id}.`);
        await t.rollback();
        return res.status(500).json({ mensaje: `Error interno al calcular el precio total del detalle de torta.` });
    }
    
    const itemCotizacion = await ItemCotizacion.findByPk(detalleTorta.id_item_cotizacion, { transaction: t });
    if (itemCotizacion) {
        await itemCotizacion.update({
            nombre_producto: nombre_torta || itemCotizacion.nombre_producto,
            precio_unitario: precioTotalDetalleTorta,
            precio_total: precioTotalDetalleTorta * itemCotizacion.cantidad
        }, { transaction: t });
    }

    await t.commit();

    const updatedDetalleTorta = await TortaCompleta.findByPk(detalleTorta.id, {
      include: [
        { model: TortaBase, as: 'tortaBase' },
        { model: Cobertura, as: 'cobertura' },
        { model: Decoracion, as: 'decoracionPrincipal' },
        { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
        { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
        { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
      ]
    });

    res.json(updatedDetalleTorta);

  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar el detalle de torta:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar el detalle de torta', 
      error: error.message 
    });
  }
};

const deleteDetalleTorta = async (req, res) => {
  const { id } = req.params;

  const t = await sequelize.transaction();

  try {
    const detalleTorta = await TortaCompleta.findByPk(id, { transaction: t });
    if (!detalleTorta) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Detalle de torta no encontrado.' });
    }

    const itemCotizacion = await ItemCotizacion.findByPk(detalleTorta.id_item_cotizacion, { transaction: t });
    if (itemCotizacion) {
      await itemCotizacion.update({
        id_producto: null,
        nombre_producto: 'Torta Eliminada',
        precio_unitario: 0,
        precio_total: 0
      }, { transaction: t });
    }

    await DecoracionPorTorta.destroy({ where: { id_detalle_torta: id }, transaction: t });
    await ElementoDecorativoPorTorta.destroy({ where: { id_detalle_torta: id }, transaction: t });
    await ExtraPorTorta.destroy({ where: { id_detalle_torta: id }, transaction: t });

    await detalleTorta.destroy({ transaction: t });

    await t.commit();
    res.json({ mensaje: 'Detalle de torta eliminado exitosamente.' });

  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar el detalle de torta:', error);
    res.status(500).json({ 
      mensaje: 'Error al eliminar el detalle de torta', 
      error: error.message 
    });
  }
};


module.exports = {
  createDetalleTorta,
  getDetalleTortaById,
  updateDetalleTorta,
  deleteDetalleTorta,
  getPriceForComponent,
  calculateDetalleTortaTotalPrice,
  processDetalleTortaComponents
};
