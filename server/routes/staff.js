const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verificarRol } = require('../middleware/auth');
const Usuario = require('../models/Usuario');

router.post('/register', verificarRol('admin'), async (req, res) => {
    try {
        const { nombre, email, password, local_id } = req.body;
        
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
        res.status(201).json(staff);
    } catch (err) {
        res.status(500).json({ error: 'Error creating staff', details: err.message });
    }
});

router.get('/', verificarRol('admin'), async (req, res) => {
    try {
        const staff = await Usuario.findAll({
            where: { rol: 'staff' }
        });
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching staff', details: err.message });
    }
});

router.put('/:id', verificarRol('admin'), async (req, res) => {

    try {
        const staff = await Usuario.findByPk(req.params.id);
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
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
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        await staff.destroy();
        res.json({ message: 'Staff deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting staff', details: err.message });
    }
});

module.exports = router;