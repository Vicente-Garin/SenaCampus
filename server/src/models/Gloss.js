const mongoose = require('mongoose');

const GlossSchema = new mongoose.Schema({
  glosa_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  termino: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  variantes: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  categoria: {
    type: String,
    enum: ['academico', 'comun', 'tiempo', 'lugares', 'dactilologia', 'general'],
    default: 'general'
  },
  tipo_recurso: {
    type: String,
    enum: ['lottie', 'gif', 'dactilologia'],
    default: 'dactilologia'
  },
  archivo_asset: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Índice multikey para buscar sinónimos (termino ya tiene su propio índice con index: true).
// Mismos índices que crea database/queries/indices.js.
GlossSchema.index({ variantes: 1 });

// Colección 'glosas' (en español, igual que el resto del modelo de datos)
module.exports = mongoose.model('Gloss', GlossSchema, 'glosas');