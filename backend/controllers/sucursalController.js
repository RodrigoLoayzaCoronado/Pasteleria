const Sucursal = require('../models/sucursal');

const getAllSucursales = async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll();
    res.json(sucursales);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener sucursales', error: error.message });
  }
};

const getSucursalById = async (req, res) => {
  const { id } = req.params;

  try {
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) {
      return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
    }
    res.json(sucursal);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la sucursal', error: error.message });
  }
};

const createSucursal = async (req, res) => {
  const { nombre, direccion } = req.body;

  if (!nombre || !direccion) {
    return res.status(400).json({ mensaje: 'Nombre y dirección son requeridos' });
  }

  try {
    const sucursal = await Sucursal.create({ nombre, direccion });
    res.status(201).json(sucursal);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la sucursal', error: error.message });
  }
};

const updateSucursal = async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion } = req.body;

  if (!nombre && !direccion) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) {
      return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
    }

    await sucursal.update({ nombre, direccion });
    res.json(sucursal);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la sucursal', error: error.message });
  }
};

const deleteSucursal = async (req, res) => {
  const { id } = req.params;

  try {
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) {
      return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
    }

    await sucursal.destroy();
    res.json({ mensaje: 'Sucursal eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la sucursal', error: error.message });
  }
};

module.exports = {
  getAllSucursales,
  getSucursalById,
  createSucursal,
  updateSucursal,
  deleteSucursal
};