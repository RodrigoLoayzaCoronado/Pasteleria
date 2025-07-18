const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExtraPorTorta = sequelize.define('ExtraPorTorta', { // Nombre del modelo: ExtraPorTorta
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_detalle_torta: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_extra: {
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
  tableName: 'extras_torta', // Nombre de la tabla en la base de datos
  timestamps: false
});

module.exports = ExtraPorTorta; // Exporta el modelo con el nombre correcto
