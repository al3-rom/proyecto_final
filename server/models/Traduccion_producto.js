const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Traduccion_producto = sequelize.define('Traduccion_producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    codigo_idioma: {
        type: DataTypes.STRING(4),
        allowNull: false,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
});

module.exports = Traduccion_producto;




