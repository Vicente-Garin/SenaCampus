// Carga los datos de prueba de SeñaCampus.
// Es IDEMPOTENTE: se puede ejecutar muchas veces sin duplicar datos, porque cada documento
// tiene un _id fijo (calculado a partir de una clave) y se guarda con replaceOne + upsert.
// Uso: npm run seed   (después de npm run schema)
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { conectar, titulo } = require('../lib/conexion');
const datos = require('./datos/academico');
const { buildCorpus } = require('./datos/glosas');
const { cleanTokens } = require('../../server/src/utils/textParser');

// _id estable: el mismo texto siempre genera el mismo ObjectId → no se duplica al repetir el seed
const idFijo = (texto) => new ObjectId(crypto.createHash('sha1').update(texto).digest('hex').slice(0, 24));

// UID con el formato de Firebase Authentication (28 caracteres alfanuméricos), estable por correo
const uidFirebase = (correo) =>
  crypto.createHash('sha256').update(correo).digest('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 28);

// Traduce un texto a glosas igual que el backend (POST /api/v1/traductor/parse):
// busca cada palabra en el diccionario y, si no existe, la marca para deletrear.
const crearTraductor = (corpus) => {
  const indice = new Map();
  for (const glosa of corpus) {
    for (const termino of [glosa.termino, ...glosa.variantes]) {
      const clave = termino.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n');
      if (!indice.has(clave)) indice.set(clave, glosa.glosa_id);
    }
  }
  return (texto) => {
    const glosas = [];
    const deletreadas = [];
    for (const token of cleanTokens(texto)) {
      const singular = token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token;
      const id = indice.get(token) || indice.get(singular);
      if (id) {
        glosas.push(id);
      } else {
        glosas.push(`GL_${token.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`);
        deletreadas.push(token);
      }
    }
    return { glosas, deletreadas };
  };
};

const upsertPorId = (docs) =>
  docs.map((doc) => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } }));

const main = async () => {
  const { cliente, db } = await conectar();
  titulo(`Cargando datos de prueba en "${db.databaseName}"`);

  try {
    // 1. glosas: diccionario LSCh (2.098 términos). La clave natural es glosa_id.
    const corpus = buildCorpus();
    const resGlosas = await db.collection('glosas').bulkWrite(
      corpus.map((g) => ({ replaceOne: { filter: { glosa_id: g.glosa_id }, replacement: g, upsert: true } })),
      { ordered: false }
    );

    // 2. usuarios
    const idUsuario = {};
    const usuarios = datos.usuarios.map((u) => {
      idUsuario[u.clave] = idFijo(`usuario:${u.correo}`);
      return {
        _id: idUsuario[u.clave],
        firebaseUid: uidFirebase(u.correo),
        nombre: u.nombre,
        apellido: u.apellido,
        correo: u.correo,
        rol: 'estudiante',
        carrera: u.carrera,
        sede: u.sede,
        ajustes: u.ajustes,
        creadoEn: new Date(u.creadoEn),
        ultimoAcceso: new Date('2026-11-21T09:00:00-03:00'),
      };
    });
    const resUsuarios = await db.collection('usuarios').bulkWrite(upsertPorId(usuarios));

    // 3. asignaturas (referencian a su usuario)
    const asignaturaPorClave = {};
    const asignaturas = datos.asignaturas.map((a) => {
      const doc = {
        _id: idFijo(`asignatura:${a.clave}`),
        usuarioId: idUsuario[a.usuario],
        nombre: a.nombre,
        sala: a.sala,
        profesor: a.profesor,
        horario: a.horario,
        color: a.color,
        creadaEn: new Date(a.creadaEn),
      };
      asignaturaPorClave[a.clave] = doc;
      return doc;
    });
    const resAsignaturas = await db.collection('asignaturas').bulkWrite(upsertPorId(asignaturas));

    // 4. clases (referencian a asignatura y usuario; la transcripción va embebida)
    const traducir = crearTraductor(corpus);
    const usadasPorAsignatura = {};
    const clases = datos.clases.map((c) => {
      const asignatura = asignaturaPorClave[c.asignatura];
      const pool = datos.fragmentosPorAsignatura[c.asignatura];
      const desde = usadasPorAsignatura[c.asignatura] || 0;
      usadasPorAsignatura[c.asignatura] = desde + 1;

      const inicio = new Date(c.inicio);
      const cantidad = Math.min(3, pool.length);
      const deletreadas = new Set();
      const fragmentos = [];
      for (let i = 0; i < cantidad; i++) {
        const base = pool[(desde + i) % pool.length];
        const { glosas, deletreadas: sinSena } = traducir(base.texto);
        sinSena.forEach((t) => deletreadas.add(t));
        fragmentos.push({
          // los fragmentos se reparten a lo largo de la clase
          marcaTiempo: new Date(inicio.getTime() + Math.round(((i + 1) * c.minutos * 60000) / (cantidad + 1))),
          texto: base.texto,
          claves: base.claves,
          glosas,
        });
      }

      return {
        _id: idFijo(`clase:${c.asignatura}:${c.inicio}`),
        asignaturaId: asignatura._id,
        usuarioId: asignatura.usuarioId,
        asignatura: { nombre: asignatura.nombre, color: asignatura.color },
        fecha: inicio,
        duracionSegundos: c.minutos * 60,
        palabras: fragmentos.reduce((total, f) => total + f.texto.split(/\s+/).filter(Boolean).length, 0),
        estado: 'finalizada',
        fragmentos,
        deletreadas: [...deletreadas],
      };
    });
    const resClases = await db.collection('clases').bulkWrite(upsertPorId(clases));

    const resumen = (nombre, r, total) =>
      console.log(`- ${nombre.padEnd(12)} ${String(total).padStart(5)} documentos  (nuevos: ${r.upsertedCount}, reemplazados: ${r.matchedCount})`);
    resumen('glosas', resGlosas, corpus.length);
    resumen('usuarios', resUsuarios, usuarios.length);
    resumen('asignaturas', resAsignaturas, asignaturas.length);
    resumen('clases', resClases, clases.length);

    titulo('Total de documentos por colección después del seed');
    for (const nombre of ['usuarios', 'asignaturas', 'clases', 'glosas']) {
      console.log(`- ${nombre.padEnd(12)} ${await db.collection(nombre).countDocuments()}`);
    }
  } finally {
    await cliente.close();
  }
};

main().catch((error) => {
  console.error('Error al cargar los datos de prueba:', error.message);
  if (error.errInfo) console.dir(error.errInfo, { depth: null });
  if (error.writeErrors?.[0]) console.dir(error.writeErrors[0].err?.errInfo || error.writeErrors[0], { depth: null });
  process.exit(1);
});
