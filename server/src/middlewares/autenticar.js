// Identifica al estudiante que hace la solicitud y deja su perfil en req.usuario.
//
// 1. Firebase (producción y desarrollo): la app envía "Authorization: Bearer <idToken>".
//    Se verifica con firebase-admin (firma, vencimiento y proyecto) y se busca al usuario
//    por su firebaseUid. La primera vez que entra una cuenta que ya existía en la base
//    (por ejemplo los usuarios del seed), se une por correo y se guarda su firebaseUid.
// 2. Desarrollo (AUTH_MODO=desarrollo en server/.env): Postman y el script de pruebas pueden
//    enviar el correo en "X-Usuario-Correo". Este modo NUNCA debe activarse en Render.
//
// verificarToken: solo comprueba la cuenta de Firebase (lo usa "crear perfil", cuando aún no
// existe el usuario en MongoDB). autenticar: además exige el perfil.
const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { usuarios } = require('../datos/colecciones');
const { ErrorApi } = require('../utils/errores');

const PERFIL = { firebaseUid: 1, nombre: 1, apellido: 1, correo: 1, rol: 1, carrera: 1, sede: 1, ajustes: 1 };

// Para verificar tokens basta el id del proyecto: firebase-admin descarga las llaves públicas
// de Google. No se necesita una cuenta de servicio (nada secreto que guardar).
let firebaseListo = false;
const iniciarFirebase = () => {
  if (firebaseListo) return true;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) return false;
  if (!getApps().length) initializeApp({ projectId });
  firebaseListo = true;
  return true;
};

// Lee y verifica el token. Deja en req.firebase { uid, correo }.
const verificarToken = async (req, res, next) => {
  const encabezado = req.get('Authorization') || '';
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7).trim() : '';
  if (!token) throw new ErrorApi(401, 'Inicia sesión para continuar.');
  if (!iniciarFirebase()) throw new ErrorApi(500, 'Falta FIREBASE_PROJECT_ID en la configuración del servidor.');

  let datos;
  try {
    datos = await getAuth().verifyIdToken(token);
  } catch (error) {
    const vencido = error.code === 'auth/id-token-expired';
    throw new ErrorApi(401, vencido ? 'Tu sesión venció. Vuelve a iniciar sesión.' : 'La sesión no es válida. Vuelve a iniciar sesión.');
  }
  req.firebase = { uid: datos.uid, correo: (datos.email || '').toLowerCase() };
  return next();
};

const autenticar = async (req, res, next) => {
  const tieneToken = (req.get('Authorization') || '').startsWith('Bearer ');

  // Modo desarrollo (solo sin token): identificación por correo en un encabezado
  if (!tieneToken && process.env.AUTH_MODO === 'desarrollo') {
    const correo = (req.get('X-Usuario-Correo') || '').trim().toLowerCase();
    if (!correo) throw new ErrorApi(401, 'Falta el encabezado X-Usuario-Correo (modo desarrollo).');
    const usuario = await usuarios().findOne({ correo }, { projection: PERFIL });
    if (!usuario) throw new ErrorApi(401, 'No existe un usuario con ese correo.');
    req.usuario = usuario;
    return next();
  }

  // Firebase: primero se verifica el token…
  await verificarToken(req, res, () => {});
  const { uid, correo } = req.firebase;

  // …y luego se busca el perfil por UID; si no está, se une por correo (cuenta creada antes en la base)
  let usuario = await usuarios().findOne({ firebaseUid: uid }, { projection: PERFIL });
  if (!usuario && correo) {
    usuario = await usuarios().findOneAndUpdate(
      { correo },
      { $set: { firebaseUid: uid } },
      { returnDocument: 'after', projection: PERFIL }
    );
  }
  if (!usuario) {
    throw new ErrorApi(404, 'Tu cuenta aún no tiene perfil en SeñaCampus. Completa tus datos.', { perfil: 'falta' });
  }
  req.usuario = usuario;
  return next();
};

module.exports = { autenticar, verificarToken, PERFIL };
