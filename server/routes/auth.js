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
            return res.status(400).json({ error: 'auth.errors.passwordShort' });
        }
        
        let foto_perfil_url = null;
        if (req.file) {
            foto_perfil_url = `/uploads/${req.file.filename}`;
        }

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) {
            return res.status(400).json({ error: 'auth.errors.emailExists' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const usuario = await Usuario.create({
            email,
            password: hashedPassword,
            nombre,
            foto_perfil_url,
            rol: 'user'
        });

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol, local_id: usuario.local_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol, saldo: usuario.saldo, nombre: usuario.nombre, local_id: usuario.local_id }, token });
    } catch (err) {
        res.status(500).json({ error: 'auth.errors.unexpected', details: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'auth.errors.loginIncorrect' });
        }

        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(401).json({ error: 'auth.errors.userNotFound' });
        }
        
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ error: 'auth.errors.loginIncorrect' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol, local_id: usuario.local_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol, saldo: usuario.saldo, nombre: usuario.nombre, local_id: usuario.local_id }, token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: 'auth.errors.unexpected', details: err.message, raw: err.toString() });
    }
});


module.exports = router;



