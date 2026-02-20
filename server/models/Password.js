const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: String, required: true }, // Valor encriptado
    label: { type: String, default: 'Sin etiqueta' },
    url: { type: String, default: '' },
    strength: { type: String, default: 'Desconocida' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Password || mongoose.model('Password', passwordSchema);
