const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promocion = sequelize.define('Promocion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    local_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    foto_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    fecha_evento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    descuento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Productos', key: 'id' }
    },
    limite_por_persona: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0 
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
});

module.exports = Promocion;
