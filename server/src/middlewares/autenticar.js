// Identifica al estudiante que hace la solicitud y deja su perfil en req.usuario.
//
// - Producción (Fase 2): la app envía "Authorization: Bearer <idToken de Firebase>",
//   se verifica con firebase-admin y se busca el usuario por su firebaseUid.
// - Desarrollo (AUTH_MODO=desarrollo en server/.env): mientras se configura Firebase,
//   la app o Postman envían el correo en el encabezado "X-Usuario-Correo".
//   Este modo NUNCA debe activarse en el servidor publicado.
const { usuarios } = require('../datos/colecciones');
const { ErrorApi } = require('../utils/errores');

const PERFIL = { firebaseUid: 1, nombre: 1, apellido: 1, correo: 1, rol: 1, carrera: 1, sede: 1, ajustes: 1 };

const autenticar = async (req, res, next) => {
  if (process.env.AUTH_MODO === 'desarrollo') {
    const correo = (req.get('X-Usuario-Correo') || '').trim().toLowerCase();
    if (!correo) throw new ErrorApi(401, 'Falta el encabezado X-Usuario-Correo (modo desarrollo).');
    const usuario = await usuarios().findOne({ correo }, { projection: PERFIL });
    if (!usuario) throw new ErrorApi(401, 'No existe un usuario con ese correo.');
    req.usuario = usuario;
    return next();
  }

  // Fase 2: verificación del token de Firebase Authentication
  throw new ErrorApi(501, 'El inicio de sesión con Firebase aún no está configurado en el servidor.');
};

module.exports = { autenticar, PERFIL };
