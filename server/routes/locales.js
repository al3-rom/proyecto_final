const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middleware/auth');
const Local = require('../models/Local');
const Producto = require('../models/Producto');

router.get('/', async (req, res) => {
    try {
        const locales = await Local.findAll();
        res.json(locales);
    } catch (err) {
        res.status(500).json({ error: 'Error getting locales', details: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const local = await Local.findByPk(req.params.id);
        if (!local) {
            return res.status(404).json({ error: 'Local not found' });
        }
        res.json(local);
    } catch (err) {
        res.status(500).json({ error: 'Error getting local', details: err.message });
    }
});

router.get('/:id/productos', async (req, res) => {
    try {
        const productos = await Producto.findAll({ where: { local_id: req.params.id } });
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error getting products', details: err.message });
    }
});



module.exports = router;