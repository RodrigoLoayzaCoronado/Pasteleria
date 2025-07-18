const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TortaBase = require('./torta_base');

const PrecioPorcionTortaBase = sequelize.define('PrecioPorcionTortaBase', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_tortas_base: {
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
  tableName: 'precios_porciones_tortas_base',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_tortas_base', 'porciones']
    }
  ]
});

PrecioPorcionTortaBase.belongsTo(TortaBase, { foreignKey: 'id_tortas_base' });

module.exports = PrecioPorcionTortaBase;
//estamos en precio porcion por torta.
//ya esta configurado usuario, sucursales, falta probar el postman de torta base y precioporcion torta base