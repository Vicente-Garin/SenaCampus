// Pantallas Asignaturas, Nueva asignatura y Detalle de asignatura
const { asignaturas, clases, aObjectId } = require('../datos/colecciones');
const { noEncontrado, solicitudInvalida } = require('../utils/errores');

const COLOR_POR_DEFECTO = '#FAD9CF';

// Toma solo los campos permitidos del formulario y quita espacios sobrantes
const limpiarAsignatura = (body = {}, { esNueva }) => {
  const datos = {};
  const texto = (v) => (typeof v === 'string' ? v.trim() : v);
  if (body.nombre !== undefined) datos.nombre = texto(body.nombre);
  if (body.sala !== undefined) datos.sala = texto(body.sala) || 'Por definir';
  if (body.profesor !== undefined) datos.profesor = texto(body.profesor) || 'Profesor/a por definir';
  if (body.color !== undefined) datos.color = texto(body.color);
  if (body.horario !== undefined && body.horario !== null) {
    const { dias, inicio, fin } = body.horario;
    datos.horario = { dias, inicio: texto(inicio), ...(fin && { fin: texto(fin) }) };
  }
  if (esNueva) {
    datos.sala ??= 'Por definir';
    datos.profesor ??= 'Profesor/a por definir';
    datos.color ??= COLOR_POR_DEFECTO;
  }
  return datos;
};

const idDeRuta = (req) => {
  const id = aObjectId(req.params.id);
  if (!id) throw solicitudInvalida('El id de la asignatura no es válido.');
  return id;
};

// GET /api/v1/asignaturas — lista con contador de clases y última clase ($lookup)
const listar = async (req, res) => {
  const lista = await asignaturas().aggregate([
    { $match: { usuarioId: req.usuario._id } },
    {
      $lookup: {
        from: 'clases',
        let: { idAsignatura: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$asignaturaId', '$$idAsignatura'] } } },
          { $group: { _id: null, total: { $sum: 1 }, ultima: { $max: '$fecha' } } },
        ],
        as: 'resumenClases',
      },
    },
    {
      $project: {
        nombre: 1, sala: 1, profesor: 1, horario: 1, color: 1,
        clasesGuardadas: { $ifNull: [{ $first: '$resumenClases.total' }, 0] },
        ultimaClase: { $first: '$resumenClases.ultima' },
      },
    },
    { $sort: { nombre: 1 } },
  ]).toArray();
  res.json({ ok: true, data: lista });
};

// POST /api/v1/asignaturas — Nueva asignatura
const crear = async (req, res) => {
  const datos = limpiarAsignatura(req.body, { esNueva: true });
  const doc = { usuarioId: req.usuario._id, ...datos, creadaEn: new Date() };
  const { insertedId } = await asignaturas().insertOne(doc);
  res.status(201).json({ ok: true, data: { _id: insertedId, ...doc } });
};

// GET /api/v1/asignaturas/:id — detalle e historial (sin fragmentos, de la más nueva a la más antigua)
const detalle = async (req, res) => {
  const id = idDeRuta(req);
  const asignatura = await asignaturas().findOne({ _id: id, usuarioId: req.usuario._id });
  if (!asignatura) throw noEncontrado('La asignatura');
  const historial = await clases()
    .find({ asignaturaId: id }, { projection: { fecha: 1, duracionSegundos: 1, palabras: 1, deletreadas: 1 } })
    .sort({ fecha: -1 })
    .toArray();
  res.json({ ok: true, data: { asignatura, historial } });
};

// PATCH /api/v1/asignaturas/:id — editar sala, profesor, horario, color o nombre
const actualizar = async (req, res) => {
  const id = idDeRuta(req);
  const cambios = limpiarAsignatura(req.body, { esNueva: false });
  if (Object.keys(cambios).length === 0) throw solicitudInvalida('No hay cambios para guardar.');
  const actualizada = await asignaturas().findOneAndUpdate(
    { _id: id, usuarioId: req.usuario._id },
    { $set: cambios },
    { returnDocument: 'after' }
  );
  if (!actualizada) throw noEncontrado('La asignatura');
  // Mantiene al día la copia del nombre y color guardada en sus clases (referencia extendida)
  if (cambios.nombre || cambios.color) {
    await clases().updateMany(
      { asignaturaId: id },
      { $set: { 'asignatura.nombre': actualizada.nombre, 'asignatura.color': actualizada.color } }
    );
  }
  res.json({ ok: true, data: actualizada });
};

// DELETE /api/v1/asignaturas/:id — elimina la asignatura y sus clases (en cascada)
const eliminar = async (req, res) => {
  const id = idDeRuta(req);
  const resultado = await asignaturas().deleteOne({ _id: id, usuarioId: req.usuario._id });
  if (resultado.deletedCount === 0) throw noEncontrado('La asignatura');
  const { deletedCount } = await clases().deleteMany({ asignaturaId: id, usuarioId: req.usuario._id });
  res.json({ ok: true, data: { asignaturasEliminadas: 1, clasesEliminadas: deletedCount } });
};

// GET /api/v1/asignaturas/estadisticas — clases, minutos y palabras por asignatura ($group)
const estadisticas = async (req, res) => {
  const data = await clases().aggregate([
    { $match: { usuarioId: req.usuario._id, estado: 'finalizada' } },
    {
      $group: {
        _id: '$asignaturaId',
        asignatura: { $first: '$asignatura.nombre' },
        clases: { $sum: 1 },
        minutosTraducidos: { $sum: { $round: [{ $divide: ['$duracionSegundos', 60] }, 0] } },
        palabras: { $sum: '$palabras' },
        ultimaClase: { $max: '$fecha' },
      },
    },
    { $sort: { minutosTraducidos: -1 } },
  ]).toArray();
  res.json({ ok: true, data });
};

module.exports = { listar, crear, detalle, actualizar, eliminar, estadisticas };
