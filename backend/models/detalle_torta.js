const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// El nombre del modelo aquí 'TortaCompleta' es el que usarás en index.js y controladores.
// La tabla en la base de datos es 'detalle_torta'.
const TortaCompleta = sequelize.define('TortaCompleta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_item_cotizacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true // Según tu esquema SQL, id_item_cotizacion es UNIQUE aquí
  },
  id_torta_base: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_cobertura: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_decoracion: {
    type: DataTypes.INTEGER,
    allowNull: true // Esta es la decoración principal
  },
  porciones: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_base: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  precio_cobertura: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  precio_decoracion: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  imagen_url: { // ¡NUEVO CAMPO!
    type: DataTypes.STRING(255),
    allowNull: true // Puede ser null si no hay imagen
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'detalle_torta', // Nombre real de la tabla en tu base de datos
  timestamps: false // Desactiva createdAt y updatedAt automáticos de Sequelize
});

module.exports = TortaCompleta; // ¡Exporta el modelo!
