const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth');
const Pedido = require('../models/Pedido');
const { generarQr } = require('../utils/qr');
const Producto = require('../models/Producto');
const Traduccion_producto = require('../models/Traduccion_producto');
const Local = require('../models/Local');
const Usuario = require('../models/Usuario');
const sequelize = require('../config/database');

router.use(verificarToken);

router.post('/', verificarRol('user'), async (req, res) => {
    try {
        const { producto_id, local_id } = req.body;
        
        const producto = await Producto.findByPk(producto_id);
        if (!producto) return res.status(404).json({ error: 'user.menu.productNotFound' });

        if (parseInt(producto.local_id) !== parseInt(local_id)) {
            return res.status(400).json({ error: 'Product does not belong to this venue' });
        }

        const usuario = await Usuario.findByPk(req.usuario.id);
        if (Number(usuario.saldo) < Number(producto.precio)) {
            return res.status(400).json({ error: 'user.menu.insufficientBalance' });
        }

        const uniqueId = `${req.usuario.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const qr_code = generarQr(uniqueId);

        const t = await sequelize.transaction();

        try {
            const pedido = await Pedido.create({
                usuario_id: req.usuario.id,
                producto_id,
                local_id,
                qr_code
            }, { transaction: t });

            usuario.saldo = Number(usuario.saldo) - Number(producto.precio);
            await usuario.save({ transaction: t });

            await t.commit();
            res.status(201).json({ pedido, nuevoSaldo: usuario.saldo });
        } catch (error) {
            await t.rollback();
            throw error;
        }
    } catch (err) {
        res.status(500).json({ error: 'Error creating order', details: err.message });
    }
});

router.get('/by-qr/:qr_code', verificarRol('staff'), async (req, res) => {
    try {
        const pedido = await Pedido.findOne({
            where: { qr_code: req.params.qr_code },
            include: [
                {
                    model: Producto,
                    as: 'producto',
                    include: [{ model: Traduccion_producto, as: 'Traduccion_productos' }]
                },
                { model: Local, as: 'local' },
                { model: Usuario, as: 'usuario', attributes: ['nombre', 'email', 'saldo'] }
            ]
        });

        if (!pedido) {
            return res.status(404).json({ error: 'user.bebidas.errorNotFound' });
        }

        if (req.usuario.rol !== 'superadmin' && req.usuario.local_id !== pedido.local_id) {
            return res.status(403).json({ error: 'No tienes permiso para ver pedidos de este local' });
        }

           res.status(200).json(pedido);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching order by QR', details: err.message });
    }
});

router.get('/my-orders', verificarRol('user'), async (req, res) => {
   try {
    const pedidos = await Pedido.findAll({
        where: { 
            usuario_id: req.usuario.id,
            local_id: { [Op.ne]: null }
        },
        include: [
            {
                model: Producto,
                as: 'producto',
                include: [{ model: Traduccion_producto, as: 'Traduccion_productos' }]
            },
            { model: Local, as: 'local' },
            { model: Usuario, as: 'staff', attributes: ['nombre'] }
        ],
        order: [['createdAt', 'DESC']]
    });
        const usuario = await Usuario.findByPk(req.usuario.id, { attributes: ['saldo'] });
        res.status(200).json({ pedidos, saldo: usuario.saldo });
    } catch (err) {
    res.status(500).json({ error: 'Error fetching orders', details: err.message });
   }
});

router.put('/:id/tip', verificarRol('user'), async (req, res) => {
    try {
        const { propina } = req.body;
        const pedido = await Pedido.findByPk(req.params.id);
        
        if (!pedido || pedido.usuario_id !== req.usuario.id) {
            return res.status(404).json({ error: 'Pedido not found' });
        }

        if (pedido.estado !== 'Pendiente' && pedido.estado !== 'En Guardarropa') {
            return res.status(400).json({ error: 'Cannot add tip to a finished order' });
        }

        const tipAmount = Number(propina);
        if (isNaN(tipAmount) || tipAmount < 0) {
            return res.status(400).json({ error: 'Invalid tip amount' });
        }

        pedido.propina = tipAmount;
        await pedido.save();
        res.json(pedido);
    } catch (err) {
        res.status(500).json({ error: 'Error adding tip', details: err.message });
    }
});

router.put('/:id/validate', verificarRol('staff'), async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const pedido = await Pedido.findByPk(req.params.id, {
            include: [{ model: Producto, as: 'producto' }],
            transaction: t
        });

        if (!pedido) {
            await t.rollback();
            return res.status(404).json({ error: 'user.bebidas.errorNotFound' });
        }

        if (req.usuario.rol !== 'superadmin' && req.usuario.local_id !== pedido.local_id) {
            await t.rollback();
            return res.status(403).json({ error: 'No tienes permiso para validar en este local' });
        }

        const tipo = pedido.producto?.tipo || 'bebida';

        if (tipo === 'bebida') {
            if (pedido.estado === 'Entregado') {
                await t.rollback();
                return res.status(400).json({ error: 'Esta bebida ya ha sido entregada' });
            }
            pedido.estado = 'Entregado';
            pedido.validated_at = new Date();
        } else if (tipo === 'guardarropa') {
            if (pedido.estado === 'Pendiente') {
                pedido.estado = 'En Guardarropa';
                pedido.validated_at = new Date();
            } else if (pedido.estado === 'En Guardarropa') {
                pedido.estado = 'Recogido';
            } else if (pedido.estado === 'Recogido') {
                await t.rollback();
                return res.status(400).json({ error: 'Esta ropa ya ha sido recogida' });
            }
        }

        if (Number(pedido.propina) > 0) {
            const cliente = await Usuario.findByPk(pedido.usuario_id, { transaction: t });
            const camarero = await Usuario.findByPk(req.usuario.id, { transaction: t });

            if (cliente && camarero) {
                if (Number(cliente.saldo) >= Number(pedido.propina)) {
                    cliente.saldo = Number(cliente.saldo) - Number(pedido.propina);
                    camarero.saldo = Number(camarero.saldo) + Number(pedido.propina);
                    await cliente.save({ transaction: t });
                    await camarero.save({ transaction: t });
                } else {
                    await t.rollback();
                    return res.status(400).json({ error: 'El cliente no tiene saldo suficiente para la propina' });
                }
            }
        }

        pedido.staff_id = req.usuario.id;
        await pedido.save({ transaction: t });
        await t.commit();

        const nuevoSaldoStaff = Number(pedido.propina) > 0
            ? (await Usuario.findByPk(req.usuario.id))?.saldo
            : undefined;

        const nuevoSaldoCliente = Number(pedido.propina) > 0
            ? (await Usuario.findByPk(pedido.usuario_id))?.saldo
            : undefined;

        res.json({ pedido, nuevoSaldoStaff, nuevoSaldoCliente });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: 'Error validating order', details: err.message });
    }
});

router.get('/tip-history', verificarRol('staff'), async (req, res) => {
    try {
        const history = await Pedido.findAll({
            where: { 
                staff_id: req.usuario.id,
                propina: { [require('sequelize').Op.gt]: 0 }
            },
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nombre', 'foto_perfil_url'] }
            ],
            order: [['validated_at', 'DESC']]
        });
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching tip history', details: err.message });
    }
});

router.put('/:id/transfer', verificarRol('user'), async (req, res) => {
    try {
        const { targetEmail } = req.body;
        const pedido = await Pedido.findByPk(req.params.id);

        if (!pedido || pedido.usuario_id !== req.usuario.id) {
            return res.status(404).json({ error: 'Pedido not found' });
        }

        if (pedido.local_id === null) {
            return res.status(400).json({ error: 'Cannot transfer drinks from closed venues' });
        }

        if (pedido.estado !== 'Pendiente' && pedido.estado !== 'En Guardarropa') {
            return res.status(400).json({ error: 'Cannot transfer a finished order' });
        }

        const targetUser = await Usuario.findOne({ where: { email: targetEmail } });
        if (!targetUser) {
            return res.status(404).json({ error: 'user.bebidas.userNotFound' });
        }

        if (targetUser.id === req.usuario.id) {
            return res.status(400).json({ error: 'Cannot transfer to yourself' });
        }

        pedido.usuario_id = targetUser.id;
        await pedido.save();

        res.json({ message: 'Order transferred successfully', targetUser: targetUser.nombre });
    } catch (err) {
        res.status(500).json({ error: 'Error transferring order', details: err.message });
    }
});

router.post('/sell-back', verificarRol('user'), async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { orderIds } = req.body;
        if (!orderIds || !Array.isArray(orderIds)) {
            if (t) await t.rollback();
            return res.status(400).json({ error: 'Invalid order IDs' });
        }

        const pedidos = await Pedido.findAll({
            where: {
                id: orderIds,
                usuario_id: req.usuario.id,
                estado: 'Pendiente',
                local_id: { [Op.ne]: null }
            },
            include: [{ model: Producto, as: 'producto' }],
            transaction: t
        });

        if (pedidos.length === 0) {
            if (t) await t.rollback();
            return res.status(404).json({ error: 'No valid pending orders found' });
        }

        let totalRefund = 0;
        for (const pedido of pedidos) {
            const basePrice = pedido.precio_pagado || pedido.producto.precio;
            const refund = Number((basePrice * 0.45).toFixed(2));
            totalRefund += refund;
            
            pedido.estado = 'Reembolsado';
            await pedido.save({ transaction: t });
        }

        const usuario = await Usuario.findByPk(req.usuario.id, { transaction: t });
        usuario.saldo = Number(usuario.saldo) + Number(totalRefund.toFixed(2));
        await usuario.save({ transaction: t });

        await t.commit();
        res.json({ 
            message: 'Orders refunded successfully', 
            refundAmount: Number(totalRefund.toFixed(2)), 
            nuevoSaldo: usuario.saldo 
        });
    } catch (err) {
        if (t) await t.rollback();
        console.error("Refund error:", err);
        res.status(500).json({ error: 'Error processing refund', details: err.message });
    }
});

module.exports = router;
