/**
 * CLIENTE HTTP DEL BACKEND
 * - Dirección del servidor:
 *   1. EXPO_PUBLIC_API_URL en mobile/.env (ej. https://senacampus-api.onrender.com/api), o
 *   2. la misma IP del computador que corre Expo, en el puerto 5000 (desarrollo en la misma red WiFi).
 * - traducirTexto(): POST /v1/traductor/parse → glosas LSCh o letras para deletrear.
 * - pedirVozNube(): POST /v1/voz → dirección del mp3 con voz natural para leer un mensaje.
 * - despertarServidor(): en Render (plan gratis) el servidor se duerme; se llama al abrir la app.
 */
import Constants from 'expo-constants';

const ipDelComputador = () => {
  // hostUri llega como "192.168.1.20:8081" cuando la app se abre desde Expo
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:5000/api` : 'http://localhost:5000/api';
};

export const API_URL = process.env.EXPO_PUBLIC_API_URL || ipDelComputador();

const TIEMPO_MAXIMO_MS = 8000;

// fetch con tiempo máximo: si el servidor no responde, la app no se queda esperando
const pedir = async (ruta, opciones = {}, tiempoMaximo = TIEMPO_MAXIMO_MS) => {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), tiempoMaximo);
  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...opciones.headers },
      signal: control.signal,
    });
    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      const error = new Error(json.error || `Error del servidor (${respuesta.status})`);
      error.estado = respuesta.status;
      error.campos = json.campos;
      throw error;
    }
    return json;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('El servidor no respondió a tiempo.');
    throw error;
  } finally {
    clearTimeout(temporizador);
  }
};

/**
 * Traduce una frase a glosas LSCh.
 * Devuelve [{ id, termino, tipo: 'lottie' | 'gif' | 'dactilologia', asset, deletreo }]
 */
export const traducirTexto = async (texto, contexto = 'academico') => {
  const json = await pedir('/v1/traductor/parse', {
    method: 'POST',
    body: JSON.stringify({ texto, contexto }),
  });
  return json.glosas || [];
};

// Nombre anterior, se mantiene por compatibilidad
export const parseTranscript = (texto, contexto) => traducirTexto(texto, contexto);

/**
 * Pide al servidor la voz natural (ElevenLabs) de un texto.
 * Devuelve la URL del mp3 para el reproductor. Tiempo máximo corto: si tarda, la app
 * usa la voz del teléfono para no dejar a la otra persona esperando.
 */
export const pedirVozNube = async (texto) => {
  const json = await pedir('/v1/voz', { method: 'POST', body: JSON.stringify({ texto }) }, 5000);
  return `${API_URL}${json.data.ruta}`;
};

/**
 * Render (plan gratis) apaga el servidor tras 15 minutos sin uso y tarda ~1 minuto en volver.
 * Se llama al abrir la app: mientras el estudiante elige su asignatura, el servidor ya despierta.
 * No lanza errores: si falla, cada pantalla usa su respaldo (deletreo local, voz del teléfono).
 */
export const despertarServidor = async () => {
  try {
    await pedir('/health', {}, 70000);
    return true;
  } catch {
    return false;
  }
};
