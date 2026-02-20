const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// 1. CONFIGURACIÓN DE CORS (Debe ser lo primero)
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// DIAGNÓSTICO DE INICIO
console.log('--- Iniciando Servidor ---');
console.log('JWT_SECRET cargado:', process.env.JWT_SECRET ? 'SÍ' : 'NO');
console.log('MONGODB_URI cargado:', process.env.MONGODB_URI ? 'SÍ' : 'NO');


// 2. LECTURA DE JSON
app.use(express.json());

// 3. LOG DE PETICIONES (Para que veas en la terminal cuando entre el registro)
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleString()} - ${req.method} ${req.url}`);
    next();
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/generador-pro', {
    serverSelectionTimeoutMS: 5000 // No esperar para siempre
})
    .then(() => {
        console.log('✅ MongoDB conectado con éxito');
        fs.writeFileSync(path.join(__dirname, 'db-status.txt'), 'SUCCESS');
    })
    .catch(err => {
        console.error('❌ Error fatal al conectar a MongoDB:');
        console.error(err);
        fs.writeFileSync(path.join(__dirname, 'db-status.txt'), 'FAILURE: ' + err.message);
    });

// Middleware para ver errores globales
app.use((err, req, res, next) => {
    console.error('ERR GLOBAL:', err);
    res.status(500).json({
        msg: 'Error interno del servidor',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/passwords', require('./routes/passwords'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});