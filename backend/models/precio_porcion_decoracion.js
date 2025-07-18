const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrecioPorcionDecoracion = sequelize.define('PrecioPorcionDecoracion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_decoracion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  porciones: { // <--- ¡Campo añadido!
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio: {
    type: DataTypes.NUMBER, // O DataTypes.DECIMAL para mayor precisión si el precio tiene decimales.
    allowNull: false
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'precios_porciones_decoraciones', // Nombre de la tabla
  timestamps: false
});

module.exports = PrecioPorcionDecoracion;