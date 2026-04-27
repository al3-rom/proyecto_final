const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    qr_code: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    local_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('Pendiente', 'Entregado'),
        defaultValue: 'Pendiente',
    },
    validated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
});

module.exports = Pedido;
