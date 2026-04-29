const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  local_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  foto_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tipo: {
    type: DataTypes.ENUM('bebida', 'guardarropa'),
    defaultValue: 'bebida',
    allowNull: false
  }
});

module.exports = Producto;




