const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth');
const Producto = require('../models/Producto');
const Traduccion_producto = require('../models/Traduccion_producto');
const upload = require('../middleware/upload');
const sequelize = require('../config/database');


router.get('/', async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [{ model: Traduccion_producto, as: 'Traduccion_productos' }]
        });
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching products', details: err.message });
    }
});


router.use(verificarToken);

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
            include: [{ model: Traduccion_producto, as: 'Traduccion_productos' }]
        });
        res.status(201).json(productoConTraducciones);
    } catch (err) {
        res.status(500).json({ error: 'Error creating product', details: err.message });
    }
});


router.put('/:id', verificarRol('admin'), upload.single('foto'), async (req, res) => {
    try {
        const { precio, traducciones } = req.body;
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Product not found' });

        const updateData = {};
        if (precio !== undefined) updateData.precio = precio;
        if (req.file) updateData.foto_url = `/uploads/${req.file.filename}`;

        await producto.update(updateData);

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
            include: [{ model: Traduccion_producto, as: 'Traduccion_productos' }]
        });
        res.json(productoActualizado);
    } catch (err) {
        res.status(500).json({ error: 'Error updating product', details: err.message });
    }
});



router.delete('/all', verificarRol('admin'), async (req, res) => {
    try {
        const { local_id } = req.query;
        if (!local_id) return res.status(400).json({ error: 'Local ID required' });
        
        let userLocalId = req.user.local_id;
        if (userLocalId === undefined) {
            const u = await require('../models/Usuario').findByPk(req.user.id);
            userLocalId = u?.local_id;
        }

        if (req.user.rol !== 'superadmin' && parseInt(userLocalId) !== parseInt(local_id)) {
            return res.status(403).json({ error: 'You can only delete products from your own venue' });
        }

        const t = await sequelize.transaction();
        try {
            const products = await Producto.findAll({ where: { local_id } });
            const ids = products.map(p => p.id);

            await Traduccion_producto.destroy({ where: { producto_id: ids } }, { transaction: t });
            await Producto.destroy({ where: { id: ids } }, { transaction: t });

            await t.commit();
            res.json({ message: 'All products deleted' });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: 'Error deleting all products', details: err.message });
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


router.post('/bulk', verificarRol('admin'), async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { products, local_id } = req.body;
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ error: 'Invalid products array' });
        }

        for (const pData of products) {
            const producto = await Producto.create({ 
                precio: parseFloat(pData.precio) || 0, 
                foto_url: null, 
                local_id 
            }, { transaction: t });

            const translations = [
                { codigo_idioma: 'es', nombre: pData.nombre_es, descripcion: pData.descripcion_es },
                { codigo_idioma: 'ru', nombre: pData.nombre_ru, descripcion: pData.descripcion_ru },
                { codigo_idioma: 'en', nombre: pData.nombre_en, descripcion: pData.descripcion_en }
            ];

            for (const trans of translations) {
                await Traduccion_producto.create({
                    producto_id: producto.id,
                    nombre: trans.nombre || '—',
                    descripcion: trans.descripcion || '',
                    codigo_idioma: trans.codigo_idioma
                }, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ message: `${products.length} products imported successfully` });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: 'Error in bulk import', details: err.message });
    }
});

module.exports = router;



