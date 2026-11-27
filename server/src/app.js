// Aplicación Express (separada de server.js para poder probarla sin abrir un puerto)
const express = require('express');
const cors = require('cors');
const translationRoutes = require('./routes/translationRoutes');
const apiRoutes = require('./routes/apiRoutes');
const { manejarErrores, rutaNoEncontrada } = require('./middlewares/errores');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Comprobación de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SeñaCampus Backend' });
});

// Traductor (público: solo lee el diccionario)
app.use('/api/v1/traductor', translationRoutes);

// Datos del estudiante (requieren identificar al usuario)
app.use('/api/v1', apiRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
