const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth');
const Local = require('../models/Local');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');
const Traduccion_producto = require('../models/Traduccion_producto');

router.get('/:id/stats', verificarToken, async (req, res) => {
    try {
        if (req.user.rol !== 'superadmin' && parseInt(req.user.local_id) !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'You can only view stats for your own venue' });
        }
        const local = await Local.findByPk(req.params.id);
        if (!local) return res.status(404).json({ error: 'Local not found' });

        const totalPedidos = await Pedido.count({ where: { local_id: req.params.id } });
        
        const isFestival = local.tipo === 'festival';
        
        const papelMult = isFestival ? 0.5 : 1.5;
        const plasticoMult = isFestival ? 5.0 : 0.0;
        
        const stats = {
            totalPedidos,
            tipoLocal: local.tipo,
            papelAhorradoGramos: totalPedidos * papelMult,
            fichasPlasticoAhorradas: isFestival ? totalPedidos : 0,
            plasticoAhorradoGramos: totalPedidos * plasticoMult,
            aguaAhorradaLitros: totalPedidos * (isFestival ? 0.01 : 0.05),
            co2AhorradoGramos: totalPedidos * (isFestival ? 4.0 : 1.5)
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Error getting stats', details: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const locales = await Local.findAll({
            include: [{
                model: require('../models/Promocion'),
                as: 'promociones',
                where: { activo: true },
                required: false
            }]
        });
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
        const productos = await Producto.findAll({ 
            where: { local_id: req.params.id },
            include: [{ model: Traduccion_producto, as: 'Traduccion_productos' }]
        });
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error getting products', details: err.message });
    }
});

module.exports = router;
