// Validadores $jsonSchema de las colecciones de SeñaCampus.
// MongoDB los aplica en la propia base: un documento que no cumple se rechaza al insertar o actualizar.
// Los mismos campos se usarán como tipos de TypeScript en el Avance N°2 de la app móvil.

const VELOCIDADES_SENAS = [0.75, 1, 1.5]; // Pantalla Ajustes: 0.75x lenta, 1x normal, 1.5x rápida
const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const SEDES = ['Osorno', 'Puerto Montt', 'Chiloé', 'Santiago'];

// ---------------------------------------------------------------------------
// usuarios: perfil del estudiante. El inicio de sesión lo hace Firebase Authentication;
// aquí se guarda su firebaseUid para unir la cuenta de Firebase con los datos de la app.
// ---------------------------------------------------------------------------
const usuarios = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'Usuario de SeñaCampus',
    required: ['firebaseUid', 'nombre', 'apellido', 'correo', 'rol', 'sede', 'ajustes', 'creadoEn'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      firebaseUid: {
        bsonType: 'string',
        pattern: '^[A-Za-z0-9]{20,128}$',
        description: 'UID que entrega Firebase Authentication al iniciar sesión',
      },
      nombre: { bsonType: 'string', minLength: 2, maxLength: 60 },
      apellido: { bsonType: 'string', minLength: 2, maxLength: 60 },
      correo: {
        bsonType: 'string',
        pattern: '^[a-z0-9._-]+@(alumnos\\.)?ulagos\\.cl$',
        description: 'Correo institucional @alumnos.ulagos.cl o @ulagos.cl (pantalla Acceso)',
      },
      rol: { enum: ['estudiante', 'docente'] },
      carrera: { bsonType: 'string', maxLength: 100 },
      sede: { enum: SEDES },
      ajustes: {
        bsonType: 'object',
        description: 'Embebido: la pantalla Ajustes lo lee y lo guarda junto con el usuario',
        required: ['textoGrande', 'subtitulos', 'vibracion', 'velocidadSenas'],
        additionalProperties: false,
        properties: {
          textoGrande: { bsonType: 'bool' },
          subtitulos: { bsonType: 'bool' },
          vibracion: { bsonType: 'bool' },
          velocidadSenas: { bsonType: ['double', 'int'], enum: VELOCIDADES_SENAS },
        },
      },
      creadoEn: { bsonType: 'date' },
      ultimoAcceso: { bsonType: 'date' },
    },
  },
};

// ---------------------------------------------------------------------------
// asignaturas: ramos que el estudiante registra (pantallas Asignaturas y Nueva asignatura).
// ---------------------------------------------------------------------------
const asignaturas = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'Asignatura',
    required: ['usuarioId', 'nombre', 'sala', 'profesor', 'color', 'creadaEn'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      usuarioId: { bsonType: 'objectId', description: 'Referencia a usuarios._id (dueño de la asignatura)' },
      nombre: { bsonType: 'string', minLength: 3, maxLength: 80 },
      sala: { bsonType: 'string', minLength: 1, maxLength: 40 },
      profesor: { bsonType: 'string', minLength: 1, maxLength: 80 },
      horario: {
        bsonType: 'object',
        required: ['dias', 'inicio'],
        additionalProperties: false,
        properties: {
          dias: { bsonType: 'array', minItems: 1, uniqueItems: true, items: { enum: DIAS } },
          inicio: { bsonType: 'string', pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$' },
          fin: { bsonType: 'string', pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$' },
        },
      },
      color: { bsonType: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      creadaEn: { bsonType: 'date' },
    },
  },
};

// ---------------------------------------------------------------------------
// clases: cada sesión traducida en la pantalla Traducir. La transcripción va embebida.
// ---------------------------------------------------------------------------
const clases = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'Clase traducida',
    required: ['asignaturaId', 'usuarioId', 'asignatura', 'fecha', 'duracionSegundos', 'palabras', 'estado', 'fragmentos', 'deletreadas'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      asignaturaId: { bsonType: 'objectId', description: 'Referencia a asignaturas._id' },
      usuarioId: { bsonType: 'objectId', description: 'Referencia a usuarios._id' },
      asignatura: {
        bsonType: 'object',
        description: 'Copia del nombre y color de la asignatura (referencia extendida) para el Resumen',
        required: ['nombre', 'color'],
        additionalProperties: false,
        properties: {
          nombre: { bsonType: 'string', minLength: 3 },
          color: { bsonType: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        },
      },
      fecha: { bsonType: 'date', description: 'Inicio de la clase (tipo fecha, no texto)' },
      duracionSegundos: { bsonType: 'int', minimum: 1, maximum: 21600 },
      palabras: { bsonType: 'int', minimum: 0 },
      estado: { enum: ['en_curso', 'finalizada'] },
      fragmentos: {
        bsonType: 'array',
        description: 'Embebido: la pantalla Transcripción los lee siempre junto con la clase',
        items: {
          bsonType: 'object',
          required: ['marcaTiempo', 'texto', 'glosas'],
          additionalProperties: false,
          properties: {
            marcaTiempo: { bsonType: 'date' },
            texto: { bsonType: 'string', minLength: 1 },
            claves: { bsonType: 'array', items: { bsonType: 'string' } },
            glosas: { bsonType: 'array', items: { bsonType: 'string', pattern: '^GL_[A-Z0-9_]+$' } },
          },
        },
      },
      deletreadas: {
        bsonType: 'array',
        description: 'Términos sin seña en el diccionario que se mostraron con dactilología',
        items: { bsonType: 'string' },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// glosas: diccionario LSCh que usa el traductor (POST /api/v1/traductor/parse).
// Incluye createdAt, updatedAt y __v porque el backend escribe con Mongoose.
// ---------------------------------------------------------------------------
const glosas = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'Glosa LSCh',
    required: ['glosa_id', 'termino', 'variantes', 'categoria', 'tipo_recurso'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      glosa_id: { bsonType: 'string', pattern: '^GL_[A-Z0-9_]+$' },
      termino: { bsonType: 'string', minLength: 1 },
      variantes: { bsonType: 'array', items: { bsonType: 'string' } },
      categoria: { enum: ['academico', 'comun', 'tiempo', 'lugares', 'dactilologia', 'general'] },
      tipo_recurso: { enum: ['lottie', 'gif', 'dactilologia'] },
      archivo_asset: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
      __v: { bsonType: 'int' },
    },
  },
};

module.exports = { usuarios, asignaturas, clases, glosas, VELOCIDADES_SENAS, DIAS, SEDES };
