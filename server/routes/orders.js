const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth');

router.use(verificarToken);
const Pedido = require('../models/Pedido');
const { generarQr } = require('../utils/qr');
const Producto = require('../models/Producto');
const Traduccion_producto = require('../models/Traduccion_producto');
const Local = require('../models/Local');
const Usuario = require('../models/Usuario');
const sequelize = require('../config/database');

router.post('/', verificarRol('user'), async (req, res) => {
    try {
        const { producto_id, local_id } = req.body;
        
        const producto = await Producto.findByPk(producto_id);
        if (!producto) return res.status(404).json({ error: 'user.menu.productNotFound' });

        const usuario = await Usuario.findByPk(req.usuario.id);
        if (Number(usuario.saldo) < Number(producto.precio)) {
            return res.status(400).json({ error: 'user.menu.insufficientBalance' });
        }

        const tempId = Date.now();
        const qr_code = generarQr(tempId);

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
                { model: Usuario, as: 'usuario', attributes: ['nombre', 'email'] }
            ]
        });

        if (!pedido) {
            return res.status(404).json({ error: 'user.bebidas.errorNotFound' });
        }

        res.status(200).json(pedido);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching order by QR', details: err.message });
    }
});

router.get('/my-orders', verificarRol('user'), async (req, res) => {
   try {
    const pedidos = await Pedido.findAll({
        where: { usuario_id: req.usuario.id },
        include: [
            {
                model: Producto,
                as: 'producto',
                include: [{ model: Traduccion_producto, as: 'Traduccion_productos' }]
            },
            { model: Local, as: 'local' }
        ],
        order: [['createdAt', 'DESC']]
    });
    res.status(200).json(pedidos);
   } catch (err) {
    res.status(500).json({ error: 'Error fetching orders', details: err.message });
   }
});

router.put('/:id/validate', verificarRol('staff'), async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id);
        if (!pedido) {
            return res.status(404).json({ error: 'user.bebidas.errorNotFound' });
        }
        pedido.estado = 'Entregado';
        pedido.staff_id = req.usuario.id;
        pedido.validated_at = new Date();
        await pedido.save();
        res.json(pedido);
    } catch (err) {
        res.status(500).json({ error: 'Error validating order', details: err.message });
    }
});

module.exports = router;



