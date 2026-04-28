const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verificarToken, verificarRol } = require('../middleware/auth');
const Local = require('../models/Local');
const Usuario = require('../models/Usuario');
const upload = require('../middleware/upload');

router.use(verificarToken, verificarRol('superadmin'));

router.get('/locales', async (req, res) => {
    try {
        const locales = await Local.findAll({
            include: [{
                model: Usuario,
                as: 'usuarios',
                where: { rol: 'admin' },
                required: false,
                attributes: ['id', 'nombre', 'email']
            }]
        });
        res.json(locales);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener locales', details: err.message });
    }
});

router.post('/locales', upload.single('foto'), async (req, res) => {
    try {
        const { nombre, ciudad, calle } = req.body;
        let foto_url = null;
        if (req.file) {
            foto_url = `/uploads/${req.file.filename}`;
        }
        const local = await Local.create({ nombre, ciudad, calle, foto_url });
        res.status(201).json(local);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear local', details: err.message });
    }
});

router.put('/locales/:id', upload.single('foto'), async (req, res) => {
    try {
        const { nombre, ciudad, calle } = req.body;
        const local = await Local.findByPk(req.params.id);
        if (!local) return res.status(404).json({ error: 'Local no encontrado' });
        let foto_url = local.foto_url;
        if (req.file) {
            foto_url = `/uploads/${req.file.filename}`;
        }
        await local.update({ nombre, ciudad, calle, foto_url });
        res.json(local);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar local', details: err.message });
    }
});

router.get('/admins', async (req, res) => {
    try {
        const admins = await Usuario.findAll({
            where: { rol: 'admin' },
            include: [{ model: Local, as: 'local', attributes: ['id', 'nombre'] }],
            attributes: { exclude: ['password'] }
        });
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener administradores', details: err.message });
    }
});

router.post('/admins', async (req, res) => {
    try {
        const { email, password, nombre, local_id } = req.body;
        const existe = await Usuario.findOne({ where: { email } });
        if (existe) return res.status(400).json({ error: 'El email ya está registrado' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Usuario.create({
            email,
            password: hashedPassword,
            nombre,
            rol: 'admin',
            local_id
        });
        res.status(201).json({ id: admin.id, email: admin.email, nombre: admin.nombre });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear administrador', details: err.message });
    }
});

router.put('/admins/:id', async (req, res) => {
    try {
        const { nombre, email, password, local_id } = req.body;
        const admin = await Usuario.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Administrador no encontrado' });
        const updateData = { nombre, email, local_id };
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }
        await admin.update(updateData);
        res.json({ id: admin.id, email: admin.email, nombre: admin.nombre });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar administrador', details: err.message });
    }
});

module.exports = router;
