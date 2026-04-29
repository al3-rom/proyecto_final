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
    type: DataTypes.STRING, 
    allowNull: false 
  },
  direccion: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  foto: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  tipo: { 
    type: DataTypes.ENUM('normal', 'festival'), 
    defaultValue: 'normal' 
  }
});

module.exports = Local;
