export const INITIAL_SUBJECTS = [
  {
    id: 'icinf-601',
    title: 'Tecnologías Web y Móviles',
    room: 'Sala 102 · Campus Chiloé',
    professor: 'Docente ICINF',
    schedule: 'Miércoles 14:30 - 16:00',
    color: '#FAD9CF',
    sessions: [
      {
        id: 'ses-101',
        date: '18 Nov 2026',
        topic: 'Arquitectura con Expo Router y Componentes Nativos',
        segments: [
          {
            time: '14:32',
            spoken: 'Hoy revisaremos cómo estructurar las rutas en src/app usando layouts anidados.',
            glosses: ['HOY', 'REVISAR', 'ESTRUCTURA', 'RUTAS', 'LAYOUT'],
          },
          {
            time: '14:45',
            spoken: 'Recuerden reemplazar ScrollView con map por FlatList para optimizar el rendimiento en listas largas.',
            glosses: ['RECORDAR', 'REEMPLAZAR', 'FLATLIST', 'OPTIMIZAR', 'LISTA'],
          },
        ],
      },
      {
        id: 'ses-102',
        date: '11 Nov 2026',
        topic: 'Ergonomía Móvil y Accesibilidad WCAG AA',
        segments: [
          {
            time: '14:35',
            spoken: 'Todo botón táctil debe medir al menos 48 dp y respetar el contraste mínimo de 4.5 a 1.',
            glosses: ['BOTÓN', 'MEDIR', '48 DP', 'CONTRASTE', 'ACCESIBLE'],
          },
        ],
      },
    ],
  },
  {
    id: 'icinf-602',
    title: 'Ingeniería de Software',
    room: 'Sala 204 · Campus Chiloé',
    professor: 'Docente Ingeniería',
    schedule: 'Jueves 10:00 - 11:30',
    color: '#F9D87E',
    sessions: [
      {
        id: 'ses-201',
        date: '12 Nov 2026',
        topic: 'Historias de Usuario y Criterios de Aceptación',
        segments: [
          {
            time: '10:10',
            spoken: 'Cada historia de usuario debe definir claramente el rol, la acción y el beneficio esperado.',
            glosses: ['HISTORIA', 'USUARIO', 'DEFINIR', 'ROL', 'ACCIÓN'],
          },
        ],
      },
    ],
  },
  {
    id: 'icinf-603',
    title: 'Cálculo Multivariable',
    room: 'Sala 105 · Campus Chiloé',
    professor: 'Docente Matemáticas',
    schedule: 'Viernes 08:30 - 10:00',
    color: '#BAE6D8',
    sessions: [
      {
        id: 'ses-301',
        date: '13 Nov 2026',
        topic: 'Multiplicadores de Lagrange y Puntos Críticos',
        segments: [
          {
            time: '08:40',
            spoken: 'Para hallar extremos condicionados igualamos el gradiente de f con lambda veces el gradiente de g.',
            glosses: ['EXTREMOS', 'CONDICIÓN', 'GRADIENTE', 'LAMBDA', 'IGUALAR'],
          },
        ],
      },
    ],
  },
];

export const LECTURE_SIMULATIONS = [
  {
    id: 'seg-1',
    time: '14:32',
    spoken: 'Buenos días a todos, hoy comenzamos la cátedra revisando la estructura de navegación móvil.',
    glosses: [
      { glosa: 'BUENOS DÍAS', mano: 'Mano desde el mentón hacia adelante + gesto de apertura', categoria: 'Saludo' },
      { glosa: 'HOY', mano: 'Ambas palmas hacia arriba bajando suavemente frente al cuerpo', categoria: 'Tiempo' },
      { glosa: 'CLASE', mano: 'Ambas manos en forma de C formando un círculo frente al pecho', categoria: 'Académico' },
      { glosa: 'NAVEGACIÓN', mano: 'Índice trazando ruta entre pantallas en el espacio', categoria: 'Técnico' },
    ],
  },
  {
    id: 'seg-2',
    time: '14:36',
    spoken: 'Recuerden que la próxima semana tenemos evaluación individual en laboratorio con el teléfono.',
    glosses: [
      { glosa: 'RECORDAR', mano: 'Pulgar toca la sien derecha con movimiento firme', categoria: 'Acción' },
      { glosa: 'PRÓXIMA SEMANA', mano: 'Índice desliza hacia adelante sobre la palma contraria', categoria: 'Tiempo' },
      { glosa: 'EVALUACIÓN', mano: 'Palmas alternadas revisando puntos clave en el espacio', categoria: 'Académico' },
      { glosa: 'TELÉFONO', mano: 'Forma de Y junto al oído indicando dispositivo móvil', categoria: 'Dispositivo' },
    ],
  },
  {
    id: 'seg-3',
    time: '14:40',
    spoken: '¿Alguien tiene alguna pregunta sobre la rúbrica antes de guardar la sesión?',
    glosses: [
      { glosa: 'ALGUIEN', mano: 'Dedo índice vertical realizando un pequeño círculo', categoria: 'Pronombre' },
      { glosa: 'PREGUNTA', mano: 'Dedo índice dibuja un signo de interrogación hacia el frente', categoria: 'Interacción' },
      { glosa: 'RÚBRICA', mano: 'Mano izquierda plana y derecha marcando criterios de arriba abajo', categoria: 'Académico' },
      { glosa: 'GUARDAR', mano: 'Mano cerrada guardando información hacia la palma contraria', categoria: 'Acción' },
    ],
  },
];

export const QUICK_PHRASES = [
  'Profesor, ¿puede repetir esa última parte, por favor?',
  'Tengo una consulta sobre este criterio.',
  '¿Podría escribir el ejemplo en la pizarra?',
  'Gracias, quedó claro.',
];
