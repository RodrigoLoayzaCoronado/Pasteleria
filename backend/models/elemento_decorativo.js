const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ElementoDecorativo = sequelize.define('ElementoDecorativo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,  
    allowNull: true
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
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
  tableName: 'elementos_decorativos',
  timestamps: false
});

module.exports = ElementoDecorativo;