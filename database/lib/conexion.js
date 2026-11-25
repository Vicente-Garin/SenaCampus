// Conexión compartida por todos los scripts de database/.
// Lee MONGO_URI y MONGO_DB del archivo .env de la raíz del repositorio (ver .env.example).
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
const { MongoClient } = require('mongodb');

const conectar = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Falta MONGO_URI en el archivo .env de la raíz. Copia .env.example como .env y complétalo.');
    process.exit(1);
  }
  const cliente = new MongoClient(uri);
  await cliente.connect();
  const db = cliente.db(process.env.MONGO_DB || 'senacampus_db');
  return { cliente, db };
};

// Imprime un título de sección para que la salida de la terminal sirva como captura.
const titulo = (texto) => {
  console.log('\n' + '='.repeat(70));
  console.log(texto);
  console.log('='.repeat(70));
};

// Muestra documentos de forma legible (fechas en ISO, ObjectId como texto).
const mostrar = (valor) => console.log(JSON.stringify(valor, null, 2));

module.exports = { conectar, titulo, mostrar };
