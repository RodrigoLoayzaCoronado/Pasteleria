const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DecoracionPorTorta = sequelize.define('DecoracionPorTorta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_detalle_torta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_decoracion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'decoracion_por_torta', // Nombre exacto de la tabla en la DB
  timestamps: false
});

module.exports = DecoracionPorTorta;
