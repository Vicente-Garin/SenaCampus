// Prueba de punta a punta de la API de SeñaCampus (recorre las pantallas de la app).
// Crea datos de prueba y los borra al final, así se puede repetir sin ensuciar la base.
//
// Uso (con el servidor corriendo en modo desarrollo, AUTH_MODO=desarrollo):
//   node scripts/probar-api.js                         → http://localhost:5000
//   API_URL=http://localhost:5060 node scripts/probar-api.js
const API = (process.env.API_URL || 'http://localhost:5000') + '/api';
const CORREO = process.env.CORREO || 'vicente.garin@alumnos.ulagos.cl';

let fallas = 0;
const pedir = async (metodo, ruta, cuerpo) => {
  const res = await fetch(API + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', 'X-Usuario-Correo': CORREO },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  return { estado: res.status, json: await res.json() };
};
const revisar = (nombre, condicion, extra = '') => {
  if (!condicion) fallas++;
  console.log(`${condicion ? '✓' : '✗'} ${nombre}${extra ? '  ' + extra : ''}`);
};

const main = async () => {
  console.log(`Probando ${API} como ${CORREO}\n`);

  const salud = await pedir('GET', '/health');
  revisar('Salud del servidor', salud.estado === 200);

  // Traductor (público)
  const trad = await pedir('POST', '/v1/traductor/parse', { texto: 'Mañana hay prueba en la biblioteca' });
  const ids = trad.json.glosas?.map((g) => g.id) || [];
  revisar('Traducir "Mañana hay prueba en la biblioteca"', ids.join(',') === 'GL_MANANA,GL_PRUEBA,GL_BIBLIOTECA', ids.join(' '));
  revisar('"mañana" usa su seña (no se deletrea)', trad.json.glosas?.[0]?.tipo === 'lottie');

  // Acceso
  const perfil = await pedir('GET', '/v1/usuarios/me');
  revisar('Acceso: perfil del usuario', perfil.estado === 200 && perfil.json.data?.correo === CORREO, perfil.json.data?.nombre);

  // Asignaturas
  const lista = await pedir('GET', '/v1/asignaturas');
  revisar('Asignaturas: lista con contador de clases', lista.estado === 200 && lista.json.data?.every((a) => typeof a.clasesGuardadas === 'number'), `${lista.json.data?.length} asignaturas`);

  // Nueva asignatura: inválida y válida
  const invalida = await pedir('POST', '/v1/asignaturas', { nombre: '', sala: 'B-204' });
  revisar('Nueva asignatura sin nombre → 400 con mensaje por campo', invalida.estado === 400 && invalida.json.campos?.nombre, JSON.stringify(invalida.json.campos));
  const nueva = await pedir('POST', '/v1/asignaturas', {
    nombre: 'Taller de Prueba API', sala: '', profesor: 'Prof. Ximena Cárdenas',
    horario: { dias: ['viernes'], inicio: '15:00', fin: '16:20' },
  });
  const idAsig = nueva.json.data?._id;
  revisar('Nueva asignatura → 201 (sala vacía queda "Por definir")', nueva.estado === 201 && nueva.json.data?.sala === 'Por definir');

  // Detalle y editar
  const editada = await pedir('PATCH', `/v1/asignaturas/${idAsig}`, { sala: 'C-201' });
  revisar('Editar asignatura (sala)', editada.estado === 200 && editada.json.data?.sala === 'C-201');
  const colorMalo = await pedir('PATCH', `/v1/asignaturas/${idAsig}`, { color: 'rojo' });
  revisar('Editar con color inválido → 400', colorMalo.estado === 400 && colorMalo.json.campos?.color);

  // Traducir → guardar clase
  const inicio = new Date();
  const guardada = await pedir('POST', '/v1/clases', {
    asignaturaId: idAsig,
    fecha: inicio.toISOString(),
    duracionSegundos: 4500,
    fragmentos: [
      { marcaTiempo: new Date(inicio.getTime() + 600000).toISOString(), texto: 'Hoy presentan el avance del proyecto.', claves: ['avance'], glosas: ['GL_HOY', 'GL_AVANCE'] },
    ],
    deletreadas: ['proyecto', 'proyecto'],
  });
  const idClase = guardada.json.data?._id;
  revisar('Guardar clase → 201 (cuenta palabras y quita repetidas)', guardada.estado === 201 && guardada.json.data?.palabras === 6 && guardada.json.data?.deletreadas.length === 1);
  const claseMala = await pedir('POST', '/v1/clases', { asignaturaId: idAsig, fecha: 'ayer', duracionSegundos: 10, fragmentos: [] });
  revisar('Guardar clase con fecha inválida → 400', claseMala.estado === 400, JSON.stringify(claseMala.json.campos));

  // Resumen y Transcripción
  const resumen = await pedir('GET', `/v1/clases/${idClase}?vista=resumen`);
  revisar('Resumen de sesión (sin fragmentos)', resumen.estado === 200 && resumen.json.data?.fragmentos === undefined);
  const transcripcion = await pedir('GET', `/v1/clases/${idClase}`);
  revisar('Transcripción completa', transcripcion.estado === 200 && transcripcion.json.data?.fragmentos?.length === 1);

  const detalle = await pedir('GET', `/v1/asignaturas/${idAsig}`);
  revisar('Detalle de asignatura con historial', detalle.estado === 200 && detalle.json.data?.historial?.length === 1);

  // Ajustes
  const ajustes = await pedir('PATCH', '/v1/usuarios/me/ajustes', { textoGrande: true, velocidadSenas: 0.75 });
  revisar('Ajustes: guardar texto grande y 0.75x', ajustes.estado === 200 && ajustes.json.data?.ajustes?.velocidadSenas === 0.75);
  const ajusteMalo = await pedir('PATCH', '/v1/usuarios/me/ajustes', { velocidadSenas: 2 });
  revisar('Ajustes con velocidad 2x → 400', ajusteMalo.estado === 400);
  await pedir('PATCH', '/v1/usuarios/me/ajustes', { textoGrande: false, velocidadSenas: 1 });

  // Agregaciones
  const est = await pedir('GET', '/v1/asignaturas/estadisticas');
  revisar('Estadísticas por asignatura ($group)', est.estado === 200 && est.json.data?.length > 0);
  const del = await pedir('GET', '/v1/clases/deletreadas?limite=5');
  revisar('Términos más deletreados ($unwind + $group)', del.estado === 200 && del.json.data?.length <= 5);

  // Errores comunes
  const idMalo = await pedir('GET', '/v1/asignaturas/123');
  revisar('Id con formato inválido → 400', idMalo.estado === 400);
  const noExiste = await pedir('GET', '/v1/clases/000000000000000000000000');
  revisar('Clase que no existe → 404', noExiste.estado === 404);
  const sinUsuario = await fetch(API + '/v1/asignaturas').then((r) => r.status);
  revisar('Sin identificar al usuario → 401', sinUsuario === 401);

  // Limpieza: eliminar
  const delClase = await pedir('DELETE', `/v1/clases/${idClase}`);
  revisar('Eliminar clase', delClase.estado === 200);
  const delAsig = await pedir('DELETE', `/v1/asignaturas/${idAsig}`);
  revisar('Eliminar asignatura (en cascada)', delAsig.estado === 200);

  console.log(`\n${fallas === 0 ? 'Todas las pruebas pasaron.' : `${fallas} prueba(s) fallaron.`}`);
  process.exit(fallas === 0 ? 0 : 1);
};

main().catch((e) => {
  console.error('No se pudo conectar con la API:', e.message);
  process.exit(1);
});
