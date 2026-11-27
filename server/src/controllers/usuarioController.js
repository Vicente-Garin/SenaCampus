// Pantallas Acceso y Ajustes
const { usuarios } = require('../datos/colecciones');
const { solicitudInvalida } = require('../utils/errores');
const { PERFIL } = require('../middlewares/autenticar');

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

module.exports = { obtenerPerfil, actualizarAjustes };
