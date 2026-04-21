const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middleware/auth');
const Pedido = require('../models/Pedido');
const { generarQr } = require('../utils/qr');
const Producto = require('../models/Producto');
const Local = require('../models/Local');

router.post('/', verificarRol('user'), async (req, res) => {
    try {
        const { producto_id, local_id } = req.body;
        const tempId = Date.now();
        const qr_code = generarQr(tempId);

        const pedido = await Pedido.create({
            usuario_id: req.usuario.id,
            producto_id,
            local_id,
            qr_code
        });

        res.status(201).json(pedido);
    } catch (err) {
        res.status(500).json({ error: 'Error creating order', details: err.message });
    }
});

router.get('/my-orders', verificarRol('user'), async (req, res) => {
   try {
    const pedidos = await Pedido.findAll({
        where: { usuario_id: req.usuario.id },
        include: [
            { model: Producto, as: 'producto' },
            { model: Local, as: 'local' }
        ]
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
            return res.status(404).json({ error: 'Order not found' });
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