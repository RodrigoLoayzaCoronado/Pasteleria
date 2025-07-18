const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ElementoDecorativoPorTorta = sequelize.define('ElementoDecorativoPorTorta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_detalle_torta: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_elemento_decorativo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  precio_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'elementos_decorativos_torta',
  timestamps: false
});

module.exports = ElementoDecorativoPorTorta;