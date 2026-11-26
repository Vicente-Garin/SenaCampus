// Conexión compartida por todos los scripts de database/.
// Lee las variables del archivo .env de la raíz del repositorio (ver .env.example):
// - MONGO_URI_ATLAS: base en la nube (MongoDB Atlas). Si existe, se usa esta.
// - MONGO_URI: base local en Docker (la del Trabajo 3). Se usa si no hay MONGO_URI_ATLAS.
const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
const { MongoClient } = require('mongodb');

// Las direcciones de Atlas (mongodb+srv://) necesitan una consulta DNS de tipo SRV.
// En algunos Windows el DNS por defecto no se la responde a Node (querySrv ECONNREFUSED),
// así que para Atlas se usan DNS públicos (Google y Cloudflare).
const prepararDnsAtlas = (uri) => {
  if (uri.startsWith('mongodb+srv://')) dns.setServers(['8.8.8.8', '1.1.1.1']);
};

const conectar = async () => {
  const uri = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI;
  if (!uri) {
    console.error('Falta MONGO_URI_ATLAS o MONGO_URI en el archivo .env de la raíz. Copia .env.example como .env y complétalo.');
    process.exit(1);
  }
  prepararDnsAtlas(uri);
  const cliente = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await cliente.connect();
  const db = cliente.db(process.env.MONGO_DB || 'senacampus_db');
  console.log(`[conexión] ${uri.startsWith('mongodb+srv://') ? 'MongoDB Atlas (nube)' : 'MongoDB local (Docker)'} · base "${db.databaseName}"`);
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

module.exports = { conectar, titulo, mostrar, prepararDnsAtlas };
