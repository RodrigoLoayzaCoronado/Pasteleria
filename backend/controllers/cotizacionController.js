const { Op } = require('sequelize');
const {
  Cotizacion,
  ItemCotizacion,
  Cliente,
  Usuario,
  Sucursal,
  HistorialEstado,
  MiniTorta,
  Postre,
  OtrosProductos,
  TortaCompleta, // Modelo para detalle_torta
  TortaBase, // Importado para las inclusiones
  Cobertura, // Importado para las inclusiones
  Decoracion, // Importado para las inclusiones
  ElementoDecorativo, // Importado para las inclusiones
  Extra, // Importado para las inclusiones
  DecoracionPorTorta, // Importado para las inclusiones
  ElementoDecorativoPorTorta, // Importado para las inclusiones
  ExtraPorTorta, // Importado para las inclusiones
  sequelize // Para transacciones
} = require('../models');

// Importar funciones auxiliares del detalleTortaController para reutilización
const {
  getPriceForComponent,
  calculateDetalleTortaTotalPrice,
  processDetalleTortaComponents
} = require('./detalleTortaController');

/**
 * Función auxiliar para calcular el total de una cotización sumando sus ítems.
 * @param {number} cotizacionId - ID de la cotización.
 * @param {object} transaction - Transacción de Sequelize.
 * @returns {Promise<number>} El total calculado de la cotización.
 */
async function calculateCotizacionTotal(cotizacionId, transaction) {
  const items = await ItemCotizacion.findAll({
    where: { id_cotizacion: cotizacionId },
    transaction
  });
  let total = 0;
  items.forEach(item => {
    // Asegurarse de que precio_total sea un número antes de sumar
    const itemTotal = parseFloat(item.precio_total || 0);
    if (isNaN(itemTotal)) {
        console.warn(`Advertencia: item.precio_total para item ID ${item.id} es NaN. Se usará 0.`);
        total += 0;
    } else {
        total += itemTotal;
    }
  });
  return total;
}


/**
 * @route POST /api/cotizaciones
 * @desc Crea una nueva cotización con sus ítems.
 * @body {
 * id_cliente: number,
 * fecha_evento?: string,
 * observaciones?: string,
 * id_sucursal?: number,
 * id_usuario_creador?: number,
 * items: [
 * {
 * tipo_producto: 'torta' | 'mini_torta' | 'postre' | 'otro_producto',
 * cantidad: number,
 * nombre_producto: string, // Nombre descriptivo para el ItemCotizacion
 * id_producto_catalogo?: number, // Para mini_torta, postre, otro_producto
 * detalle_torta_data?: { // Para crear una nueva torta personalizada
 * id_torta_base?: number,
 * id_cobertura?: number,
 * id_decoracion?: number,
 * porciones: number,
 * imagen_url?: string,
 * elementos_decorativos?: [{ id_elemento_decorativo: number, cantidad: number }],
 * extras?: [{ id_extra: number, cantidad: number }],
 * decoraciones_adicionales?: [{ id_decoracion: number, cantidad: number }]
 * },
 * id_detalle_torta_existente?: number // Para añadir una torta personalizada ya creada
 * }
 * ]
 * }
 * @access Private (Operario/Admin)
 */
const createCotizacion = async (req, res) => {
  const {
    id_cliente,
    fecha_evento,
    observaciones,
    id_sucursal,
    id_usuario_creador,
    items
  } = req.body;

  if (!id_cliente || !items || items.length === 0) {
    return res.status(400).json({ mensaje: 'El ID del cliente y al menos un ítem son requeridos.' });
  }

  const clienteExistente = await Cliente.findByPk(id_cliente);
  if (!clienteExistente) {
    return res.status(404).json({ mensaje: 'Cliente no encontrado con el ID proporcionado.' });
  }

  const t = await sequelize.transaction();

  try {
    const cotizacion = await Cotizacion.create({
      numero_cotizacion: `COT-${Date.now()}`,
      id_cliente,
      fecha_evento,
      observaciones,
      id_sucursal,
      id_usuario_creador,
      total: 0,
      estado: 'PENDIENTE'
    }, { transaction: t });

    await HistorialEstado.create({
      id_cotizacion: cotizacion.id,
      estado: 'PENDIENTE',
      id_usuario: id_usuario_creador
    }, { transaction: t });

    let cotizacionTotal = 0;
    for (const itemData of items) {
      const { tipo_producto, cantidad, nombre_producto } = itemData;
      let itemPrecioUnitario = 0;
      let idProductoEnlazado = null;

      // Asegurarse de que cantidad sea un número válido
      const parsedCantidad = parseFloat(cantidad);
      if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
          await t.rollback();
          return res.status(400).json({ mensaje: `La cantidad para el producto "${nombre_producto}" no es válida.` });
      }

      if (tipo_producto === 'torta') {
        let detalleTorta;
        if (itemData.id_detalle_torta_existente) {
          detalleTorta = await TortaCompleta.findByPk(itemData.id_detalle_torta_existente, { transaction: t });
          if (!detalleTorta) {
            await t.rollback();
            return res.status(404).json({ mensaje: `Detalle de torta existente con ID ${itemData.id_detalle_torta_existente} no encontrado.` });
          }
          const existingItemForDetalle = await ItemCotizacion.findOne({
            where: { id_cotizacion: cotizacion.id, tipo_producto: 'torta', id_producto: detalleTorta.id },
            transaction: t
          });
          if (existingItemForDetalle) {
            await t.rollback();
            return res.status(400).json({ mensaje: 'Este detalle de torta ya está añadido a esta cotización.' });
          }

          idProductoEnlazado = detalleTorta.id;
          itemPrecioUnitario = await calculateDetalleTortaTotalPrice(detalleTorta.id, t);

          await ItemCotizacion.create({
            id_cotizacion: cotizacion.id,
            tipo_producto,
            id_producto: idProductoEnlazado,
            nombre_producto,
            cantidad: parsedCantidad,
            precio_unitario: itemPrecioUnitario,
            precio_total: itemPrecioUnitario * parsedCantidad
          }, { transaction: t });

        } else if (itemData.detalle_torta_data) {
          const tempItemCotizacion = await ItemCotizacion.create({
            id_cotizacion: cotizacion.id,
            tipo_producto: 'torta',
            nombre_producto: nombre_producto,
            cantidad: parsedCantidad,
            precio_unitario: 0,
            precio_total: 0
          }, { transaction: t });

          const result = await processDetalleTortaComponents(itemData.detalle_torta_data, tempItemCotizacion.id, t);
          detalleTorta = result.detalleTorta;
          idProductoEnlazado = detalleTorta.id;
          itemPrecioUnitario = result.itemPrecioUnitario;

          await tempItemCotizacion.update({
            id_producto: idProductoEnlazado,
            precio_unitario: itemPrecioUnitario,
            precio_total: itemPrecioUnitario * parsedCantidad
          }, { transaction: t });

        } else {
          await t.rollback();
          return res.status(400).json({ mensaje: 'Para tipo "torta", se requiere id_detalle_torta_existente o detalle_torta_data.' });
        }
      } else if (tipo_producto === 'mini_torta') {
        const miniTorta = await MiniTorta.findByPk(itemData.id_producto_catalogo, { transaction: t });
        if (!miniTorta) {
          await t.rollback();
          return res.status(404).json({ mensaje: `Mini Torta con ID ${itemData.id_producto_catalogo} no encontrada.` });
        }
        idProductoEnlazado = miniTorta.id;
        // CORRECCIÓN: Usar miniTorta.precio en lugar de miniTorta.precio_unitario
        itemPrecioUnitario = parseFloat(miniTorta.precio || 0);
        if (isNaN(itemPrecioUnitario)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: El precio unitario de la Mini Torta (ID: ${miniTorta.id}) es inválido.` });
        }

        await ItemCotizacion.create({
          id_cotizacion: cotizacion.id,
          tipo_producto,
          id_producto: idProductoEnlazado,
          nombre_producto,
          cantidad: parsedCantidad,
          precio_unitario: itemPrecioUnitario,
          precio_total: itemPrecioUnitario * parsedCantidad
        }, { transaction: t });

      } else if (tipo_producto === 'postre') {
        const postre = await Postre.findByPk(itemData.id_producto_catalogo, { transaction: t });
        if (!postre) {
          await t.rollback();
          return res.status(404).json({ mensaje: `Postre con ID ${itemData.id_producto_catalogo} no encontrado.` });
        }
        idProductoEnlazado = postre.id;
        // CORRECCIÓN: Usar postre.precio en lugar de postre.precio_unitario
        itemPrecioUnitario = parseFloat(postre.precio || 0);
        if (isNaN(itemPrecioUnitario)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: El precio unitario del Postre (ID: ${postre.id}) es inválido.` });
        }

        await ItemCotizacion.create({
          id_cotizacion: cotizacion.id,
          tipo_producto,
          id_producto: idProductoEnlazado,
          nombre_producto,
          cantidad: parsedCantidad,
          precio_unitario: itemPrecioUnitario,
          precio_total: itemPrecioUnitario * parsedCantidad
        }, { transaction: t });
      } else if (tipo_producto === 'otro_producto') {
        const otroProducto = await OtrosProductos.findByPk(itemData.id_producto_catalogo, { transaction: t });
        if (!otroProducto) {
          await t.rollback();
          return res.status(404).json({ mensaje: `Otro Producto con ID ${itemData.id_producto_catalogo} no encontrado.` });
        }
        idProductoEnlazado = otroProducto.id;
        // CORRECCIÓN: Asumiendo que OtrosProductos también usa 'precio'
        itemPrecioUnitario = parseFloat(otroProducto.precio || 0);
        if (isNaN(itemPrecioUnitario)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: El precio unitario de Otro Producto (ID: ${otroProducto.id}) es inválido.` });
        }

        await ItemCotizacion.create({
          id_cotizacion: cotizacion.id,
          tipo_producto,
          id_producto: idProductoEnlazado,
          nombre_producto,
          cantidad: parsedCantidad,
          precio_unitario: itemPrecioUnitario,
          precio_total: itemPrecioUnitario * parsedCantidad
        }, { transaction: t });
      } else {
        await t.rollback();
        return res.status(400).json({ mensaje: `Tipo de producto "${tipo_producto}" no válido.` });
      }

      // **Depuración: Imprimir valores antes de sumar**
      console.log(`Item: ${nombre_producto}, Cantidad: ${parsedCantidad}, Precio Unitario: ${itemPrecioUnitario}, Subtotal Item: ${itemPrecioUnitario * parsedCantidad}`);
      
      const itemSubtotal = itemPrecioUnitario * parsedCantidad;
      if (isNaN(itemSubtotal)) {
          console.error(`Error de cálculo: Subtotal para "${nombre_producto}" es NaN. itemPrecioUnitario: ${itemPrecioUnitario}, parsedCantidad: ${parsedCantidad}`);
          await t.rollback();
          return res.status(500).json({ mensaje: `Error interno al calcular el precio del ítem "${nombre_producto}".` });
      }
      cotizacionTotal += itemSubtotal;
    }

    await cotizacion.update({ total: cotizacionTotal }, { transaction: t });

    await t.commit();

    const fullCotizacion = await Cotizacion.findByPk(cotizacion.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuarioCreador' },
        { model: Sucursal, as: 'sucursal' },
        { model: HistorialEstado, as: 'historialEstados', order: [['fecha', 'ASC']] },
        {
          model: ItemCotizacion,
          as: 'items',
          include: [
            {
              model: TortaCompleta,
              as: 'detalleTorta',
              include: [
                { model: TortaBase, as: 'tortaBase' },
                { model: Cobertura, as: 'cobertura' },
                { model: Decoracion, as: 'decoracionPrincipal' },
                { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
                { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
                { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
              ]
            },
            { model: MiniTorta, as: 'miniTorta' },
            { model: Postre, as: 'postre' },
            { model: OtrosProductos, as: 'otroProducto' }
          ]
        }
      ]
    });

    res.status(201).json(fullCotizacion);

  } catch (error) {
    if (t.finished !== 'commit') {
        await t.rollback();
    }
    console.error('Error al crear la cotización:', error);
    res.status(500).json({ mensaje: 'Error al crear la cotización', error: error.message });
  }
};

/**
 * @route GET /api/cotizaciones
 * @desc Obtiene todas las cotizaciones, con opciones de filtrado y paginación.
 * @queryParam {string} estado - Filtra por estado de la cotización.
 * @queryParam {string} cliente_nombre - Busca por nombre parcial del cliente (ahora a través de la relación).
 * @queryParam {number} id_sucursal - Filtra por ID de sucursal.
 * @queryParam {number} id_usuario_creador - Filtra por ID de usuario creador.
 * @queryParam {string} fecha_desde - Filtra por fecha de evento desde (YYYY-MM-DD).
 * @queryParam {string} fecha_hasta - Filtra por fecha de evento hasta (YYYY-MM-DD).
 * @access Public
 */
const getAllCotizaciones = async (req, res) => {
  const { estado, cliente_nombre, id_sucursal, id_usuario_creador, fecha_desde, fecha_hasta } = req.query;
  const where = {};
  const include = [
    { model: Cliente, as: 'cliente' },
    { model: Usuario, as: 'usuarioCreador' },
    { model: Sucursal, as: 'sucursal' },
    { model: HistorialEstado, as: 'historialEstados', order: [['fecha', 'ASC']] },
    {
      model: ItemCotizacion,
      as: 'items',
      include: [
        {
          model: TortaCompleta,
          as: 'detalleTorta',
          include: [
            { model: TortaBase, as: 'tortaBase' },
            { model: Cobertura, as: 'cobertura' },
            { model: Decoracion, as: 'decoracionPrincipal' },
            { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
            { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
            { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
          ]
        },
        { model: MiniTorta, as: 'miniTorta' },
        { model: Postre, as: 'postre' },
        { model: OtrosProductos, as: 'otroProducto' }
      ]
    }
  ];

  if (estado) where.estado = estado;
  if (id_sucursal) where.id_sucursal = id_sucursal;
  if (id_usuario_creador) where.id_usuario_creador = id_usuario_creador;

  if (fecha_desde || fecha_hasta) {
    where.fecha_evento = {};
    if (fecha_desde) where.fecha_evento[Op.gte] = fecha_desde;
    if (fecha_hasta) where.fecha_evento[Op.lte] = fecha_hasta;
  }

  if (cliente_nombre) {
    const clienteInclude = include.find(inc => inc.model === Cliente);
    if (clienteInclude) {
      clienteInclude.where = { nombre: { [Op.iLike]: `%${cliente_nombre}%` } };
      clienteInclude.required = true;
    }
  }

  try {
    const cotizaciones = await Cotizacion.findAll({
      where,
      include,
      order: [['creado_en', 'DESC']]
    });
    res.json(cotizaciones);
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener cotizaciones', error: error.message });
  }
};

/**
 * @route GET /api/cotizaciones/:id
 * @desc Obtiene una cotización por su ID.
 * @access Public
 */
const getCotizacionById = async (req, res) => {
  const { id } = req.params;

  try {
    const cotizacion = await Cotizacion.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuarioCreador' },
        { model: Sucursal, as: 'sucursal' },
        { model: HistorialEstado, as: 'historialEstados', order: [['fecha', 'ASC']] },
        {
          model: ItemCotizacion,
          as: 'items',
          include: [
            {
              model: TortaCompleta,
              as: 'detalleTorta',
              include: [
                { model: TortaBase, as: 'tortaBase' },
                { model: Cobertura, as: 'cobertura' },
                { model: Decoracion, as: 'decoracionPrincipal' },
                { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
                { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
                { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
              ]
            },
            { model: MiniTorta, as: 'miniTorta' },
            { model: Postre, as: 'postre' },
            { model: OtrosProductos, as: 'otroProducto' }
          ]
        }
      ]
    });

    if (!cotizacion) {
      return res.status(404).json({ mensaje: 'Cotización no encontrada.' });
    }
    res.json(cotizacion);
  } catch (error) {
    console.error('Error al obtener la cotización:', error);
    res.status(500).json({ mensaje: 'Error al obtener la cotización', error: error.message });
  }
};

/**
 * @route PUT /api/cotizaciones/:id
 * @desc Actualiza los campos generales de una cotización.
 * @body { id_cliente?, fecha_evento?, observaciones?, id_sucursal?, id_usuario_creador? }
 * @access Private (Operario/Admin)
 */
const updateCotizacion = async (req, res) => {
  const { id } = req.params;
  const {
    id_cliente,
    fecha_evento,
    observaciones,
    id_sucursal,
    id_usuario_creador
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const cotizacion = await Cotizacion.findByPk(id, { transaction: t });
    if (!cotizacion) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Cotización no encontrada.' });
    }

    const updateData = {};
    if (id_cliente !== undefined) {
      const clienteExistente = await Cliente.findByPk(id_cliente, { transaction: t });
      if (!clienteExistente) {
        await t.rollback();
        return res.status(404).json({ mensaje: 'Cliente no encontrado con el ID proporcionado para la actualización.' });
      }
      updateData.id_cliente = id_cliente;
    }
    if (fecha_evento !== undefined) updateData.fecha_evento = fecha_evento;
    if (observaciones !== undefined) updateData.observaciones = observaciones;
    if (id_sucursal !== undefined) updateData.id_sucursal = id_sucursal;
    if (id_usuario_creador !== undefined) updateData.id_usuario_creador = id_usuario_creador;

    await cotizacion.update(updateData, { transaction: t });
    await t.commit();

    const updatedCotizacion = await Cotizacion.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuarioCreador' },
        { model: Sucursal, as: 'sucursal' },
        { model: HistorialEstado, as: 'historialEstados', order: [['fecha', 'ASC']] },
        {
          model: ItemCotizacion,
          as: 'items',
          include: [
            {
              model: TortaCompleta,
              as: 'detalleTorta',
              include: [
                { model: TortaBase, as: 'tortaBase' },
                { model: Cobertura, as: 'cobertura' },
                { model: Decoracion, as: 'decoracionPrincipal' },
                { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
                { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
                { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
              ]
            },
            { model: MiniTorta, as: 'miniTorta' },
            { model: Postre, as: 'postre' },
            { model: OtrosProductos, as: 'otroProducto' }
          ]
        }
      ]
    });

    res.json(updatedCotizacion);
  } catch (error) {
    if (t.finished !== 'commit') {
        await t.rollback();
    }
    console.error('Error al actualizar la cotización:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la cotización', error: error.message });
  }
};

/**
 * @route PUT /api/cotizaciones/:id/status
 * @desc Actualiza el estado de una cotización y registra el cambio.
 * @body { estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'COMPLETADA' | 'CANCELADA', id_usuario?: number }
 * @access Private (Operario/Admin)
 */
const updateCotizacionStatus = async (req, res) => {
  const { id } = req.params;
  const { estado, id_usuario } = req.body;

  if (!estado) {
    return res.status(400).json({ mensaje: 'El estado es requerido.' });
  }

  const validStates = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'COMPLETADA', 'CANCELADA'];
  if (!validStates.includes(estado)) {
    return res.status(400).json({ mensaje: `Estado inválido. Los estados permitidos son: ${validStates.join(', ')}` });
  }

  const t = await sequelize.transaction();

  try {
    const cotizacion = await Cotizacion.findByPk(id, { transaction: t });
    if (!cotizacion) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Cotización no encontrada.' });
    }

    await cotizacion.update({ estado }, { transaction: t });

    await HistorialEstado.create({
      id_cotizacion: cotizacion.id,
      estado: estado,
      id_usuario: id_usuario
    }, { transaction: t });

    await t.commit();
    res.json({ mensaje: `Estado de cotización actualizado a "${estado}" exitosamente.`, cotizacion });
  } catch (error) {
    if (t.finished !== 'commit') {
        await t.rollback();
    }
    console.error('Error al actualizar el estado de la cotización:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el estado de la cotización', error: error.message });
  }
};


async function calculateCotizacionTotal(cotizacionId, transaction) {
  const items = await ItemCotizacion.findAll({
    where: { id_cotizacion: cotizacionId },
    transaction
  });
  let total = 0;
  items.forEach(item => {
    // Asegurarse de que precio_total sea un número antes de sumar
    const itemTotal = parseFloat(item.precio_total || 0);
    if (isNaN(itemTotal)) {
        console.warn(`Advertencia: item.precio_total para item ID ${item.id} es NaN. Se usará 0.`);
        total += 0;
    } else {
        total += itemTotal;
    }
  });
  return total;
}


/**
 * @route POST /api/cotizaciones/:id/items
 * @desc Agrega un nuevo ítem a una cotización existente.
 * @body {
 * tipo_producto: 'torta' | 'mini_torta' | 'postre' | 'otro_producto',
 * cantidad: number,
 * nombre_producto: string,
 * id_producto_catalogo?: number,
 * detalle_torta_data?: { // Para crear nueva torta personalizada
 * id_torta_base?: number,
 * id_cobertura?: number,
 * id_decoracion?: number,
 * porciones: number,
 * imagen_url?: string,
 * elementos_decorativos?: [{ id_elemento_decorativo: number, cantidad: number }],
 * extras?: [{ id_extra: number, cantidad: number }],
 * decoraciones_adicionales?: [{ id_decoracion: number, cantidad: number }]
 * },
 * id_detalle_torta_existente?: number // Para añadir torta personalizada ya creada
 * }
 * @access Private (Operario/Admin)
 */
const addItemToCotizacion = async (req, res) => {
  const { id } = req.params;
  const {
    tipo_producto,
    cantidad,
    nombre_producto,
    id_producto_catalogo,
    detalle_torta_data,
    id_detalle_torta_existente
  } = req.body;

  if (!tipo_producto || !cantidad || !nombre_producto) {
    return res.status(400).json({ mensaje: 'Tipo de producto, cantidad y nombre del producto son requeridos.' });
  }
  if (cantidad <= 0) {
    return res.status(400).json({ mensaje: 'La cantidad debe ser mayor que cero.' });
  }

  const t = await sequelize.transaction();

  try {
    const cotizacion = await Cotizacion.findByPk(id, { transaction: t });
    if (!cotizacion) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Cotización no encontrada.' });
    }

    let itemPrecioUnitario = 0;
    let idProductoEnlazado = null;
    let newItem = null;

    // Asegurarse de que cantidad sea un número válido
    const parsedCantidad = parseFloat(cantidad);
    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
        await t.rollback();
        return res.status(400).json({ mensaje: `La cantidad para el producto "${nombre_producto}" no es válida.` });
    }

    if (tipo_producto === 'torta') {
      let detalleTorta;
      if (id_detalle_torta_existente) {
        detalleTorta = await TortaCompleta.findByPk(id_detalle_torta_existente, { transaction: t });
        if (!detalleTorta) {
          await t.rollback();
          return res.status(404).json({ mensaje: `Detalle de torta existente con ID ${id_detalle_torta_existente} no encontrado.` });
        }
        const existingItemForDetalle = await ItemCotizacion.findOne({
          where: { id_cotizacion: cotizacion.id, tipo_producto: 'torta', id_producto: detalleTorta.id },
          transaction: t
        });
        if (existingItemForDetalle) {
          await t.rollback();
          return res.status(400).json({ mensaje: 'Este detalle de torta ya está añadido a esta cotización.' });
        }

        idProductoEnlazado = detalleTorta.id;
        itemPrecioUnitario = await calculateDetalleTortaTotalPrice(detalleTorta.id, t);

        newItem = await ItemCotizacion.create({
          id_cotizacion: cotizacion.id,
          tipo_producto,
          id_producto: idProductoEnlazado,
          nombre_producto,
          cantidad: parsedCantidad,
          precio_unitario: itemPrecioUnitario,
          precio_total: itemPrecioUnitario * parsedCantidad
        }, { transaction: t });

      } else if (detalle_torta_data) {
        newItem = await ItemCotizacion.create({
          id_cotizacion: cotizacion.id,
          tipo_producto: 'torta',
          nombre_producto: nombre_producto,
          cantidad: parsedCantidad,
          precio_unitario: 0,
          precio_total: 0
        }, { transaction: t });

        const result = await processDetalleTortaComponents(detalle_torta_data, newItem.id, t);
        detalleTorta = result.detalleTorta;
        idProductoEnlazado = detalleTorta.id;
        itemPrecioUnitario = result.itemPrecioUnitario;

        await newItem.update({
          id_producto: idProductoEnlazado,
          precio_unitario: itemPrecioUnitario,
          precio_total: itemPrecioUnitario * parsedCantidad
        }, { transaction: t });

      } else {
        await t.rollback();
        return res.status(400).json({ mensaje: 'Para tipo "torta", se requiere id_detalle_torta_existente o detalle_torta_data.' });
      }
    } else if (tipo_producto === 'mini_torta') {
      const miniTorta = await MiniTorta.findByPk(id_producto_catalogo, { transaction: t });
      if (!miniTorta) {
        await t.rollback();
        return res.status(404).json({ mensaje: `Mini Torta con ID ${id_producto_catalogo} no encontrada.` });
      }
      idProductoEnlazado = miniTorta.id;
      itemPrecioUnitario = parseFloat(miniTorta.precio || 0); // Usar miniTorta.precio
      if (isNaN(itemPrecioUnitario)) {
          await t.rollback();
          return res.status(500).json({ mensaje: `Error: El precio unitario de la Mini Torta (ID: ${miniTorta.id}) es inválido.` });
      }

      newItem = await ItemCotizacion.create({
        id_cotizacion: cotizacion.id,
        tipo_producto,
        id_producto: idProductoEnlazado,
        nombre_producto,
        cantidad: parsedCantidad,
        precio_unitario: itemPrecioUnitario,
        precio_total: itemPrecioUnitario * parsedCantidad
      }, { transaction: t });

    } else if (tipo_producto === 'postre') {
      const postre = await Postre.findByPk(id_producto_catalogo, { transaction: t });
      if (!postre) {
        await t.rollback();
        return res.status(404).json({ mensaje: `Postre con ID ${id_producto_catalogo} no encontrado.` });
      }
      idProductoEnlazado = postre.id;
      itemPrecioUnitario = parseFloat(postre.precio || 0); // Usar postre.precio
      if (isNaN(itemPrecioUnitario)) {
          await t.rollback();
          return res.status(500).json({ mensaje: `Error: El precio unitario del Postre (ID: ${postre.id}) es inválido.` });
      }

      newItem = await ItemCotizacion.create({
        id_cotizacion: cotizacion.id,
        tipo_producto,
        id_producto: idProductoEnlazado,
        nombre_producto,
        cantidad: parsedCantidad,
        precio_unitario: itemPrecioUnitario,
        precio_total: itemPrecioUnitario * parsedCantidad
      }, { transaction: t });
    } else if (tipo_producto === 'otro_producto') {
      const otroProducto = await OtrosProductos.findByPk(id_producto_catalogo, { transaction: t });
      if (!otroProducto) {
        await t.rollback();
        return res.status(404).json({ mensaje: `Otro Producto con ID ${id_producto_catalogo} no encontrado.` });
      }
      idProductoEnlazado = otroProducto.id;
      itemPrecioUnitario = parseFloat(otroProducto.precio || 0); // Asumiendo que OtrosProductos también usa 'precio'
      if (isNaN(itemPrecioUnitario)) {
          await t.rollback();
          return res.status(500).json({ mensaje: `Error: El precio unitario de Otro Producto (ID: ${otroProducto.id}) es inválido.` });
      }

      newItem = await ItemCotizacion.create({
        id_cotizacion: cotizacion.id,
        tipo_producto,
        id_producto: idProductoEnlazado,
        nombre_producto,
        cantidad: parsedCantidad,
        precio_unitario: itemPrecioUnitario,
        precio_total: itemPrecioUnitario * parsedCantidad
      }, { transaction: t });
    } else {
      await t.rollback();
      return res.status(400).json({ mensaje: `Tipo de producto "${tipo_producto}" no válido.` });
    }

    // **Depuración: Imprimir valores del nuevo ítem**
    console.log(`Nuevo Ítem Añadido: ${nombre_producto}, Cantidad: ${parsedCantidad}, Precio Unitario: ${itemPrecioUnitario}, Precio Total del Ítem: ${itemPrecioUnitario * parsedCantidad}`);
    
    // Recalcular el total de la cotización después de añadir el nuevo ítem
    const updatedCotizacionTotal = await calculateCotizacionTotal(cotizacion.id, t);
    await cotizacion.update({ total: updatedCotizacionTotal }, { transaction: t });

    await t.commit();

    // Obtener la cotización completa con el nuevo ítem y el total actualizado
    const fullCotizacion = await Cotizacion.findByPk(cotizacion.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuarioCreador' },
        { model: Sucursal, as: 'sucursal' },
        { model: HistorialEstado, as: 'historialEstados', order: [['fecha', 'ASC']] },
        {
          model: ItemCotizacion,
          as: 'items',
          include: [
            {
              model: TortaCompleta,
              as: 'detalleTorta',
              include: [
                { model: TortaBase, as: 'tortaBase' },
                { model: Cobertura, as: 'cobertura' },
                { model: Decoracion, as: 'decoracionPrincipal' },
                { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
                { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
                { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
              ]
            },
            { model: MiniTorta, as: 'miniTorta' },
            { model: Postre, as: 'postre' },
            { model: OtrosProductos, as: 'otroProducto' }
          ]
        }
      ]
    });

    res.status(201).json(fullCotizacion);

  } catch (error) {
    if (t.finished !== 'commit') {
        await t.rollback();
    }
    console.error('Error al agregar ítem a la cotización:', error);
    res.status(500).json({ mensaje: 'Error al agregar ítem a la cotización', error: error.message });
  }
};

const updateItemInCotizacion = async (req, res) => {
  const { cotizacionId, itemId } = req.params;
  const { cantidad, nombre_producto, detalle_torta_data } = req.body;

  const t = await sequelize.transaction();

  try {
    const cotizacion = await Cotizacion.findByPk(cotizacionId, { transaction: t });
    if (!cotizacion) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Cotización no encontrada.' });
    }

    const item = await ItemCotizacion.findOne({
      where: { id: itemId, id_cotizacion: cotizacionId },
      transaction: t
    });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Ítem de cotización no encontrado en esta cotización.' });
    }

    let itemPrecioUnitario = parseFloat(item.precio_unitario || 0); // Asegurar que sea número
    let itemCantidad = parseFloat(cantidad !== undefined ? cantidad : item.cantidad || 0); // Asegurar que sea número
    let updatedNombreProducto = nombre_producto !== undefined ? nombre_producto : item.nombre_producto;

    if (isNaN(itemCantidad) || itemCantidad <= 0) {
        await t.rollback();
        return res.status(400).json({ mensaje: `La cantidad para el ítem "${item.nombre_producto}" no es válida.` });
    }

    if (item.tipo_producto === 'torta' && item.id_producto && detalle_torta_data) {
      const detalleTorta = await TortaCompleta.findByPk(item.id_producto, { transaction: t });
      if (!detalleTorta) {
        await t.rollback();
        return res.status(404).json({ mensaje: 'Detalle de torta asociado no encontrado.' });
      }

      const {
        id_torta_base, id_cobertura, id_decoracion, porciones,
        imagen_url,
        elementos_decorativos, extras, decoraciones_adicionales
      } = detalle_torta_data;

      const updateDetalleData = {};
      let recalculateDetallePrices = false;

      // Asegurarse de que porciones sea un número válido
      const currentPorciones = parseFloat(porciones || detalleTorta.porciones || 0);
      if (isNaN(currentPorciones) || currentPorciones <= 0) {
          await t.rollback();
          return res.status(400).json({ mensaje: `Las porciones para el detalle de torta del ítem "${item.nombre_producto}" no son válidas.` });
      }


      if (porciones !== undefined && currentPorciones !== detalleTorta.porciones) { updateDetalleData.porciones = currentPorciones; recalculateDetallePrices = true; }
      if (id_torta_base !== undefined && id_torta_base !== detalleTorta.id_torta_base) { updateDetalleData.id_torta_base = id_torta_base; recalculateDetallePrices = true; }
      if (id_cobertura !== undefined && id_cobertura !== detalleTorta.id_cobertura) { updateDetalleData.id_cobertura = id_cobertura; recalculateDetallePrices = true; }
      if (id_decoracion !== undefined && id_decoracion !== detalleTorta.id_decoracion) { updateDetalleData.id_decoracion = id_decoracion; recalculateDetallePrices = true; }
      if (imagen_url !== undefined) { updateDetalleData.imagen_url = imagen_url; }

      if (recalculateDetallePrices) {
        updateDetalleData.precio_base = id_torta_base ? parseFloat(await getPriceForComponent(TortaBase, id_torta_base, currentPorciones, t) || 0) : null;
        updateDetalleData.precio_cobertura = id_cobertura ? parseFloat(await getPriceForComponent(Cobertura, id_cobertura, currentPorciones, t) || 0) : null;
        updateDetalleData.precio_decoracion = id_decoracion ? parseFloat(await getPriceForComponent(Decoracion, id_decoracion, currentPorciones, t) || 0) : null;
      }
      await detalleTorta.update(updateDetalleData, { transaction: t });

      if (elementos_decorativos !== undefined) {
        const existingElementos = await ElementoDecorativoPorTorta.findAll({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
        const existingIds = new Set(existingElementos.map(e => e.id));
        const incomingIds = new Set(elementos_decorativos.filter(el => el.id).map(el => el.id));
        for (const existingEl of existingElementos) { if (!incomingIds.has(existingEl.id)) { await existingEl.destroy({ transaction: t }); } }
        for (const el of elementos_decorativos) {
          const elemento = await ElementoDecorativo.findByPk(el.id_elemento_decorativo, { transaction: t });
          if (!elemento) { await t.rollback(); return res.status(404).json({ mensaje: `Elemento decorativo con ID ${el.id_elemento_decorativo} no encontrado.` }); }
          const precioUnitarioEl = parseFloat(elemento.precio_unitario || 0); const precioTotalEl = precioUnitarioEl * el.cantidad;
          if (isNaN(precioUnitarioEl) || isNaN(el.cantidad)) {
              await t.rollback();
              return res.status(500).json({ mensaje: `Error: Precio o cantidad de Elemento Decorativo (ID: ${el.id_elemento_decorativo}) es inválido.` });
          }
          if (el.id && existingIds.has(el.id)) { await ElementoDecorativoPorTorta.update({ cantidad: el.cantidad, precio_unitario: precioUnitarioEl, precio_total: precioTotalEl }, { where: { id: el.id, id_detalle_torta: detalleTorta.id }, transaction: t }); }
          else { await ElementoDecorativoPorTorta.create({ id_detalle_torta: detalleTorta.id, id_elemento_decorativo: el.id_elemento_decorativo, cantidad: el.cantidad, precio_unitario: precioUnitarioEl, precio_total: precioTotalEl }, { transaction: t }); }
        }
      }

      if (extras !== undefined) {
        const existingExtras = await ExtraPorTorta.findAll({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
        const existingIds = new Set(existingExtras.map(e => e.id));
        const incomingIds = new Set(extras.filter(ex => ex.id).map(ex => ex.id));
        for (const existingEx of existingExtras) { if (!incomingIds.has(existingEx.id)) { await existingEx.destroy({ transaction: t }); } }
        for (const ex of extras) {
          const extra = await Extra.findByPk(ex.id_extra, { transaction: t });
          if (!extra) { await t.rollback(); return res.status(404).json({ mensaje: `Extra con ID ${ex.id_extra} no encontrado.` }); }
          const precioUnitarioEx = parseFloat(extra.precio_unitario || 0); const precioTotalEx = precioUnitarioEx * ex.cantidad;
          if (isNaN(precioUnitarioEx) || isNaN(ex.cantidad)) {
              await t.rollback();
              return res.status(500).json({ mensaje: `Error: Precio o cantidad de Extra (ID: ${ex.id_extra}) es inválido.` });
          }
          if (ex.id && existingIds.has(ex.id)) { await ExtraPorTorta.update({ cantidad: ex.cantidad, precio_unitario: precioUnitarioEx, precio_total: precioTotalEx }, { where: { id: ex.id, id_detalle_torta: detalleTorta.id }, transaction: t }); }
          else { await ExtraPorTorta.create({ id_detalle_torta: detalleTorta.id, id_extra: ex.id_extra, cantidad: ex.cantidad, precio_unitario: precioUnitarioEx, precio_total: precioTotalEx }, { transaction: t }); }
        }
      }

      if (decoraciones_adicionales !== undefined) {
        const existingDecoracionesAdicionales = await DecoracionPorTorta.findAll({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
        const existingIds = new Set(existingDecoracionesAdicionales.map(da => da.id));
        const incomingIds = new Set(decoraciones_adicionales.filter(da => da.id).map(da => da.id));
        for (const existingDa of existingDecoracionesAdicionales) { if (!incomingIds.has(existingDa.id)) { await existingDa.destroy({ transaction: t }); } }
        for (const da of decoraciones_adicionales) {
          const precioDecoracionAdicional = parseFloat(await getPriceForComponent(Decoracion, da.id_decoracion, currentPorciones, t) || 0);
          const precioTotalDa = parseFloat(precioDecoracionAdicional) * da.cantidad;
          if (isNaN(precioDecoracionAdicional) || isNaN(da.cantidad)) {
              await t.rollback();
              return res.status(500).json({ mensaje: `Error: Precio o cantidad de Decoración Adicional (ID: ${da.id_decoracion}) es inválido.` });
          }
          if (da.id && existingIds.has(da.id)) { await DecoracionPorTorta.update({ cantidad: da.cantidad, precio_unitario: precioDecoracionAdicional, precio_total: precioTotalDa }, { where: { id: da.id, id_detalle_torta: detalleTorta.id }, transaction: t }); }
          else { await DecoracionPorTorta.create({ id_detalle_torta: detalleTorta.id, id_decoracion: da.id_decoracion, cantidad: da.cantidad, precio_unitario: precioDecoracionAdicional, precio_total: precioTotalDa }, { transaction: t }); }
        }
      }

      itemPrecioUnitario = parseFloat(await calculateDetalleTortaTotalPrice(detalleTorta.id, t) || 0);
    } else if (item.tipo_producto === 'mini_torta') {
        const miniTorta = await MiniTorta.findByPk(item.id_producto, { transaction: t });
        if (!miniTorta) {
            await t.rollback();
            return res.status(404).json({ mensaje: `Mini Torta con ID ${item.id_producto} no encontrada.` });
        }
        itemPrecioUnitario = parseFloat(miniTorta.precio || 0); // CORRECCIÓN
        if (isNaN(itemPrecioUnitario)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: El precio unitario de la Mini Torta (ID: ${miniTorta.id}) es inválido.` });
        }
    } else if (item.tipo_producto === 'postre') {
        const postre = await Postre.findByPk(item.id_producto, { transaction: t });
        if (!postre) {
            await t.rollback();
            return res.status(404).json({ mensaje: `Postre con ID ${item.id_producto} no encontrado.` });
        }
        itemPrecioUnitario = parseFloat(postre.precio || 0); // CORRECCIÓN
        if (isNaN(itemPrecioUnitario)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: El precio unitario del Postre (ID: ${postre.id}) es inválido.` });
        }
    } else if (item.tipo_producto === 'otro_producto') {
        const otroProducto = await OtrosProductos.findByPk(item.id_producto, { transaction: t });
        if (!otroProducto) {
            await t.rollback();
            return res.status(404).json({ mensaje: `Otro Producto con ID ${item.id_producto} no encontrado.` });
        }
        itemPrecioUnitario = parseFloat(otroProducto.precio || 0); // CORRECCIÓN
        if (isNaN(itemPrecioUnitario)) {
            await t.rollback();
            return res.status(500).json({ mensaje: `Error: El precio unitario de Otro Producto (ID: ${otroProducto.id}) es inválido.` });
        }
    }


    await item.update({
      cantidad: itemCantidad,
      nombre_producto: updatedNombreProducto,
      precio_unitario: itemPrecioUnitario,
      precio_total: itemPrecioUnitario * itemCantidad
    }, { transaction: t });

    const updatedCotizacionTotal = await calculateCotizacionTotal(cotizacion.id, t);
    await cotizacion.update({ total: updatedCotizacionTotal }, { transaction: t });

    await t.commit();

    const fullCotizacion = await Cotizacion.findByPk(cotizacionId, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuarioCreador' },
        { model: Sucursal, as: 'sucursal' },
        { model: HistorialEstado, as: 'historialEstados', order: [['fecha', 'ASC']] },
        {
          model: ItemCotizacion,
          as: 'items',
          include: [
            {
              model: TortaCompleta,
              as: 'detalleTorta',
              include: [
                { model: TortaBase, as: 'tortaBase' },
                { model: Cobertura, as: 'cobertura' },
                { model: Decoracion, as: 'decoracionPrincipal' },
                { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
                { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
                { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
              ]
            },
            { model: MiniTorta, as: 'miniTorta' },
            { model: Postre, as: 'postre' },
            { model: OtrosProductos, as: 'otroProducto' }
          ]
        }
      ]
    });

    res.json(fullCotizacion);

  } catch (error) {
    if (t.finished !== 'commit') {
        await t.rollback();
    }
    console.error('Error al actualizar ítem en la cotización:', error);
    res.status(500).json({ mensaje: 'Error al actualizar ítem en la cotización', error: error.message });
  }
};

const removeItemFromCotizacion = async (req, res) => {
  const { cotizacionId, itemId } = req.params;

  const t = await sequelize.transaction();

  try {
    const cotizacion = await Cotizacion.findByPk(cotizacionId, { transaction: t });
    if (!cotizacion) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Cotización no encontrada.' });
    }

    const item = await ItemCotizacion.findOne({
      where: { id: itemId, id_cotizacion: cotizacionId },
      transaction: t
    });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Ítem de cotización no encontrado en esta cotización.' });
    }

    if (item.tipo_producto === 'torta' && item.id_producto) {
      const detalleTorta = await TortaCompleta.findByPk(item.id_producto, { transaction: t });
      if (detalleTorta) {
        await DecoracionPorTorta.destroy({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
        await ElementoDecorativoPorTorta.destroy({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
        await ExtraPorTorta.destroy({ where: { id_detalle_torta: detalleTorta.id }, transaction: t });
        await detalleTorta.destroy({ transaction: t });
      }
    }

    await item.destroy({ transaction: t });

    const updatedCotizacionTotal = await calculateCotizacionTotal(cotizacion.id, t);
    await cotizacion.update({ total: updatedCotizacionTotal }, { transaction: t });

    await t.commit();

    const fullCotizacion = await Cotizacion.findByPk(cotizacionId, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuarioCreador' },
        { model: Sucursal, as: 'sucursal' },
        { model: HistorialEstado, as: 'historialEstados', order: [['fecha', 'ASC']] },
        {
          model: ItemCotizacion,
          as: 'items',
          include: [
            {
              model: TortaCompleta,
              as: 'detalleTorta',
              include: [
                { model: TortaBase, as: 'tortaBase' },
                { model: Cobertura, as: 'cobertura' },
                { model: Decoracion, as: 'decoracionPrincipal' },
                { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
                { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
                { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
              ]
            },
            { model: MiniTorta, as: 'miniTorta' },
            { model: Postre, as: 'postre' },
            { model: OtrosProductos, as: 'otroProducto' }
          ]
        }
      ]
    });

    res.json(fullCotizacion);

  } catch (error) {
    if (t.finished !== 'commit') {
        await t.rollback();
    }
    console.error('Error al eliminar ítem de la cotización:', error);
    res.status(500).json({ mensaje: 'Error al eliminar ítem de la cotización', error: error.message });
  }
};

const searchCotizacionesByTortaName = async (req, res) => {
  const { nombre_torta } = req.query;

  if (!nombre_torta) {
    return res.status(400).json({ mensaje: 'El parámetro "nombre_torta" es requerido para la búsqueda.' });
  }

  try {
    const itemsEncontrados = await ItemCotizacion.findAll({
      attributes: ['id_cotizacion'],
      where: {
        tipo_producto: 'torta',
        nombre_producto: { [Op.iLike]: `%${nombre_torta}%` }
      },
      group: ['id_cotizacion']
    });

    const cotizacionIds = itemsEncontrados.map(item => item.id_cotizacion);

    if (cotizacionIds.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron cotizaciones con tortas que coincidan con el nombre proporcionado.' });
    }

    const cotizaciones = await Cotizacion.findAll({
      where: {
        id: { [Op.in]: cotizacionIds }
      },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuarioCreador' },
        { model: Sucursal, as: 'sucursal' },
        { model: HistorialEstado, as: 'historialEstados', order: [['fecha', 'ASC']] },
        {
          model: ItemCotizacion,
          as: 'items',
          include: [
            {
              model: TortaCompleta,
              as: 'detalleTorta',
              include: [
                { model: TortaBase, as: 'tortaBase' },
                { model: Cobertura, as: 'cobertura' },
                { model: Decoracion, as: 'decoracionPrincipal' },
                { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
                { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
                { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
              ]
            },
            { model: MiniTorta, as: 'miniTorta' },
            { model: Postre, as: 'postre' },
            { model: OtrosProductos, as: 'otroProducto' }
          ]
        }
      ],
      order: [['creado_en', 'DESC']]
    });

    res.json(cotizaciones);

  } catch (error) {
    console.error('Error al buscar cotizaciones por nombre de torta:', error);
    res.status(500).json({ mensaje: 'Error al buscar cotizaciones por nombre de torta', error: error.message });
  }
};

const getItemsCotizacionByQuery = async (req, res) => {
  const { id_cotizacion, nombre_producto, tipo_producto } = req.query;
  const where = {};

  if (id_cotizacion) {
    where.id_cotizacion = id_cotizacion;
  }
  if (nombre_producto) {
    where.nombre_producto = { [Op.iLike]: `%${nombre_producto}%` }; // Búsqueda parcial insensible a mayúsculas/minúsculas
  }
  if (tipo_producto) {
    where.tipo_producto = tipo_producto;
  }

  try {
    const items = await ItemCotizacion.findAll({
      where,
      include: [
        {
          model: TortaCompleta,
          as: 'detalleTorta',
          include: [
            { model: TortaBase, as: 'tortaBase' },
            { model: Cobertura, as: 'cobertura' },
            { model: Decoracion, as: 'decoracionPrincipal' },
            { model: ElementoDecorativoPorTorta, as: 'elementosDecorativos', include: [{ model: ElementoDecorativo, as: 'elementoDecorativo' }] },
            { model: ExtraPorTorta, as: 'extras', include: [{ model: Extra, as: 'extra' }] },
            { model: DecoracionPorTorta, as: 'decoracionesAdicionales', include: [{ model: Decoracion, as: 'decoracion' }] }
          ]
        },
        { model: MiniTorta, as: 'miniTorta' },
        { model: Postre, as: 'postre' },
        { model: OtrosProductos, as: 'otroProducto' }
      ],
      order: [['creado_en', 'ASC']] // Ordenar por fecha de creación, por ejemplo
    });

    if (items.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron ítems de cotización con los criterios proporcionados.' });
    }
    res.json(items);
  } catch (error) {
    console.error('Error al buscar ítems de cotización:', error);
    res.status(500).json({ mensaje: 'Error al buscar ítems de cotización', error: error.message });
  }
};
module.exports = {
  createCotizacion,
  getAllCotizaciones,
  getCotizacionById,
  updateCotizacion,
  updateCotizacionStatus,
  addItemToCotizacion,
  updateItemInCotizacion,
  removeItemFromCotizacion,
  searchCotizacionesByTortaName,
  getItemsCotizacionByQuery
};
