const { Op } = require('sequelize');
const Cliente = require('../models/cliente');
const Cotizacion = require('../models/cotizacion');

const getAllClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({ where: { activo: true } });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clientes', error: error.message });
  }
};

const getClienteById = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findOne({ where: { id, activo: true } });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado o suspendido' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el cliente', error: error.message });
  }
};

const createCliente = async (req, res) => {
  const { nombre, telefono } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre es requerido' });
  }

  try {
    const cliente = await Cliente.create({ nombre, telefono });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el cliente', error: error.message });
  }
};

const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono } = req.body;

  if (!nombre && !telefono) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const cliente = await Cliente.findOne({ where: { id, activo: true } });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado o suspendido' });
    }

    await cliente.update({ nombre, telefono });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el cliente', error: error.message });
  }
};

const suspendCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findOne({ where: { id, activo: true } });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado o ya suspendido' });
    }

    await cliente.update({ activo: false });
    res.json({ mensaje: 'Cliente suspendido exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al suspender el cliente', error: error.message });
  }
};

const searchClientes = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ mensaje: 'El parámetro de búsqueda es requerido' });
  }

  try {
    const clientes = await Cliente.findAll({
      where: {
        activo: true,
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${q}%` } },
          { telefono: { [Op.iLike]: `%${q}%` } }
        ]
      }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar clientes', error: error.message });
  }
};

const getClienteCotizaciones = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findOne({ where: { id, activo: true } });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado o suspendido' });
    }

    const cotizaciones = await Cotizacion.findAll({ where: { id_cliente: id } });
    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las cotizaciones', error: error.message });
  }
};

module.exports = {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  suspendCliente,
  searchClientes,
  getClienteCotizaciones
};