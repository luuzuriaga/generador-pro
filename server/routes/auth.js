const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para Avatares
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});

// Registro
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        console.log(`Intento de registro: ${email}`);

        // Verificar si el usuario ya existe
        let user = await User.findOne({ email });
        if (user) {
            console.log(`El usuario ya existe: ${email}`);
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        user = new User({ firstName, lastName, email, password });
        await user.save();
        console.log(`Usuario registrado con éxito: ${email}`);

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET no definido en el servidor. Revisa el archivo .env');
        }
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, firstName, lastName, email } });
    } catch (err) {
        console.error('❌ Error en REGISTRO:', err);
        res.status(500).json({
            msg: 'Error al registrar usuario',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Intento de login: ${email}`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Usuario no encontrado: ${email}`);
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Contraseña incorrecta para: ${email}`);
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    profileImage: user.profileImage
                }
            });
        });
    } catch (err) {
        console.error('Error en LOGIN:', err);
        res.status(500).json({ msg: 'Error al iniciar sesión', error: err.message });
    }
});

// Actualizar Perfil (con Avatar)
router.put('/update', auth, upload.single('avatar'), async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const updateData = {};

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (req.file) updateData.profileImage = `/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error('Error en UPDATE PERFIL:', err);
        res.status(500).json({ msg: 'Error al actualizar perfil', error: err.message });
    }
});

module.exports = router;
