const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo para la tabla 'otros_productos'
const OtrosProductos = sequelize.define('OtrosProductos', {
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
    allowNull: false
  },
  unidad_medida: {
    type: DataTypes.STRING(20),
    defaultValue: 'UNIDAD',
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'otros_productos', // Nombre real de la tabla en tu base de datos
  timestamps: false // Desactiva createdAt y updatedAt automáticos de Sequelize
});

module.exports = OtrosProductos;
