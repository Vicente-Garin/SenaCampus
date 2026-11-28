// Pantallas Acceso y Ajustes
const { usuarios } = require('../datos/colecciones');
const { solicitudInvalida } = require('../utils/errores');
const { PERFIL } = require('../middlewares/autenticar');

const SEDES = ['Osorno', 'Puerto Montt', 'Chiloé', 'Santiago'];
const AJUSTES_INICIALES = { textoGrande: false, subtitulos: true, vibracion: true, velocidadSenas: 1 };

const AJUSTES_PERMITIDOS = ['textoGrande', 'subtitulos', 'vibracion', 'velocidadSenas'];

// GET /api/v1/usuarios/me — perfil del estudiante y registro del último acceso
const obtenerPerfil = async (req, res) => {
  await usuarios().updateOne({ _id: req.usuario._id }, { $currentDate: { ultimoAcceso: true } });
  res.json({ ok: true, data: req.usuario });
};

// PATCH /api/v1/usuarios/me/ajustes — guarda solo los ajustes que llegan
const actualizarAjustes = async (req, res) => {
  const cambios = {};
  for (const clave of AJUSTES_PERMITIDOS) {
    if (req.body?.[clave] !== undefined) cambios[`ajustes.${clave}`] = req.body[clave];
  }
  if (Object.keys(cambios).length === 0) {
    throw solicitudInvalida(`Envía al menos uno de estos ajustes: ${AJUSTES_PERMITIDOS.join(', ')}.`);
  }
  const actualizado = await usuarios().findOneAndUpdate(
    { _id: req.usuario._id },
    { $set: cambios },
    { returnDocument: 'after', projection: PERFIL }
  );
  res.json({ ok: true, data: actualizado });
};

// POST /api/v1/usuarios — crea el perfil de una cuenta nueva de Firebase (pantalla Crear cuenta).
// Solo exige el token (verificarToken): el correo y el UID salen del token, no del cuerpo,
// así nadie puede crear un perfil a nombre de otro correo. Si ya existe, lo devuelve (idempotente).
const crearPerfil = async (req, res) => {
  const { uid, correo } = req.firebase;
  const existente = await usuarios().findOne({ $or: [{ firebaseUid: uid }, { correo }] }, { projection: PERFIL });
  if (existente) {
    if (!existente.firebaseUid || existente.firebaseUid !== uid) {
      await usuarios().updateOne({ _id: existente._id }, { $set: { firebaseUid: uid } });
    }
    return res.json({ ok: true, data: { ...existente, firebaseUid: uid } });
  }

  const nombre = String(req.body?.nombre || '').trim();
  const apellido = String(req.body?.apellido || '').trim();
  const sede = String(req.body?.sede || '').trim();
  const campos = {};
  if (nombre.length < 2) campos.nombre = 'Escribe tu nombre.';
  if (apellido.length < 2) campos.apellido = 'Escribe tu apellido.';
  if (!SEDES.includes(sede)) campos.sede = 'Elige tu sede.';
  if (Object.keys(campos).length) throw solicitudInvalida('Revisa tus datos.', campos);

  const nuevo = {
    firebaseUid: uid,
    nombre,
    apellido,
    correo,
    rol: 'estudiante',
    ...(req.body?.carrera ? { carrera: String(req.body.carrera).trim().slice(0, 100) } : {}),
    sede,
    ajustes: AJUSTES_INICIALES,
    creadoEn: new Date(),
    ultimoAcceso: new Date(),
  };
  // El $jsonSchema de MongoDB valida además el correo institucional (error 121 → 400 por campo)
  const { insertedId } = await usuarios().insertOne(nuevo);
  const { creadoEn, ultimoAcceso, ...perfil } = nuevo;
  res.status(201).json({ ok: true, data: { _id: insertedId, ...perfil } });
};

module.exports = { obtenerPerfil, actualizarAjustes, crearPerfil };
