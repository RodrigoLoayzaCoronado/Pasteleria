const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemCotizacion = sequelize.define('ItemCotizacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_cotizacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_producto: { // Usado en el controlador para discriminar el tipo de producto
    type: DataTypes.STRING(50),
    allowNull: false
  },
  id_producto: { // Campo polimórfico que referencia a detalle_torta, mini_torta, postre, o otro_producto
    type: DataTypes.INTEGER,
    allowNull: true // Puede ser null temporalmente o si no hay un producto específico
  },
  nombre_producto: { // Nombre descriptivo del producto en el ítem de cotización
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_unitario: { // Precio unitario del ítem (calculado)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_total: { // Precio total del ítem (cantidad * precio_unitario)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  creado_en: { // Añadido para consistencia con otras tablas
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'items_cotizacion', // Nombre real de la tabla en tu base de datos
  timestamps: false // Desactiva createdAt y updatedAt automáticos de Sequelize
});

module.exports = ItemCotizacion;
