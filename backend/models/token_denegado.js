const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenDenegado = sequelize.define('TokenDenegado', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha_expiracion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tokens_denegados',
  timestamps: false
});

module.exports = TokenDenegado;