// Voz natural en la nube (ElevenLabs) para leer en voz alta los mensajes del Diálogo.
//
// - La clave vive SOLO en el servidor (ELEVENLABS_API_KEY en server/.env): la app nunca la ve.
// - Caché en memoria: la misma frase (ej. "Disculpe, ¿me puede ayudar?") se genera una sola vez
//   y no vuelve a gastar créditos.
// - Modelo "flash": responde rápido (importante en una conversación) y gasta menos créditos.
const crypto = require('crypto');
const { ErrorApi } = require('../utils/errores');

const URL_BASE = 'https://api.elevenlabs.io/v1/text-to-speech';
const MODELO = process.env.ELEVENLABS_MODELO || 'eleven_flash_v2_5';
// Voz por defecto de ElevenLabs (habla español con el modelo multilingüe). Se puede cambiar en .env
const VOZ_POR_DEFECTO = 'EXAVITQu4vr4xnSDxMaL';
const MAX_EN_CACHE = 150;
const TIEMPO_MAXIMO_MS = 10000;

const cache = new Map(); // id -> Buffer mp3 (el Map recuerda el orden: el primero es el más antiguo)

const configurada = () => !!process.env.ELEVENLABS_API_KEY;

const idPara = (texto, voz) =>
  crypto.createHash('sha256').update(`${MODELO}|${voz}|${texto}`).digest('hex').slice(0, 32);

const guardarEnCache = (id, audio) => {
  cache.set(id, audio);
  if (cache.size > MAX_EN_CACHE) cache.delete(cache.keys().next().value);
};

// Devuelve el id del audio (lo genera si no estaba en caché)
async function sintetizar(texto) {
  if (!configurada()) throw new ErrorApi(503, 'La voz en la nube no está configurada en el servidor.');

  const voz = process.env.ELEVENLABS_VOZ_ID || VOZ_POR_DEFECTO;
  const id = idPara(texto, voz);
  if (cache.has(id)) return id;

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO_MS);
  try {
    const respuesta = await fetch(`${URL_BASE}/${voz}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: texto,
        model_id: MODELO,
        language_code: 'es',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
      signal: control.signal,
    });

    if (!respuesta.ok) {
      // No se reenvía el detalle del proveedor a la app (podría incluir datos de la cuenta)
      const detalle = await respuesta.text().catch(() => '');
      console.warn(`[voz] ElevenLabs respondió ${respuesta.status}: ${detalle.slice(0, 200)}`);
      const mensaje = respuesta.status === 401
        ? 'La clave de la voz en la nube no es válida.'
        : respuesta.status === 429 || respuesta.status === 402
          ? 'Se acabaron los créditos de voz de este mes.'
          : 'El servicio de voz no respondió bien.';
      throw new ErrorApi(502, mensaje);
    }

    guardarEnCache(id, Buffer.from(await respuesta.arrayBuffer()));
    return id;
  } catch (error) {
    if (error.name === 'AbortError') throw new ErrorApi(504, 'El servicio de voz tardó demasiado.');
    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}

const obtenerAudio = (id) => cache.get(id);

module.exports = { sintetizar, obtenerAudio, configurada };
