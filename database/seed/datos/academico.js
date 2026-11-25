// Datos de prueba realistas de SeñaCampus (estudiantes de la Universidad de Los Lagos).
// Los nombres de estudiantes y docentes son ficticios.
// Las fechas usan la hora de Chile en verano (UTC-3).

// ---------------------------------------------------------------------------
// usuarios (11): el primero es el usuario de la demo de la app (Avance N°1)
// ---------------------------------------------------------------------------
const usuarios = [
  { clave: 'vicente', nombre: 'Vicente', apellido: 'Garín', correo: 'vicente.garin@alumnos.ulagos.cl', carrera: 'Ingeniería Civil en Informática', sede: 'Chiloé', ajustes: { textoGrande: false, subtitulos: true, vibracion: true, velocidadSenas: 1 }, creadoEn: '2026-10-29T18:40:00-03:00' },
  { clave: 'catalina', nombre: 'Catalina', apellido: 'Paredes', correo: 'catalina.paredes@alumnos.ulagos.cl', carrera: 'Pedagogía en Educación Diferencial', sede: 'Osorno', ajustes: { textoGrande: true, subtitulos: true, vibracion: true, velocidadSenas: 0.75 }, creadoEn: '2026-11-02T09:12:00-03:00' },
  { clave: 'benjamin', nombre: 'Benjamín', apellido: 'Oyarzo', correo: 'benjamin.oyarzo@alumnos.ulagos.cl', carrera: 'Ingeniería Civil en Informática', sede: 'Chiloé', ajustes: { textoGrande: false, subtitulos: true, vibracion: false, velocidadSenas: 1.5 }, creadoEn: '2026-11-03T11:05:00-03:00' },
  { clave: 'javiera', nombre: 'Javiera', apellido: 'Barrientos', correo: 'javiera.barrientos@alumnos.ulagos.cl', carrera: 'Trabajo Social', sede: 'Puerto Montt', ajustes: { textoGrande: true, subtitulos: true, vibracion: true, velocidadSenas: 1 }, creadoEn: '2026-11-04T15:30:00-03:00' },
  { clave: 'tomas', nombre: 'Tomás', apellido: 'Alvarado', correo: 'tomas.alvarado@alumnos.ulagos.cl', carrera: 'Ingeniería Comercial', sede: 'Osorno', ajustes: { textoGrande: false, subtitulos: false, vibracion: true, velocidadSenas: 1 }, creadoEn: '2026-11-05T08:50:00-03:00' },
  { clave: 'antonia', nombre: 'Antonia', apellido: 'Cárcamo', correo: 'antonia.carcamo@alumnos.ulagos.cl', carrera: 'Enfermería', sede: 'Osorno', ajustes: { textoGrande: false, subtitulos: true, vibracion: true, velocidadSenas: 0.75 }, creadoEn: '2026-11-06T13:20:00-03:00' },
  { clave: 'diego', nombre: 'Diego', apellido: 'Mansilla', correo: 'diego.mansilla@alumnos.ulagos.cl', carrera: 'Ingeniería Civil Industrial', sede: 'Puerto Montt', ajustes: { textoGrande: false, subtitulos: true, vibracion: false, velocidadSenas: 1 }, creadoEn: '2026-11-09T10:00:00-03:00' },
  { clave: 'fernanda', nombre: 'Fernanda', apellido: 'Uribe', correo: 'fernanda.uribe@alumnos.ulagos.cl', carrera: 'Psicología', sede: 'Osorno', ajustes: { textoGrande: true, subtitulos: true, vibracion: true, velocidadSenas: 1 }, creadoEn: '2026-11-10T16:45:00-03:00' },
  { clave: 'ignacio', nombre: 'Ignacio', apellido: 'Gallardo', correo: 'ignacio.gallardo@alumnos.ulagos.cl', carrera: 'Agronomía', sede: 'Osorno', ajustes: { textoGrande: false, subtitulos: true, vibracion: true, velocidadSenas: 1.5 }, creadoEn: '2026-11-11T12:10:00-03:00' },
  { clave: 'martina', nombre: 'Martina', apellido: 'Navarro', correo: 'martina.navarro@alumnos.ulagos.cl', carrera: 'Pedagogía en Inglés', sede: 'Osorno', ajustes: { textoGrande: false, subtitulos: true, vibracion: true, velocidadSenas: 1 }, creadoEn: '2026-11-12T09:35:00-03:00' },
  { clave: 'sebastian', nombre: 'Sebastián', apellido: 'Ojeda', correo: 'sebastian.ojeda@alumnos.ulagos.cl', carrera: 'Ingeniería Civil en Informática', sede: 'Chiloé', ajustes: { textoGrande: false, subtitulos: true, vibracion: false, velocidadSenas: 1 }, creadoEn: '2026-11-13T17:05:00-03:00' },
];

// ---------------------------------------------------------------------------
// asignaturas (16): cada una pertenece a un usuario (campo "usuario" = clave del usuario)
// ---------------------------------------------------------------------------
const asignaturas = [
  { clave: 'twm', usuario: 'vicente', nombre: 'Tecnologías Web y Móviles', sala: 'B-204', profesor: 'Prof. Andrés Morales', horario: { dias: ['lunes', 'miercoles'], inicio: '10:15', fin: '11:35' }, color: '#FAD9CF', creadaEn: '2026-10-29T19:00:00-03:00' },
  { clave: 'bd2', usuario: 'vicente', nombre: 'Bases de Datos II', sala: 'A-110', profesor: 'Prof. Paula Vera', horario: { dias: ['martes'], inicio: '08:30', fin: '09:50' }, color: '#D6E4F5', creadaEn: '2026-10-29T19:02:00-03:00' },
  { clave: 'isw', usuario: 'vicente', nombre: 'Ingeniería de Software', sala: 'C-302', profesor: 'Prof. Rodrigo Soto', horario: { dias: ['jueves'], inicio: '14:30', fin: '15:50' }, color: '#DCEFD8', creadaEn: '2026-10-29T19:04:00-03:00' },
  { clave: 'red', usuario: 'vicente', nombre: 'Redes de Computadores', sala: 'Laboratorio 2', profesor: 'Prof. Claudia Henríquez', horario: { dias: ['viernes'], inicio: '10:15', fin: '11:35' }, color: '#F3E3C3', creadaEn: '2026-11-14T10:20:00-03:00' },
  { clave: 'lsch', usuario: 'catalina', nombre: 'Lengua de Señas Chilena I', sala: 'D-105', profesor: 'Prof. Marcela Sandoval', horario: { dias: ['lunes', 'jueves'], inicio: '11:45', fin: '13:05' }, color: '#E8D9F2', creadaEn: '2026-11-02T09:20:00-03:00' },
  { clave: 'neuro', usuario: 'catalina', nombre: 'Neurodiversidad y Aprendizaje', sala: 'D-210', profesor: 'Prof. Gonzalo Pérez', horario: { dias: ['miercoles'], inicio: '15:00', fin: '16:20' }, color: '#FAD9CF', creadaEn: '2026-11-02T09:25:00-03:00' },
  { clave: 'calc3', usuario: 'benjamin', nombre: 'Cálculo III', sala: 'A-201', profesor: 'Prof. Hernán Muñoz', horario: { dias: ['lunes', 'miercoles'], inicio: '08:30', fin: '09:50' }, color: '#D6E4F5', creadaEn: '2026-11-03T11:10:00-03:00' },
  { clave: 'poo', usuario: 'benjamin', nombre: 'Programación Orientada a Objetos', sala: 'Laboratorio 1', profesor: 'Prof. Daniela Fuentes', horario: { dias: ['martes', 'jueves'], inicio: '10:15', fin: '11:35' }, color: '#DCEFD8', creadaEn: '2026-11-03T11:12:00-03:00' },
  { clave: 'polsoc', usuario: 'javiera', nombre: 'Políticas Sociales', sala: 'PM-12', profesor: 'Prof. Rosa Igor', horario: { dias: ['martes'], inicio: '14:30', fin: '15:50' }, color: '#F3E3C3', creadaEn: '2026-11-04T15:40:00-03:00' },
  { clave: 'conta', usuario: 'tomas', nombre: 'Contabilidad Financiera', sala: 'E-103', profesor: 'Prof. Luis Barría', horario: { dias: ['lunes'], inicio: '14:30', fin: '15:50' }, color: '#D6E4F5', creadaEn: '2026-11-05T09:00:00-03:00' },
  { clave: 'anato', usuario: 'antonia', nombre: 'Anatomía Humana', sala: 'Laboratorio de Morfología', profesor: 'Prof. Patricio Vidal', horario: { dias: ['martes', 'viernes'], inicio: '08:30', fin: '09:50' }, color: '#FAD9CF', creadaEn: '2026-11-06T13:30:00-03:00' },
  { clave: 'invop', usuario: 'diego', nombre: 'Investigación de Operaciones', sala: 'PM-21', profesor: 'Prof. Carolina Toledo', horario: { dias: ['miercoles'], inicio: '10:15', fin: '11:35' }, color: '#DCEFD8', creadaEn: '2026-11-09T10:10:00-03:00' },
  { clave: 'psidesa', usuario: 'fernanda', nombre: 'Psicología del Desarrollo', sala: 'F-204', profesor: 'Prof. Verónica Leal', horario: { dias: ['jueves'], inicio: '11:45', fin: '13:05' }, color: '#E8D9F2', creadaEn: '2026-11-10T16:50:00-03:00' },
  { clave: 'fisveg', usuario: 'ignacio', nombre: 'Fisiología Vegetal', sala: 'Laboratorio de Suelos', profesor: 'Prof. Jorge Schmidt', horario: { dias: ['viernes'], inicio: '14:30', fin: '15:50' }, color: '#DCEFD8', creadaEn: '2026-11-11T12:20:00-03:00' },
  { clave: 'fonet', usuario: 'martina', nombre: 'Fonética Inglesa', sala: 'G-101', profesor: 'Prof. Emily Carrasco', horario: { dias: ['lunes', 'miercoles'], inicio: '15:00', fin: '16:20' }, color: '#F3E3C3', creadaEn: '2026-11-12T09:40:00-03:00' },
  { clave: 'sisop', usuario: 'sebastian', nombre: 'Sistemas Operativos', sala: 'C-104', profesor: 'Prof. Rodrigo Soto', horario: { dias: ['martes'], inicio: '11:45', fin: '13:05' }, color: '#D6E4F5', creadaEn: '2026-11-13T17:10:00-03:00' },
];

// ---------------------------------------------------------------------------
// Fragmentos de transcripción por asignatura (lo que dijo el docente).
// Cada clase toma 3 fragmentos de su asignatura, rotando, para que no se repitan iguales.
// ---------------------------------------------------------------------------
const fragmentosPorAsignatura = {
  twm: [
    { texto: 'Hoy vamos a ver navegación con Expo Router. Cada archivo dentro de la carpeta app se convierte en una pantalla.', claves: ['Expo Router'] },
    { texto: 'Para las pestañas usamos un layout con Tabs y, para el detalle, una ruta dinámica.', claves: ['pestañas', 'ruta dinámica'] },
    { texto: 'Recuerden: mañana hay prueba sobre arquitectura de servicios.', claves: ['prueba'] },
    { texto: 'El estado compartido entre pantallas lo resolvemos con Context y el hook useContext.', claves: ['Context'] },
    { texto: 'Una API REST responde en formato JSON y cada endpoint representa un recurso.', claves: ['API REST', 'endpoint'] },
    { texto: 'Para el próximo avance la aplicación debe leer y escribir datos desde el servidor.', claves: ['avance'] },
  ],
  bd2: [
    { texto: 'En MongoDB los datos se guardan como documentos dentro de colecciones.', claves: ['documentos', 'colecciones'] },
    { texto: 'Embeber conviene cuando los datos se leen siempre juntos; referenciar cuando crecen sin límite.', claves: ['embeber', 'referenciar'] },
    { texto: 'Un índice compuesto acelera las consultas que filtran por un campo y ordenan por otro.', claves: ['índice compuesto'] },
    { texto: 'Con explain podemos ver si la consulta usa el índice o recorre toda la colección.', claves: ['explain'] },
    { texto: 'La etapa group del pipeline de agregación permite calcular totales por categoría.', claves: ['agregación', 'group'] },
  ],
  isw: [
    { texto: 'Los requisitos funcionales describen lo que el sistema debe hacer para el usuario.', claves: ['requisitos funcionales'] },
    { texto: 'En Scrum el equipo trabaja en sprints de dos semanas con una revisión al final.', claves: ['Scrum', 'sprint'] },
    { texto: 'Las historias de usuario deben tener criterios de aceptación claros.', claves: ['historias de usuario'] },
    { texto: 'El diagrama de casos de uso muestra a los actores y sus interacciones con el sistema.', claves: ['casos de uso'] },
    { texto: 'Hoy revisaremos pruebas unitarias y por qué conviene escribirlas desde el inicio.', claves: ['pruebas unitarias'] },
  ],
  red: [
    { texto: 'El modelo OSI tiene siete capas y cada una cumple una función distinta.', claves: ['modelo OSI'] },
    { texto: 'Una dirección IP identifica a un equipo dentro de la red.', claves: ['dirección IP'] },
    { texto: 'El protocolo TCP garantiza que los paquetes lleguen completos y en orden.', claves: ['TCP'] },
  ],
  lsch: [
    { texto: 'La lengua de señas chilena tiene su propia gramática, distinta del castellano.', claves: ['gramática'] },
    { texto: 'Hoy practicaremos el alfabeto dactilológico y los saludos.', claves: ['dactilológico'] },
    { texto: 'La expresión facial también forma parte de la seña.', claves: ['expresión facial'] },
  ],
  neuro: [
    { texto: 'La neurodiversidad reconoce que cada persona aprende de manera diferente.', claves: ['neurodiversidad'] },
    { texto: 'El diseño universal para el aprendizaje propone varias formas de presentar la información.', claves: ['DUA'] },
  ],
  calc3: [
    { texto: 'Una integral doble calcula el volumen bajo una superficie.', claves: ['integral doble'] },
    { texto: 'Para cambiar a coordenadas polares multiplicamos por el radio.', claves: ['coordenadas polares'] },
  ],
  poo: [
    { texto: 'Una clase es un molde y cada objeto es una instancia de esa clase.', claves: ['clase', 'objeto'] },
    { texto: 'La herencia permite reutilizar atributos y métodos de una clase padre.', claves: ['herencia'] },
  ],
  polsoc: [
    { texto: 'Las políticas sociales buscan reducir la desigualdad y proteger a las familias.', claves: ['políticas sociales'] },
    { texto: 'El próximo martes entregan el informe sobre el programa de vivienda.', claves: ['informe'] },
  ],
  conta: [
    { texto: 'El balance general muestra los activos, pasivos y el patrimonio de la empresa.', claves: ['balance general'] },
    { texto: 'Cada asiento contable tiene un debe y un haber que deben cuadrar.', claves: ['debe', 'haber'] },
  ],
  anato: [
    { texto: 'El corazón tiene cuatro cavidades: dos aurículas y dos ventrículos.', claves: ['aurículas', 'ventrículos'] },
    { texto: 'Mañana en el laboratorio revisaremos el sistema circulatorio.', claves: ['sistema circulatorio'] },
  ],
  invop: [
    { texto: 'La programación lineal busca maximizar o minimizar una función objetivo.', claves: ['programación lineal'] },
    { texto: 'Las restricciones definen la región factible del problema.', claves: ['región factible'] },
  ],
  psidesa: [
    { texto: 'Según Piaget el desarrollo cognitivo ocurre en cuatro etapas.', claves: ['Piaget'] },
    { texto: 'El apego seguro en la infancia influye en las relaciones adultas.', claves: ['apego'] },
  ],
  fisveg: [
    { texto: 'La fotosíntesis transforma la luz en energía química dentro de la hoja.', claves: ['fotosíntesis'] },
    { texto: 'El agua sube desde la raíz por el xilema.', claves: ['xilema'] },
  ],
  fonet: [
    { texto: 'Hoy trabajaremos los sonidos vocálicos del inglés y su transcripción fonética.', claves: ['transcripción fonética'] },
    { texto: 'La entonación cambia el significado de una pregunta.', claves: ['entonación'] },
  ],
  sisop: [
    { texto: 'Un proceso es un programa en ejecución con su propia memoria.', claves: ['proceso'] },
    { texto: 'El planificador decide qué proceso usa el procesador en cada momento.', claves: ['planificador'] },
  ],
};

// ---------------------------------------------------------------------------
// clases (32): asignatura, fecha/hora de inicio y duración en minutos
// ---------------------------------------------------------------------------
const clases = [
  // Vicente · Tecnologías Web y Móviles (las mismas fechas del Avance N°1)
  { asignatura: 'twm', inicio: '2026-11-18T10:15:00-03:00', minutos: 80 },
  { asignatura: 'twm', inicio: '2026-11-16T10:15:00-03:00', minutos: 75 },
  { asignatura: 'twm', inicio: '2026-11-11T10:15:00-03:00', minutos: 82 },
  { asignatura: 'twm', inicio: '2026-11-09T10:15:00-03:00', minutos: 78 },
  { asignatura: 'twm', inicio: '2026-11-04T10:15:00-03:00', minutos: 70 },
  { asignatura: 'twm', inicio: '2026-10-28T10:15:00-03:00', minutos: 81 },
  // Vicente · Bases de Datos II
  { asignatura: 'bd2', inicio: '2026-11-17T08:30:00-03:00', minutos: 85 },
  { asignatura: 'bd2', inicio: '2026-11-10T08:30:00-03:00', minutos: 80 },
  { asignatura: 'bd2', inicio: '2026-11-03T08:30:00-03:00', minutos: 75 },
  { asignatura: 'bd2', inicio: '2026-10-27T08:30:00-03:00', minutos: 82 },
  // Vicente · Ingeniería de Software
  { asignatura: 'isw', inicio: '2026-11-19T14:30:00-03:00', minutos: 90 },
  { asignatura: 'isw', inicio: '2026-11-12T14:30:00-03:00', minutos: 84 },
  { asignatura: 'isw', inicio: '2026-11-05T14:30:00-03:00', minutos: 88 },
  { asignatura: 'isw', inicio: '2026-10-29T14:30:00-03:00', minutos: 79 },
  { asignatura: 'isw', inicio: '2026-10-22T14:30:00-03:00', minutos: 86 },
  // Vicente · Redes de Computadores
  { asignatura: 'red', inicio: '2026-11-20T10:15:00-03:00', minutos: 77 },
  // Resto de estudiantes
  { asignatura: 'lsch', inicio: '2026-11-19T11:45:00-03:00', minutos: 80 },
  { asignatura: 'lsch', inicio: '2026-11-16T11:45:00-03:00', minutos: 78 },
  { asignatura: 'neuro', inicio: '2026-11-18T15:00:00-03:00', minutos: 75 },
  { asignatura: 'calc3', inicio: '2026-11-18T08:30:00-03:00', minutos: 80 },
  { asignatura: 'calc3', inicio: '2026-11-16T08:30:00-03:00', minutos: 80 },
  { asignatura: 'poo', inicio: '2026-11-19T10:15:00-03:00', minutos: 76 },
  { asignatura: 'polsoc', inicio: '2026-11-17T14:30:00-03:00', minutos: 70 },
  { asignatura: 'conta', inicio: '2026-11-16T14:30:00-03:00', minutos: 80 },
  { asignatura: 'anato', inicio: '2026-11-20T08:30:00-03:00', minutos: 82 },
  { asignatura: 'anato', inicio: '2026-11-17T08:30:00-03:00', minutos: 80 },
  { asignatura: 'invop', inicio: '2026-11-18T10:15:00-03:00', minutos: 78 },
  { asignatura: 'psidesa', inicio: '2026-11-19T11:45:00-03:00', minutos: 74 },
  { asignatura: 'fisveg', inicio: '2026-11-20T14:30:00-03:00', minutos: 80 },
  { asignatura: 'fonet', inicio: '2026-11-18T15:00:00-03:00', minutos: 72 },
  { asignatura: 'sisop', inicio: '2026-11-17T11:45:00-03:00', minutos: 80 },
  { asignatura: 'sisop', inicio: '2026-11-10T11:45:00-03:00', minutos: 78 },
];

module.exports = { usuarios, asignaturas, fragmentosPorAsignatura, clases };
