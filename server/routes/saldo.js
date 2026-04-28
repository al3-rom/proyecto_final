const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const Usuario = require('../models/Usuario');

router.get('/saldo', verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id);
        if (!usuario) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ saldo: usuario.saldo });
    } catch (error) {
        res.status(500).json({ message: 'Error getting balance' });
    }
});

router.post('/recargar', verificarToken, async (req, res) => {
    try {
        const { cantidad } = req.body;
        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const usuario = await Usuario.findByPk(req.user.id);
        if (!usuario) {
            return res.status(404).json({ message: 'User not found' });
        }

        usuario.saldo = Number(usuario.saldo) + Number(cantidad);
        await usuario.save();

        res.json({ saldo: usuario.saldo });
    } catch (error) {
        res.status(500).json({ message: 'Error reloading balance' });
    }
});

module.exports = router;



