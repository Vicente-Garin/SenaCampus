const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('Falta MONGO_URI en server/.env (ver server/.env.example)');

    // MongoDB Atlas (mongodb+srv://) necesita una consulta DNS de tipo SRV que el DNS por
    // defecto de algunos Windows no le responde a Node; para Atlas se usan DNS públicos.
    if (uri.startsWith('mongodb+srv://')) dns.setServers(['8.8.8.8', '1.1.1.1']);

    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`MongoDB conectado exitosamente: ${conn.connection.host} · base "${conn.connection.name}"`);
  } catch (error) {
    console.error(`Error al conectar con MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
