const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middleware/auth');
const Producto = require('../models/Producto');
const Traduccion_producto = require('../models/Traduccion_producto');


router.post('/', verificarRol('admin'), async (req, res) => {
    try {
        const { nombre, descripcion, precio, foto_url, local_id, codigo_idioma } = req.body;
        const producto = await Producto.create({
            precio,
            foto_url,
            local_id
        });
        const traduccion = await Traduccion_producto.create({
            producto_id: producto.id,
            nombre,
            descripcion,
            codigo_idioma
        });
        res.status(201).json({ producto, traduccion });
    } catch (err) {
        res.status(500).json({ error: 'Error creating product', details: err.message });
    }
});

router.put('/:id', verificarRol('admin'), async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await producto.update(req.body);
        res.json(producto);
    } catch (err) {
        res.status(500).json({ error: 'Error updating product', details: err.message });
    }
});

router.delete('/:id', verificarRol('admin'), async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await producto.destroy();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting product', details: err.message });
    }
});



module.exports = router;