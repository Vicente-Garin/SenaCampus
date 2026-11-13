const Subject = require('../models/Subject');

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: subjects });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error al obtener asignaturas' });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { title, room, professor, color } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ ok: false, error: 'El nombre de la asignatura es obligatorio' });
    }
    const newSubject = await Subject.create({
      title: title.trim(),
      room: room?.trim() || 'Sala por definir',
      professor: professor?.trim() || '',
      color: color || '#FAD9CF',
    });
    res.status(201).json({ ok: true, data: newSubject });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error al crear la asignatura' });
  }
};
