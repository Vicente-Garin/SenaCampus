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

// Índice para búsquedas rápidas por término o variantes
GlossSchema.index({ termino: 1, variantes: 1 });

module.exports = mongoose.model('Gloss', GlossSchema);