require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Gloss = require('../src/models/Gloss');
// La lista de términos vive en database/seed/datos/glosas.js (una sola fuente para ambos seeds)
const { buildCorpus } = require('../../database/seed/datos/glosas');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('Falta MONGO_URI en server/.env (ver server/.env.example)');
    await mongoose.connect(mongoUri);
    console.log('MongoDB conectado para cargar el Diccionario Oficial LSCh (MINEDUC/UMCE).');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};


const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Vaciando colección anterior de glosas...');
    await Gloss.deleteMany({});

    const corpus = buildCorpus();
    console.log(`Corpus oficial preparado: ${corpus.length} términos de LSCh (MINEDUC/UMCE).`);

    console.log('Cargando registros en MongoDB...');
    const result = await Gloss.insertMany(corpus);
    console.log(`Carga completada exitosamente. Total documentos insertados: ${result.length}`);

  const directCount = await Gloss.countDocuments({ tipo_recurso: { $in: ['lottie', 'gif'] } });
    const dactilologyCount = await Gloss.countDocuments({ tipo_recurso: 'dactilologia' });
    console.log(`- Señas núcleo con recurso visual directo: ${directCount}`);
    console.log(`- Señas oficiales con derivación dactilológica: ${dactilologyCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error durante la carga del diccionario:', error);
    process.exit(1);
  }
};


if (require.main === module) {
  seedDatabase();
}