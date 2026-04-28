const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Local = sequelize.define('Local', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  ciudad: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  calle: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  foto_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

module.exports = Local;




