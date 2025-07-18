const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TortaBase = require('./torta_base');
const Cobertura = require('./cobertura');
const Decoracion = require('./decoracion');
const RangoDecoracionPorciones = require('./precio_porcion_decoracion');
const ElementoDecorativo = require('./elemento_decorativo');
const Extra = require('./extra');
const DecoracionPorTorta = require('./decoracion_por_torta');
const ElementoDecorativoPorTorta = require('./elemento_decorativo_por_torta');
const ExtraPorTorta = require('./extra_por_torta');

const TortaCompleta = sequelize.define('TortaCompleta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_torta_base: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TortaBase,
      key: 'id'
    }
  },
  id_cobertura: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cobertura,
      key: 'id'
    }
  },
  porciones: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tortas_completas',
  timestamps: false
});



module.exports = TortaCompleta;