const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  foto_perfil_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  saldo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'user', 'staff', 'superadmin'),
    defaultValue: 'user',
  },
  local_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
});

module.exports = Usuario;




