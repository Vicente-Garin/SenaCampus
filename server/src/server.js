require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const translationRoutes = require('./routes/translationRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectDB();

// Rutas de la API
app.use('/api/v1/traductor', translationRoutes);

// Comprobación de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SeñaCampus Backend' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor SeñaCampus corriendo en el puerto ${PORT}`);
});