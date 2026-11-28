/**
 * FIREBASE AUTHENTICATION (inicio de sesión con correo y contraseña)
 * - La configuración viene de mobile/.env (EXPO_PUBLIC_FIREBASE_*). No es secreta: Firebase la
 *   diseña para ir dentro de la app; la seguridad está en las reglas del proyecto y en el servidor.
 * - La sesión se guarda en el teléfono (AsyncStorage): al volver a abrir la app no hay que
 *   iniciar sesión de nuevo.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, inMemoryPersistence } from 'firebase/auth';

const configuracion = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigurado = !!(configuracion.apiKey && configuracion.projectId && configuracion.appId);

// AsyncStorage es un módulo nativo: existe en la app instalada nueva. Si falta (app vieja),
// la sesión dura mientras la app esté abierta, pero todo lo demás funciona.
function elegirPersistencia() {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return getReactNativePersistence(AsyncStorage);
  } catch {
    return inMemoryPersistence;
  }
}

function crearAuth() {
  if (!firebaseConfigurado) return null;
  const yaIniciada = getApps().length > 0;
  const app = yaIniciada ? getApp() : initializeApp(configuracion);
  // initializeAuth solo se puede llamar una vez (al recargar con Metro, la app ya existe)
  if (yaIniciada) return getAuth(app);
  const auth = initializeAuth(app, { persistence: elegirPersistencia() });
  auth.languageCode = 'es'; // correos de Firebase (recuperar contraseña) en español
  return auth;
}

export const auth = crearAuth();

// Mensajes de Firebase traducidos para el estudiante
const MENSAJES = {
  'auth/invalid-email': 'El correo no es válido.',
  'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
  'auth/wrong-password': 'El correo o la contraseña no son correctos.',
  'auth/user-not-found': 'No hay una cuenta con ese correo. Crea una cuenta.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Inicia sesión.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
  'auth/network-request-failed': 'Sin conexión a internet. Revisa tu conexión.',
  'auth/missing-password': 'Escribe tu contraseña.',
};

export const mensajeFirebase = (error) =>
  MENSAJES[error?.code] || error?.message || 'No se pudo completar. Intenta de nuevo.';
