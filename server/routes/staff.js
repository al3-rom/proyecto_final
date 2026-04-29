const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verificarToken, verificarRol } = require('../middleware/auth');
const Usuario = require('../models/Usuario');

router.use(verificarToken);

router.post('/register', verificarRol('admin'), async (req, res) => {
    try {
        const { nombre, email, password, local_id } = req.body;
        
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        if (req.user.rol !== 'superadmin' && parseInt(req.user.local_id) !== parseInt(local_id)) {
            return res.status(403).json({ error: 'You can only register staff for your own venue' });
        }

        let foto_perfil_url = null;
        if (req.file) {
            foto_perfil_url = `/uploads/${req.file.filename}`;
        }

        const staff = await Usuario.create({
            nombre,
            email,
            password: await bcrypt.hash(password, 10),
            local_id,
            foto_perfil_url,
            rol: 'staff'
        });
        res.status(201).json({ usuario: { id: staff.id, email: staff.email, local_id: staff.local_id, rol: staff.rol, saldo: staff.saldo, nombre: staff.nombre } });
    } catch (err) {
        res.status(500).json({ error: 'Error creating staff', details: err.message });
    }
});

router.get('/', verificarRol('admin', 'superadmin'), async (req, res) => {
    try {
        const where = { rol: 'staff' };
        
        if (req.user.rol === 'admin') {
            let local_id = req.user.local_id;
            if (local_id === undefined || local_id === null) {
                const u = await Usuario.findByPk(req.user.id);
                local_id = u?.local_id;
            }
            where.local_id = local_id;
        }

        const staff = await Usuario.findAll({ where });
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching staff', details: err.message });
    }
});

router.put('/:id', verificarRol('admin'), async (req, res) => {
    try {
        const staff = await Usuario.findByPk(req.params.id);
        if (!staff || staff.rol !== 'staff') {
            return res.status(404).json({ error: 'Staff not found' });
        }

        if (req.user.rol !== 'superadmin' && parseInt(req.user.local_id) !== parseInt(staff.local_id)) {
            return res.status(403).json({ error: 'You can only update staff from your own venue' });
        }

        staff.set(req.body);
        await staff.save();
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: 'Error updating staff', details: err.message });
    }
});

router.delete('/:id', verificarRol('admin'), async (req, res) => {
    try {
        const staff = await Usuario.findByPk(req.params.id);
        if (!staff || staff.rol !== 'staff') {
            return res.status(404).json({ error: 'Staff not found' });
        }

        if (req.user.rol !== 'superadmin' && parseInt(req.user.local_id) !== parseInt(staff.local_id)) {
            return res.status(403).json({ error: 'You can only delete staff from your own venue' });
        }

        await staff.destroy();
        res.json({ message: 'Staff deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting staff', details: err.message });
    }
});

router.delete('/all/local', verificarRol('admin'), async (req, res) => {
    try {
        const { local_id } = req.query;
        if (!local_id) return res.status(400).json({ error: 'Local ID required' });
        let userLocalId = req.user.local_id;
        if (userLocalId === undefined) {
            const u = await Usuario.findByPk(req.user.id);
            userLocalId = u?.local_id;
        }

        if (req.user.rol !== 'superadmin' && parseInt(userLocalId) !== parseInt(local_id)) {
            return res.status(403).json({ error: 'You can only delete staff from your own venue' });
        }
        await Usuario.destroy({
            where: {
                local_id,
                rol: 'staff'
            }
        });
        res.json({ message: 'All staff deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting all staff', details: err.message });
    }
});

module.exports = router;
