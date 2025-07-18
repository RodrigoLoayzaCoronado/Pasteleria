const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MiniTorta = require('./mini_torta');

const PrecioPorcionMiniTorta = sequelize.define('PrecioPorcionMiniTorta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_mini_tortas: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  porciones: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'precios_porciones_mini_tortas',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_mini_tortas', 'porciones']
    }
  ]
});

PrecioPorcionMiniTorta.belongsTo(MiniTorta, { foreignKey: 'id_mini_tortas' });

module.exports = PrecioPorcionMiniTorta;