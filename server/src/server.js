require('dotenv').config({ quiet: true });
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Primero se conecta a MongoDB y después se abre el puerto,
// así ninguna solicitud llega antes de que la base esté lista.
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor SeñaCampus corriendo en el puerto ${PORT}`);
    if (process.env.AUTH_MODO === 'desarrollo') {
      console.warn('⚠ AUTH_MODO=desarrollo: el usuario se identifica con X-Usuario-Correo. No usar en producción.');
    }
  });
});
