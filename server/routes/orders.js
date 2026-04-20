const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middleware/auth');
const Pedido = require('../models/Pedido');
const { generarQr } = require('../utils/qr');

router.post('/', verificarRol('user'), async (req, res) => {
    try {
        const { usuario_id, producto_id, local_id } = req.body;

        const qr_code = generarQr(pedido.id);

        const pedido = await Pedido.create({
            qr_code,
            usuario_id,
            producto_id,
            local_id
        });
   
        await pedido.save();
        res.status(201).json(pedido);
    } catch (err) {
        res.status(500).json({ error: 'Error creating order', details: err.message });
    }
});

module.exports = router;