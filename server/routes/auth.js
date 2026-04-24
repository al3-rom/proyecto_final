const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { verificarToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', upload.single('foto_perfil'), async (req, res) => {
    try {
        const { email, password, nombre } = req.body;
        
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        
        let foto_perfil_url = null;
        if (req.file) {
            foto_perfil_url = `/uploads/${req.file.filename}`;
        }

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const usuario = await Usuario.create({
            email,
            password: hashedPassword,
            nombre,
            foto_perfil_url,
            rol: 'user'
        });

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol, saldo: usuario.saldo, nombre: usuario.nombre, local_id: usuario.local_id }, token });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user', details: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol, saldo: usuario.saldo, nombre: usuario.nombre, local_id: usuario.local_id }, token });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in', details: err.message });
    }
});


module.exports = router;