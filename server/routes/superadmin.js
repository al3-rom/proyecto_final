const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verificarToken, verificarRol } = require('../middleware/auth');
const Local = require('../models/Local');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
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
        const { nombre, ciudad, calle, tipo } = req.body;
        let foto = null;
        if (req.file) {
            foto = `/uploads/${req.file.filename}`;
        }
        const local = await Local.create({ nombre, ciudad, direccion: calle, tipo, foto });
        res.status(201).json(local);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear local', details: err.message });
    }
});

router.put('/locales/:id', upload.single('foto'), async (req, res) => {
    try {
        const { nombre, ciudad, calle, tipo } = req.body;
        const local = await Local.findByPk(req.params.id);
        if (!local) return res.status(404).json({ error: 'Local no encontrado' });
        let foto = local.foto;
        if (req.file) {
            foto = `/uploads/${req.file.filename}`;
        }
        await local.update({ nombre, ciudad, direccion: calle, tipo, foto });
        res.json(local);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar local', details: err.message });
    }
});

router.delete('/locales/:id', async (req, res) => {
    try {
        const localId = req.params.id;
        
        // 1. Desvincular productos (se quedan huérfanos para reuso)
        await Producto.update({ local_id: null }, { where: { local_id: localId } });
        
        // 2. Eliminar promociones vinculadas (son específicas del local)
        const Promocion = require('../models/Promocion');
        await Promocion.destroy({ where: { local_id: localId } });
        
        // 3. Desvincular pedidos (para mantener historial sin errores de FK)
        const Pedido = require('../models/Pedido');
        await Pedido.update({ local_id: null }, { where: { local_id: localId } });
        
        // 4. Eliminar usuarios vinculados (admins y trabajadores)
        await Usuario.destroy({ where: { local_id: localId } });
        
        // 5. Eliminar el local
        const deleted = await Local.destroy({ where: { id: localId } });
        
        if (deleted) {
            res.json({ message: 'Local eliminado correctamente' });
        } else {
            res.status(404).json({ error: 'Local no encontrado' });
        }
    } catch (err) {
        console.error("Error deleting local:", err);
        res.status(500).json({ error: 'Error al eliminar local', details: err.message });
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
            local_id: local_id === "" ? null : local_id
        });

        const adminConLocal = await Usuario.findByPk(admin.id, {
            include: [{ model: Local, as: 'local', attributes: ['id', 'nombre'] }],
            attributes: { exclude: ['password'] }
        });
        
        res.status(201).json(adminConLocal);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear administrador', details: err.message });
    }
});

router.put('/admins/:id', async (req, res) => {
    try {
        const { nombre, email, password, local_id } = req.body;
        const admin = await Usuario.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Administrador no encontrado' });
        
        const updateData = { 
            nombre, 
            email, 
            local_id: local_id === "" ? null : local_id 
        };
        
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        await admin.update(updateData);

        const adminConLocal = await Usuario.findByPk(admin.id, {
            include: [{ model: Local, as: 'local', attributes: ['id', 'nombre'] }],
            attributes: { exclude: ['password'] }
        });
        
        res.json(adminConLocal);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar administrador', details: err.message });
    }
});

module.exports = router;
