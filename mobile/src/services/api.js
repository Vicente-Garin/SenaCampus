/**
 * CLIENTE HTTP DEL BACKEND
 * - Dirección del servidor:
 *   1. EXPO_PUBLIC_API_URL en mobile/.env (ej. https://senacampus-api.onrender.com/api), o
 *   2. la misma IP del computador que corre Expo, en el puerto 5000 (desarrollo en la misma red WiFi).
 * - traducirTexto(): POST /v1/traductor/parse → glosas LSCh o letras para deletrear.
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
const pedir = async (ruta, opciones = {}) => {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO_MS);
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
