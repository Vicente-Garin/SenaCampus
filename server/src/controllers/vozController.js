// Voz natural para el Diálogo:
// 1. POST /api/v1/voz { texto }  → genera (o reutiliza) el audio y devuelve su dirección.
// 2. GET  /api/v1/voz/:id.mp3    → entrega el mp3 para que el reproductor de la app lo toque.
// Se separa en dos pasos porque el reproductor de audio del teléfono solo sabe abrir una URL.
const { sintetizar, obtenerAudio, configurada } = require('../services/vozNube');
const { solicitudInvalida, ErrorApi } = require('../utils/errores');

const MAX_CARACTERES = 400;

// Límite simple por dirección IP para que nadie gaste los créditos de la cuenta
const VENTANA_MS = 60 * 1000;
const MAX_POR_VENTANA = 30;
const pedidosPorIp = new Map();

const revisarLimite = (ip) => {
  const ahora = Date.now();
  const recientes = (pedidosPorIp.get(ip) || []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= MAX_POR_VENTANA) throw new ErrorApi(429, 'Demasiadas lecturas seguidas. Espera un momento.');
  recientes.push(ahora);
  pedidosPorIp.set(ip, recientes);
};

const estado = (req, res) => {
  res.json({ ok: true, data: { disponible: configurada() } });
};

const crear = async (req, res) => {
  const texto = typeof req.body?.texto === 'string' ? req.body.texto.trim() : '';
  if (!texto) throw solicitudInvalida('Falta el texto que se va a leer.', { texto: 'Obligatorio.' });
  if (texto.length > MAX_CARACTERES) {
    throw solicitudInvalida(`El texto es muy largo (máximo ${MAX_CARACTERES} caracteres).`, { texto: 'Muy largo.' });
  }
  revisarLimite(req.ip);

  const id = await sintetizar(texto);
  res.status(201).json({ ok: true, data: { id, ruta: `/v1/voz/${id}.mp3` } });
};

const audio = (req, res) => {
  const id = String(req.params.archivo || '').replace(/\.mp3$/, '');
  const mp3 = obtenerAudio(id);
  if (!mp3) throw new ErrorApi(404, 'El audio ya no está disponible. Vuelve a pedirlo.');
  res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': mp3.length, 'Cache-Control': 'private, max-age=3600' });
  res.send(mp3);
};

module.exports = { estado, crear, audio };
