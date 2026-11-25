// Crea los índices de SeñaCampus y muestra explain() ANTES y DESPUÉS de cada uno (criterio 6).
// Para que la comparación sea real, primero borra el índice (si existía), mide la consulta,
// crea el índice y la vuelve a medir. Se puede ejecutar varias veces.
// Uso: npm run indices   (después de npm run seed)
const { conectar, titulo } = require('../lib/conexion');
const { cleanTokens } = require('../../server/src/utils/textParser');

// Resume el plan ganador: etapas, documentos y claves revisadas, documentos devueltos
const resumirPlan = (explicacion) => {
  const etapas = [];
  const recorrer = (plan) => {
    if (!plan) return;
    etapas.push(plan.indexName ? `${plan.stage}(${plan.indexName})` : plan.stage);
    recorrer(plan.inputStage);
    (plan.inputStages || []).forEach(recorrer);
  };
  const ganador = explicacion.queryPlanner.winningPlan;
  recorrer(ganador.queryPlan || ganador);
  const stats = explicacion.executionStats;
  return {
    plan: etapas.join(' → '),
    docsRevisados: stats.totalDocsExamined,
    clavesRevisadas: stats.totalKeysExamined,
    devueltos: stats.nReturned,
    ms: stats.executionTimeMillis,
  };
};

const borrarSiExiste = async (coleccion, nombre) => {
  const existentes = await coleccion.indexes();
  if (existentes.some((i) => i.name === nombre)) await coleccion.dropIndex(nombre);
};

const main = async () => {
  const { cliente, db } = await conectar();
  const vicente = await db.collection('usuarios').findOne({ correo: 'vicente.garin@alumnos.ulagos.cl' });
  const twm = await db.collection('asignaturas').findOne({ usuarioId: vicente._id, nombre: 'Tecnologías Web y Móviles' });
  const tokens = cleanTokens('Mañana hay prueba en la biblioteca, estudien la clase de hoy');

  const indices = [
    {
      coleccion: 'usuarios',
      nombre: 'correo_unico',
      clave: { correo: 1 },
      opciones: { unique: true },
      motivo: 'Pantalla Acceso: buscar el perfil por correo. Además impide dos cuentas con el mismo correo.',
      consulta: (c) => c.find({ correo: 'vicente.garin@alumnos.ulagos.cl' }),
    },
    {
      coleccion: 'usuarios',
      nombre: 'firebaseUid_unico',
      clave: { firebaseUid: 1 },
      opciones: { unique: true },
      motivo: 'Acceso con Firebase Auth (Avance N°2): buscar el perfil por el UID que entrega Firebase.',
      consulta: (c) => c.find({ firebaseUid: vicente.firebaseUid }),
    },
    {
      coleccion: 'asignaturas',
      nombre: 'usuario_nombre',
      clave: { usuarioId: 1, nombre: 1 },
      opciones: {},
      motivo: 'Pantalla Asignaturas: filtra por usuario y ordena por nombre sin ordenar en memoria.',
      consulta: (c) => c.find({ usuarioId: vicente._id }).sort({ nombre: 1 }),
    },
    {
      coleccion: 'clases',
      nombre: 'asignatura_fecha',
      clave: { asignaturaId: 1, fecha: -1 },
      opciones: {},
      motivo: 'Detalle de asignatura: historial de una asignatura de la clase más nueva a la más antigua. También acelera el $lookup de Asignaturas.',
      consulta: (c) => c.find({ asignaturaId: twm._id }).sort({ fecha: -1 }),
    },
    {
      coleccion: 'clases',
      nombre: 'usuario_fecha',
      clave: { usuarioId: 1, fecha: -1 },
      opciones: {},
      motivo: 'Agregaciones de estadísticas y términos deletreados: el $match por usuario usa este índice.',
      consulta: (c) => c.find({ usuarioId: vicente._id }).sort({ fecha: -1 }),
    },
    {
      coleccion: 'glosas',
      nombre: 'termino_1', // mismo nombre que crea Mongoose en el backend
      clave: { termino: 1 },
      opciones: {},
      motivo: 'Pantalla Traducir: buscar cada palabra en el diccionario de 2.098 términos.',
      consulta: (c) => c.find({ termino: { $in: tokens } }),
    },
    {
      coleccion: 'glosas',
      nombre: 'variantes_1',
      clave: { variantes: 1 }, // índice multikey (un arreglo)
      opciones: {},
      motivo: 'Pantalla Traducir: sinónimos ("estudiante" → GL_ALUMNO). Con el índice "termino_1", el $or usa los dos.',
      consulta: (c) => c.find({ $or: [{ termino: { $in: tokens } }, { variantes: { $in: tokens } }] }),
    },
    {
      coleccion: 'glosas',
      nombre: 'glosa_id_1', // mismo nombre que crea Mongoose (unique: true en Gloss.js)
      clave: { glosa_id: 1 },
      opciones: { unique: true },
      motivo: 'Seed idempotente y reproductor de señas: buscar una glosa por su código; no permite códigos repetidos.',
      consulta: (c) => c.find({ glosa_id: 'GL_PRUEBA' }),
    },
  ];

  try {
    // Índice compuesto antiguo de Mongoose {termino, variantes}: es redundante con termino_1 y variantes_1
    // y además falsearía la medición "antes" del índice termino_1.
    await borrarSiExiste(db.collection("glosas"), "termino_1_variantes_1");

    for (const indice of indices) {
      const coleccion = db.collection(indice.coleccion);
      titulo(`Índice "${indice.nombre}" en ${indice.coleccion} ${JSON.stringify(indice.clave)}${indice.opciones.unique ? ' (único)' : ''}`);
      console.log(`Por qué: ${indice.motivo}`);

      await borrarSiExiste(coleccion, indice.nombre);
      const antes = resumirPlan(await indice.consulta(coleccion).explain('executionStats'));
      await coleccion.createIndex(indice.clave, { name: indice.nombre, ...indice.opciones });
      const despues = resumirPlan(await indice.consulta(coleccion).explain('executionStats'));

      console.table({ ANTES: antes, 'DESPUÉS': despues });
    }

    titulo('Índices finales por colección');
    for (const nombre of ['usuarios', 'asignaturas', 'clases', 'glosas']) {
      const lista = (await db.collection(nombre).indexes()).map((i) => `${i.name}${i.unique ? ' (único)' : ''}`);
      console.log(`- ${nombre}: ${lista.join(', ')}`);
    }
  } finally {
    await cliente.close();
  }
};

main().catch((error) => {
  console.error('Error al crear los índices:', error.message);
  process.exit(1);
});
