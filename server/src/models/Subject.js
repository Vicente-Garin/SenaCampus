const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  room: { type: String, default: 'Sala por definir', trim: true },
  professor: { type: String, default: '', trim: true },
  color: { type: String, default: '#FAD9CF' },
  transcriptionsCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
