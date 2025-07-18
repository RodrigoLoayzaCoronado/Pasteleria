const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo para la tabla 'historial_estados'
const HistorialEstado = sequelize.define('HistorialEstado', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_cotizacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: true // Según tu SQL, id_usuario en historial_estados puede ser NULL
  }
}, {
  tableName: 'historial_estados', // Nombre real de la tabla en tu base de datos
  timestamps: false // Desactiva createdAt y updatedAt automáticos de Sequelize
});

module.exports = HistorialEstado;
