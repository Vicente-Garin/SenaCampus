// Aplicación Express (separada de server.js para poder probarla sin abrir un puerto)
const express = require('express');
const cors = require('cors');
const translationRoutes = require('./routes/translationRoutes');
const apiRoutes = require('./routes/apiRoutes');
const vozRoutes = require('./routes/vozRoutes');
const { manejarErrores, rutaNoEncontrada } = require('./middlewares/errores');

const app = express();

// En Render la app está detrás de un proxy: así req.ip es la IP real del teléfono
// (la usa el límite de lecturas de la voz) y no la del proxy.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Comprobación de salud
// (Render la usa para saber si el servicio está vivo y la app para "despertarlo")
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SeñaCampus Backend' });
});

// Traductor (público: solo lee el diccionario)
app.use('/api/v1/traductor', translationRoutes);

// Voz natural para leer los mensajes del Diálogo (la clave de ElevenLabs queda en el servidor)
app.use('/api/v1/voz', vozRoutes);

// Datos del estudiante (requieren identificar al usuario)
app.use('/api/v1', apiRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
