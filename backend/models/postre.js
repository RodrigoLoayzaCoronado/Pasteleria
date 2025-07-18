const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Postre = sequelize.define('Postre', {
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
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  porciones:{
    type: DataTypes.INTEGER,
    allowNull: false  
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
  tableName: 'postres',
  timestamps: false
});

Postre.associate = function(models) {
  Postre.hasMany(models.ItemCotizacion, {
    foreignKey: 'id_postre',
    as: 'itemsCotizacion'
  });
};
module.exports = Postre;
