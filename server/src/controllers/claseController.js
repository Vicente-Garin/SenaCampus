// Pantallas Traducir (guardar), Resumen de sesión y Transcripción
const { asignaturas, clases, aObjectId } = require('../datos/colecciones');
const { noEncontrado, solicitudInvalida } = require('../utils/errores');

const idDeRuta = (req) => {
  const id = aObjectId(req.params.id);
  if (!id) throw solicitudInvalida('El id de la clase no es válido.');
  return id;
};

// Convierte un texto de fecha (ISO) en Date; si no es válido deja el valor para que $jsonSchema lo rechace
const aFecha = (valor) => {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : fecha;
};

const contarPalabras = (fragmentos) =>
  fragmentos.reduce((total, f) => total + String(f.texto || '').split(/\s+/).filter(Boolean).length, 0);

// POST /api/v1/clases — "Sí, terminar y guardar" en Traducir
const guardar = async (req, res) => {
  const { asignaturaId, fecha, duracionSegundos, fragmentos = [], deletreadas = [] } = req.body || {};
  const idAsignatura = aObjectId(asignaturaId);
  if (!idAsignatura) throw solicitudInvalida('Elige una asignatura válida.', { asignaturaId: 'Asignatura no válida.' });
  if (!Array.isArray(fragmentos)) throw solicitudInvalida('La transcripción no es válida.', { fragmentos: 'Debe ser una lista.' });

  const asignatura = await asignaturas().findOne({ _id: idAsignatura, usuarioId: req.usuario._id });
  if (!asignatura) throw noEncontrado('La asignatura');

  const doc = {
    asignaturaId: asignatura._id,
    usuarioId: req.usuario._id,
    asignatura: { nombre: asignatura.nombre, color: asignatura.color },
    fecha: fecha ? aFecha(fecha) : new Date(),
    duracionSegundos: Number.isFinite(duracionSegundos) ? Math.round(duracionSegundos) : duracionSegundos,
    palabras: contarPalabras(fragmentos),
    estado: 'finalizada',
    fragmentos: fragmentos.map((f) => ({
      marcaTiempo: aFecha(f?.marcaTiempo),
      texto: typeof f?.texto === 'string' ? f.texto.trim() : f?.texto,
      claves: Array.isArray(f?.claves) ? f.claves : [],
      glosas: Array.isArray(f?.glosas) ? f.glosas : [],
    })),
    deletreadas: Array.isArray(deletreadas) ? [...new Set(deletreadas)] : deletreadas,
  };
  const { insertedId } = await clases().insertOne(doc);
  res.status(201).json({ ok: true, data: { _id: insertedId, ...doc } });
};

// GET /api/v1/clases/:id — clase completa con su transcripción (pantalla Transcripción)
// GET /api/v1/clases/:id?vista=resumen — solo los datos del Resumen de sesión
const obtener = async (req, res) => {
  const id = idDeRuta(req);
  const projection = req.query.vista === 'resumen'
    ? { asignatura: 1, fecha: 1, duracionSegundos: 1, palabras: 1, deletreadas: 1 }
    : undefined;
  const clase = await clases().findOne({ _id: id, usuarioId: req.usuario._id }, { projection });
  if (!clase) throw noEncontrado('La clase');
  res.json({ ok: true, data: clase });
};

// DELETE /api/v1/clases/:id — eliminar una transcripción
const eliminar = async (req, res) => {
  const id = idDeRuta(req);
  const { deletedCount } = await clases().deleteOne({ _id: id, usuarioId: req.usuario._id });
  if (deletedCount === 0) throw noEncontrado('La clase');
  res.json({ ok: true, data: { clasesEliminadas: 1 } });
};

// GET /api/v1/clases/deletreadas — términos sin seña más repetidos ($unwind + $group)
const masDeletreadas = async (req, res) => {
  const limite = Math.min(Number(req.query.limite) || 10, 50);
  const data = await clases().aggregate([
    { $match: { usuarioId: req.usuario._id } },
    { $unwind: '$deletreadas' },
    { $group: { _id: '$deletreadas', veces: { $sum: 1 }, asignaturas: { $addToSet: '$asignatura.nombre' } } },
    { $sort: { veces: -1, _id: 1 } },
    { $limit: limite },
  ]).toArray();
  res.json({ ok: true, data });
};

module.exports = { guardar, obtener, eliminar, masDeletreadas };
