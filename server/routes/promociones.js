const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth');
const Promocion = require('../models/Promocion');
const upload = require('../middleware/upload');

router.get('/local/:local_id', async (req, res) => {
    try {
        const promos = await Promocion.findAll({
            where: { local_id: req.params.local_id, activo: true },
            include: [{
                model: require('../models/Producto'),
                as: 'producto',
                include: [{
                    model: require('../models/Traduccion_producto'),
                    as: 'Traduccion_productos'
                }]
            }],
            order: [['fecha_evento', 'ASC']]
        });
        res.json(promos);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching promotions', details: err.message });
    }
});

router.post('/', verificarToken, upload.single('foto'), async (req, res) => {
    try {
        const { titulo, descripcion, fecha_evento, local_id, descuento, producto_id, limite_por_persona } = req.body;
        const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

        const promo = await Promocion.create({
            titulo,
            descripcion,
            fecha_evento,
            local_id,
            descuento: descuento || 0,
            producto_id: producto_id || null,
            limite_por_persona: limite_por_persona || 0,
            foto_url
        });
        res.status(201).json(promo);
    } catch (err) {
        res.status(500).json({ error: 'Error creating promotion', details: err.message });
    }
});

router.put('/:id', verificarToken, upload.single('foto'), async (req, res) => {
    try {
        const { titulo, descripcion, fecha_evento, descuento, producto_id, limite_por_persona } = req.body;
        const promo = await Promocion.findByPk(req.params.id);
        
        if (!promo) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        const updateData = {
            titulo,
            descripcion,
            fecha_evento,
            descuento: descuento || 0,
            producto_id: producto_id || null,
            limite_por_persona: limite_por_persona || 0,
        };

        if (req.file) {
            updateData.foto_url = `/uploads/${req.file.filename}`;
        }

        await promo.update(updateData);
        res.json(promo);
    } catch (err) {
        res.status(500).json({ error: 'Error updating promotion', details: err.message });
    }
});

router.post('/:id/claim', verificarToken, async (req, res) => {
    const sequelize = require('../config/database');
    const t = await sequelize.transaction();
    try {
        const promo = await Promocion.findByPk(req.params.id, {
            include: [{ 
                model: require('../models/Producto'), 
                as: 'producto' 
            }],
            transaction: t
        });
        
        if (!promo) {
            await t.rollback();
            return res.status(404).json({ error: 'Promotion not found' });
        }

        const UsoPromocion = require('../models/UsoPromocion');
        const Usuario = require('../models/Usuario');
        const Pedido = require('../models/Pedido');
        const { generarQr } = require('../utils/qr');

        if (promo.limite_por_persona > 0) {
            const uso = await UsoPromocion.findOne({
                where: { usuario_id: req.usuario.id, promocion_id: promo.id },
                transaction: t
            });

            if (uso && uso.usos >= promo.limite_por_persona) {
                await t.rollback();
                return res.status(400).json({ error: 'user.lugares.limitReached' });
            }

            if (uso) {
                uso.usos += 1;
                await uso.save({ transaction: t });
            } else {
                await UsoPromocion.create({
                    usuario_id: req.usuario.id,
                    promocion_id: promo.id,
                    usos: 1
                }, { transaction: t });
            }
        }

        let resultData = { message: 'Promotion claimed successfully' };

        if (promo.producto_id && promo.producto) {
            const usuario = await Usuario.findByPk(req.usuario.id, { transaction: t });
            const discountedPrice = Number((promo.producto.precio * (1 - (promo.descuento || 0) / 100)).toFixed(2));

            if (Number(usuario.saldo) < discountedPrice) {
                await t.rollback();
                return res.status(400).json({ error: 'user.menu.insufficientBalance' });
            }

            const uniqueId = `promo-${req.usuario.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const qr_code = generarQr(uniqueId);

            const pedido = await Pedido.create({
                usuario_id: req.usuario.id,
                producto_id: promo.producto_id,
                local_id: promo.local_id,
                qr_code,
                precio_pagado: discountedPrice
            }, { transaction: t });

            usuario.saldo = Number(usuario.saldo) - discountedPrice;
            await usuario.save({ transaction: t });

            resultData.pedido = pedido;
            resultData.nuevoSaldo = usuario.saldo;
        }

        await t.commit();
        res.json(resultData);
    } catch (err) {
        if (t) await t.rollback();
        console.error("Error claiming promotion:", err);
        res.status(500).json({ error: 'Error claiming promotion', details: err.message });
    }
});

router.delete('/:id', verificarToken, verificarRol('admin', 'superadmin'), async (req, res) => {
    try {
        const promo = await Promocion.findByPk(req.params.id);
        if (!promo) return res.status(404).json({ error: 'Promotion not found' });

        if (req.usuario.rol === 'admin' && parseInt(req.usuario.local_id) !== parseInt(promo.local_id)) {
            return res.status(403).json({ error: 'No tienes permiso' });
        }

        await promo.destroy();
        res.json({ message: 'Promotion deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting promotion', details: err.message });
    }
});

module.exports = router;
