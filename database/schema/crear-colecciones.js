// Crea las colecciones con su validador $jsonSchema (o lo actualiza si ya existen).
// Se puede ejecutar varias veces: si la colección existe, aplica collMod con el esquema nuevo.
// Uso: npm run schema   (desde la carpeta database/)
const { conectar, titulo } = require('../lib/conexion');
const esquemas = require('./esquemas');

const COLECCIONES = ['usuarios', 'asignaturas', 'clases', 'glosas'];

const main = async () => {
  const { cliente, db } = await conectar();
  titulo(`Creando colecciones con validación en la base "${db.databaseName}"`);

  try {
    const existentes = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);

    for (const nombre of COLECCIONES) {
      const opciones = {
        validator: esquemas[nombre],
        validationLevel: 'strict', // valida todas las inserciones y actualizaciones
        validationAction: 'error', // rechaza el documento (no solo advierte)
      };

      if (existentes.includes(nombre)) {
        await db.command({ collMod: nombre, ...opciones });
        console.log(`- ${nombre}: ya existía, validador actualizado`);
      } else {
        await db.createCollection(nombre, opciones);
        console.log(`- ${nombre}: creada con validador $jsonSchema`);
      }
    }
  } finally {
    await cliente.close();
  }
};

main().catch((error) => {
  console.error('Error al crear las colecciones:', error.message);
  process.exit(1);
});
