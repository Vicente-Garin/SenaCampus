// Demuestra que la base RECHAZA documentos inválidos (criterio 3 de la rúbrica).
// Cada caso intenta insertar algo que la app no debería permitir y muestra el error de MongoDB.
// Uso: npm run schema:prueba   (después de npm run schema)
const { ObjectId } = require('mongodb');
const { conectar, titulo } = require('../lib/conexion');

const casos = [
  {
    coleccion: 'usuarios',
    motivo: 'Correo que no es institucional (la pantalla Acceso solo acepta @alumnos.ulagos.cl)',
    documento: {
      firebaseUid: 'Xb7kQ2mN9pR4sT6vW8yZ1aC3dE5f',
      nombre: 'Camila',
      apellido: 'Rojas',
      correo: 'camila.rojas@gmail.com',
      rol: 'estudiante',
      sede: 'Chiloé',
      ajustes: { textoGrande: false, subtitulos: true, vibracion: true, velocidadSenas: 1 },
      creadoEn: new Date(),
    },
  },
  {
    coleccion: 'usuarios',
    motivo: 'Velocidad de señas que no existe en Ajustes (2x)',
    documento: {
      firebaseUid: 'Hn3pL8qW2eR7tY1uI6oP4aS9dF0g',
      nombre: 'Matías',
      apellido: 'Soto',
      correo: 'matias.soto@alumnos.ulagos.cl',
      rol: 'estudiante',
      sede: 'Osorno',
      ajustes: { textoGrande: false, subtitulos: true, vibracion: true, velocidadSenas: 2 },
      creadoEn: new Date(),
    },
  },
  {
    coleccion: 'asignaturas',
    motivo: 'Asignatura sin nombre (campo obligatorio en Nueva asignatura)',
    documento: {
      usuarioId: new ObjectId(),
      sala: 'B-204',
      profesor: 'Prof. Andrés Morales',
      color: '#FAD9CF',
      creadaEn: new Date(),
    },
  },
  {
    coleccion: 'clases',
    motivo: 'Fecha guardada como texto en vez de tipo fecha',
    documento: {
      asignaturaId: new ObjectId(),
      usuarioId: new ObjectId(),
      asignatura: { nombre: 'Tecnologías Web y Móviles', color: '#FAD9CF' },
      fecha: 'Clase del 18 de noviembre',
      duracionSegundos: 4800,
      palabras: 120,
      estado: 'finalizada',
      fragmentos: [],
      deletreadas: [],
    },
  },
];

const main = async () => {
  const { cliente, db } = await conectar();
  titulo('Prueba de validación: intentos de inserción inválidos');

  try {
    for (const caso of casos) {
      console.log(`\n[${caso.coleccion}] ${caso.motivo}`);
      try {
        await db.collection(caso.coleccion).insertOne(caso.documento);
        console.log('  ✗ SE INSERTÓ (la validación no funcionó)');
      } catch (error) {
        // code 121 = Document failed validation
        console.log(`  ✓ RECHAZADO por MongoDB (code ${error.code}: ${error.codeName || error.message})`);
        const reglas = error.errInfo?.details?.schemaRulesNotSatisfied || [];
        for (const regla of reglas) {
          console.log('    ' + JSON.stringify(regla, null, 0).slice(0, 220));
        }
      }
    }
  } finally {
    await cliente.close();
  }
};

main().catch((error) => {
  console.error('Error en la prueba de validación:', error.message);
  process.exit(1);
});
