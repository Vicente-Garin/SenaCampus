// Consultas de SeñaCampus agrupadas por la pantalla de la app que las usa.
// Cada función es la consulta que en el Avance N°2 ejecutará la API Express para esa pantalla.
// El script corre un recorrido completo (leer → crear → actualizar → eliminar) y deja la base
// igual que estaba, así que se puede repetir sin acumular datos.
// Uso: npm run consultas   (después de npm run seed)
const { ObjectId } = require('mongodb');
const { conectar, titulo, mostrar } = require('../lib/conexion');
const { cleanTokens } = require('../../server/src/utils/textParser');

const CORREO_DEMO = 'vicente.garin@alumnos.ulagos.cl';

// ---------------------------------------------------------------------------
// Pantalla 1 · Acceso (app/index.jsx)
// ---------------------------------------------------------------------------
// R: busca el perfil por correo institucional (tras iniciar sesión con Firebase Auth,
//    en el Avance N°2 se buscará por firebaseUid, que también tiene índice único).
const buscarUsuarioPorCorreo = (db, correo) =>
  db.collection('usuarios').findOne(
    { correo },
    { projection: { nombre: 1, apellido: 1, correo: 1, firebaseUid: 1, ajustes: 1 } }
  );

// U: registra la hora del último acceso
const registrarAcceso = (db, usuarioId) =>
  db.collection('usuarios').updateOne({ _id: usuarioId }, { $currentDate: { ultimoAcceso: true } });

// ---------------------------------------------------------------------------
// Pantalla 2 · Asignaturas (app/(tabs)/index.jsx)
// ---------------------------------------------------------------------------
// R + agregación $lookup: lista las asignaturas del usuario con el contador de clases
// guardadas y la fecha de la última, ordenadas por nombre.
const listarAsignaturas = (db, usuarioId) =>
  db.collection('asignaturas').aggregate([
    { $match: { usuarioId } },
    {
      $lookup: {
        from: 'clases',
        let: { idAsignatura: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$asignaturaId', '$$idAsignatura'] } } },
          { $group: { _id: null, total: { $sum: 1 }, ultima: { $max: '$fecha' } } },
        ],
        as: 'resumenClases',
      },
    },
    {
      $project: {
        nombre: 1,
        sala: 1,
        profesor: 1,
        horario: 1,
        color: 1,
        clasesGuardadas: { $ifNull: [{ $first: '$resumenClases.total' }, 0] },
        ultimaClase: { $first: '$resumenClases.ultima' },
      },
    },
    { $sort: { nombre: 1 } },
  ]).toArray();

// ---------------------------------------------------------------------------
// Pantalla 3 · Nueva asignatura (app/nueva-asignatura.jsx)
// ---------------------------------------------------------------------------
// C: crea la asignatura (el validador $jsonSchema rechaza si falta el nombre, etc.)
const crearAsignatura = (db, usuarioId, datos) =>
  db.collection('asignaturas').insertOne({ usuarioId, ...datos, creadaEn: new Date() });

// U: editar sala, profesor u horario (botón "Editar" del Detalle, Avance N°2)
const actualizarAsignatura = (db, asignaturaId, usuarioId, cambios) =>
  db.collection('asignaturas').findOneAndUpdate(
    { _id: asignaturaId, usuarioId }, // el usuarioId evita editar asignaturas de otra persona
    { $set: cambios },
    { returnDocument: 'after' }
  );

// ---------------------------------------------------------------------------
// Pantalla 4 · Detalle de asignatura (app/asignatura/[id].jsx)
// ---------------------------------------------------------------------------
// R por id + historial: la asignatura y sus clases, de la más reciente a la más antigua.
// No trae los fragmentos (son lo más pesado y esta pantalla no los muestra).
const detalleAsignatura = async (db, asignaturaId) => {
  const asignatura = await db.collection('asignaturas').findOne({ _id: asignaturaId });
  const historial = await db.collection('clases')
    .find({ asignaturaId }, { projection: { fecha: 1, duracionSegundos: 1, palabras: 1, deletreadas: 1 } })
    .sort({ fecha: -1 })
    .toArray();
  return { asignatura, historial };
};

// ---------------------------------------------------------------------------
// Pantalla 5 · Traducir (app/(tabs)/traducir.jsx)
// ---------------------------------------------------------------------------
// R: busca en el diccionario las glosas de las palabras dichas por el docente
//    (la misma búsqueda que hace POST /api/v1/traductor/parse)
const buscarGlosas = (db, texto) => {
  const tokens = cleanTokens(texto);
  return db.collection('glosas')
    .find(
      { $or: [{ termino: { $in: tokens } }, { variantes: { $in: tokens } }] },
      { projection: { _id: 0, glosa_id: 1, termino: 1, tipo_recurso: 1, archivo_asset: 1 } }
    )
    .sort({ termino: 1 })
    .toArray();
};

// C: "Sí, terminar y guardar" → guarda la clase con su transcripción embebida
const guardarClase = (db, { usuarioId, asignatura, fecha, duracionSegundos, fragmentos, deletreadas }) =>
  db.collection('clases').insertOne({
    asignaturaId: asignatura._id,
    usuarioId,
    asignatura: { nombre: asignatura.nombre, color: asignatura.color },
    fecha,
    duracionSegundos,
    palabras: fragmentos.reduce((n, f) => n + f.texto.split(/\s+/).filter(Boolean).length, 0),
    estado: 'finalizada',
    fragmentos,
    deletreadas,
  });

// ---------------------------------------------------------------------------
// Pantalla 6 · Resumen de sesión (app/resumen.jsx)
// ---------------------------------------------------------------------------
// R por id: solo los datos del resumen (duración, palabras y términos deletreados)
const resumenClase = (db, claseId) =>
  db.collection('clases').findOne(
    { _id: claseId },
    { projection: { asignatura: 1, fecha: 1, duracionSegundos: 1, palabras: 1, deletreadas: 1 } }
  );

// ---------------------------------------------------------------------------
// Pantalla 7 · Transcripción de una clase (app/clase/[id].jsx)
// ---------------------------------------------------------------------------
// R por id: la clase completa con sus fragmentos (una sola lectura, sin joins)
const transcripcionClase = (db, claseId) => db.collection('clases').findOne({ _id: claseId });

// D: "Eliminar transcripción" (solo si es del usuario)
const eliminarClase = (db, claseId, usuarioId) =>
  db.collection('clases').deleteOne({ _id: claseId, usuarioId });

// ---------------------------------------------------------------------------
// Pantalla 8 · Ajustes (app/ajustes.jsx)
// ---------------------------------------------------------------------------
// U: guarda los interruptores y la velocidad de las señas (subdocumento embebido)
const guardarAjustes = (db, usuarioId, ajustes) =>
  db.collection('usuarios').findOneAndUpdate(
    { _id: usuarioId },
    { $set: Object.fromEntries(Object.entries(ajustes).map(([k, v]) => [`ajustes.${k}`, v])) },
    { returnDocument: 'after', projection: { nombre: 1, ajustes: 1 } }
  );

// ---------------------------------------------------------------------------
// Agregaciones con $group
// ---------------------------------------------------------------------------
// Estadísticas por asignatura (encabezado del Detalle y de Asignaturas):
// cuántas clases, cuántos minutos y cuántas palabras se tradujeron.
const estadisticasPorAsignatura = (db, usuarioId) =>
  db.collection('clases').aggregate([
    { $match: { usuarioId, estado: 'finalizada' } },
    {
      $group: {
        _id: '$asignaturaId',
        asignatura: { $first: '$asignatura.nombre' },
        clases: { $sum: 1 },
        minutosTraducidos: { $sum: { $round: [{ $divide: ['$duracionSegundos', 60] }, 0] } },
        palabras: { $sum: '$palabras' },
        ultimaClase: { $max: '$fecha' },
      },
    },
    { $sort: { minutosTraducidos: -1 } },
  ]).toArray();

// Términos más deletreados (Resumen): palabras sin seña en el diccionario,
// sirve para decidir qué señas grabar primero.
const terminosMasDeletreados = (db, usuarioId, limite = 8) =>
  db.collection('clases').aggregate([
    { $match: { usuarioId } },
    { $unwind: '$deletreadas' },
    { $group: { _id: '$deletreadas', veces: { $sum: 1 }, asignaturas: { $addToSet: '$asignatura.nombre' } } },
    { $sort: { veces: -1, _id: 1 } },
    { $limit: limite },
  ]).toArray();

// D en cascada: eliminar una asignatura borra también sus clases
const eliminarAsignatura = async (db, asignaturaId, usuarioId) => {
  const clases = await db.collection('clases').deleteMany({ asignaturaId, usuarioId });
  const asignatura = await db.collection('asignaturas').deleteOne({ _id: asignaturaId, usuarioId });
  return { asignaturasEliminadas: asignatura.deletedCount, clasesEliminadas: clases.deletedCount };
};

// ===========================================================================
// Recorrido de demostración (la salida de cada bloque es la captura del informe)
// ===========================================================================
const main = async () => {
  const { cliente, db } = await conectar();
  try {
    const usuario = await buscarUsuarioPorCorreo(db, CORREO_DEMO);
    // Si una ejecución anterior se cortó a medias, borra la asignatura de prueba que haya quedado
    const restos = await db.collection('asignaturas').find({ usuarioId: usuario._id, nombre: 'Taller de Integración' }).toArray();
    for (const resto of restos) await eliminarAsignatura(db, resto._id, usuario._id);

    titulo('P1 · Acceso — R: buscar usuario por correo institucional');
    mostrar(usuario);
    titulo('P1 · Acceso — U: registrar último acceso');
    mostrar(await registrarAcceso(db, usuario._id));

    titulo('P2 · Asignaturas — R + $lookup: asignaturas con contador de clases (orden por nombre)');
    const lista = await listarAsignaturas(db, usuario._id);
    mostrar(lista);

    titulo('P4 · Detalle de asignatura — R por id + historial ordenado por fecha (desc)');
    const twm = lista.find((a) => a.nombre === 'Tecnologías Web y Móviles');
    const { asignatura, historial } = await detalleAsignatura(db, twm._id);
    mostrar({ asignatura, clasesEnHistorial: historial.length, historial: historial.slice(0, 3) });

    titulo('P7 · Transcripción — R por id: clase completa con fragmentos embebidos');
    mostrar(await transcripcionClase(db, historial[0]._id));

    titulo('P3 · Nueva asignatura — C: insertar asignatura');
    const nueva = await crearAsignatura(db, usuario._id, {
      nombre: 'Taller de Integración',
      sala: 'Por definir',
      profesor: 'Prof. Ximena Cárdenas',
      horario: { dias: ['viernes'], inicio: '15:00', fin: '16:20' },
      color: '#E8D9F2',
    });
    mostrar(nueva);

    titulo('P3 · Detalle (Editar) — U: actualizar sala de la asignatura nueva');
    const editada = await actualizarAsignatura(db, nueva.insertedId, usuario._id, { sala: 'C-201' });
    mostrar(editada);

    titulo('P5 · Traducir — R: glosas del diccionario para una frase del docente');
    const frase = 'Mañana hay prueba en la biblioteca, estudien la clase de hoy';
    console.log(`Frase: "${frase}"`);
    mostrar(await buscarGlosas(db, frase));

    titulo('P5 · Traducir — C: "Sí, terminar y guardar" inserta la clase');
    const inicio = new Date('2026-11-27T15:00:00-03:00');
    const guardada = await guardarClase(db, {
      usuarioId: usuario._id,
      asignatura: editada,
      fecha: inicio,
      duracionSegundos: 4500,
      fragmentos: [
        { marcaTiempo: new Date(inicio.getTime() + 10 * 60000), texto: 'Hoy presentan el avance del proyecto integrado.', claves: ['avance'], glosas: ['GL_HOY', 'GL_PRESENTAN', 'GL_AVANCE', 'GL_PROYECTO', 'GL_INTEGRADO'] },
        { marcaTiempo: new Date(inicio.getTime() + 40 * 60000), texto: 'Cada grupo tiene diez minutos para mostrar su prototipo.', claves: ['prototipo'], glosas: ['GL_GRUPO', 'GL_DIEZ', 'GL_MINUTO', 'GL_MOSTRAR', 'GL_PROTOTIPO'] },
      ],
      deletreadas: ['prototipo', 'integrado'],
    });
    mostrar(guardada);

    titulo('P6 · Resumen de sesión — R por id: datos del resumen de la clase recién guardada');
    mostrar(await resumenClase(db, guardada.insertedId));

    titulo('P8 · Ajustes — U: activar texto grande y velocidad 0.75x');
    mostrar(await guardarAjustes(db, usuario._id, { textoGrande: true, velocidadSenas: 0.75 }));
    // se dejan como estaban para que la demo sea repetible
    await guardarAjustes(db, usuario._id, { textoGrande: false, velocidadSenas: 1 });

    titulo('Agregación $match + $group — estadísticas por asignatura (orden por minutos)');
    mostrar(await estadisticasPorAsignatura(db, usuario._id));

    titulo('Agregación $unwind + $group — términos más deletreados (sin seña en el diccionario)');
    mostrar(await terminosMasDeletreados(db, usuario._id));

    titulo('P7 · Transcripción — D: eliminar la clase de prueba');
    mostrar(await eliminarClase(db, guardada.insertedId, usuario._id));

    titulo('P4 · Detalle — D en cascada: eliminar la asignatura de prueba y sus clases');
    mostrar(await eliminarAsignatura(db, nueva.insertedId, usuario._id));
  } finally {
    await cliente.close();
  }
};

if (require.main === module) {
  main().catch((error) => {
    console.error('Error al ejecutar las consultas:', error.message);
    if (error.errInfo) console.dir(error.errInfo, { depth: null });
    process.exit(1);
  });
}

module.exports = {
  buscarUsuarioPorCorreo, registrarAcceso, listarAsignaturas, crearAsignatura, actualizarAsignatura,
  detalleAsignatura, buscarGlosas, guardarClase, resumenClase, transcripcionClase, eliminarClase,
  guardarAjustes, estadisticasPorAsignatura, terminosMasDeletreados, eliminarAsignatura,
};
