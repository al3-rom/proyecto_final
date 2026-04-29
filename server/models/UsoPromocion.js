const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UsoPromocion = sequelize.define('UsoPromocion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    promocion_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'UsoPromociones',
    timestamps: true
});

module.exports = UsoPromocion;
