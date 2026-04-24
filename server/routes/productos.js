const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middleware/auth');
const Producto = require('../models/Producto');
const Traduccion_producto = require('../models/Traduccion_producto');
const upload = require('../middleware/upload');


router.get('/', async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [{ model: Traduccion_producto }]
        });
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching products', details: err.message });
    }
});


router.post('/', verificarRol('admin'), upload.single('foto'), async (req, res) => {
    try {
        const { local_id, precio, traducciones } = req.body;
        const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

        const producto = await Producto.create({ precio: precio || 0, foto_url, local_id });

        const traduccionesArr = JSON.parse(traducciones);
        for (const t of traduccionesArr) {
            await Traduccion_producto.create({
                producto_id: producto.id,
                nombre: t.nombre,
                descripcion: t.descripcion,
                codigo_idioma: t.codigo_idioma
            });
        }

        const productoConTraducciones = await Producto.findByPk(producto.id, {
            include: [{ model: Traduccion_producto }]
        });
        res.status(201).json(productoConTraducciones);
    } catch (err) {
        res.status(500).json({ error: 'Error creating product', details: err.message });
    }
});


router.put('/:id', verificarRol('admin'), upload.single('foto'), async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Product not found' });

        if (req.file) {
            await producto.update({ foto_url: `/uploads/${req.file.filename}` });
        }

        if (req.body.traducciones) {
            const traduccionesArr = JSON.parse(req.body.traducciones);
            for (const t of traduccionesArr) {
                const existing = await Traduccion_producto.findOne({
                    where: { producto_id: producto.id, codigo_idioma: t.codigo_idioma }
                });
                if (existing) {
                    await existing.update({ nombre: t.nombre, descripcion: t.descripcion });
                } else {
                    await Traduccion_producto.create({
                        producto_id: producto.id,
                        nombre: t.nombre,
                        descripcion: t.descripcion,
                        codigo_idioma: t.codigo_idioma
                    });
                }
            }
        }

        const productoActualizado = await Producto.findByPk(producto.id, {
            include: [{ model: Traduccion_producto }]
        });
        res.json(productoActualizado);
    } catch (err) {
        res.status(500).json({ error: 'Error updating product', details: err.message });
    }
});


router.delete('/:id', verificarRol('admin'), async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Product not found' });
        await Traduccion_producto.destroy({ where: { producto_id: producto.id } });
        await producto.destroy();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting product', details: err.message });
    }
});

module.exports = router;