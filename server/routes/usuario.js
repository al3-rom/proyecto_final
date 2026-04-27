const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const { Op } = require('sequelize');

router.get('/me', verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id);
        if (!usuario) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol, saldo: usuario.saldo, nombre: usuario.nombre, foto_perfil_url: usuario.foto_perfil_url, local_id: usuario.local_id } });
    } catch (err) {
        res.status(500).json({ error: 'Error getting user', details: err.message });
    }
});

router.put('/update-profile', verificarToken, upload.single('foto_perfil'), async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const usuario = await Usuario.findByPk(req.user.id);

        if (!usuario) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (nombre) {
            usuario.nombre = nombre;
        }

        if (email && email !== usuario.email) {
            const existeOtro = await Usuario.findOne({ where: { email, id: { [Op.ne]: usuario.id } } });
            if (existeOtro) {
                return res.status(400).json({ error: 'Email already taken' });
            }
            usuario.email = email;
        }

        if (req.file) {
            usuario.foto_perfil_url = `/uploads/${req.file.filename}`;
        }

        if (password) {
            const validPassword = await bcrypt.compare(password, usuario.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'perfil.invalidPassword' });
            }
            usuario.password = await bcrypt.hash(password, 10);
        }

        await usuario.save();

        res.json({ usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol, saldo: usuario.saldo, nombre: usuario.nombre, foto_perfil_url: usuario.foto_perfil_url } });
    } catch (err) {
        res.status(500).json({ error: 'Error updating profile', details: err.message });
    }
});

router.put('/change-password', verificarToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const usuario = await Usuario.findByPk(req.user.id);
        if (!usuario) {
            return res.status(404).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, usuario.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'perfil.invalidPassword' });
        }

        usuario.password = await bcrypt.hash(newPassword, 10);
        await usuario.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error changing password', details: err.message });
    }
});

router.delete('/delete-profile', verificarToken, async (req, res) => {
    try {
        const { password } = req.body;
        const usuario = await Usuario.findByPk(req.user.id);
        if (!usuario) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (usuario.rol === 'admin' || usuario.rol === 'staff') {
            return res.status(403).json({ error: 'Admins and Staff cannot delete their accounts for security reasons' });
        }

        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'perfil.invalidPassword' });
        }

        await usuario.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user', details: err.message });
    }
});

module.exports = router;