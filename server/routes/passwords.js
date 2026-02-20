const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Password = require('../models/Password');

// Obtener todas las contraseñas del usuario (Bóveda e Historial)
router.get('/', auth, async (req, res) => {
    try {
        const passwords = await Password.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(passwords);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Guardar una nueva contraseña
router.post('/', auth, async (req, res) => {
    try {
        const { value, label, url, strength } = req.body;
        const newPassword = new Password({
            userId: req.user.id,
            value,
            label,
            url,
            strength
        });
        const password = await newPassword.save();
        res.json(password);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Eliminar una contraseña
router.delete('/:id', auth, async (req, res) => {
    try {
        const password = await Password.findById(req.params.id);
        if (!password) return res.status(404).json({ msg: 'Contraseña no encontrada' });

        // Verificar que el usuario sea el dueño
        if (password.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'No autorizado' });
        }

        await Password.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Contraseña eliminada' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
