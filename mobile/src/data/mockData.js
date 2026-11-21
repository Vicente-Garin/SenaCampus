// Datos realistas de ejemplo en español de Chile para SeñaCampus (usuaria: Camila Rojas)

export const ASIGNATURAS = [
  {
    id: 'twm',
    nombre: 'Tecnologías Web y Móviles',
    sala: 'B-204',
    profesor: 'Prof. Andrés Morales',
    horario: 'Lunes y miércoles, 10:15',
    clasesGuardadas: 6,
  },
  {
    id: 'bd2',
    nombre: 'Bases de Datos II',
    sala: 'A-110',
    profesor: 'Prof. Paula Vera',
    horario: 'Martes, 08:30',
    clasesGuardadas: 4,
  },
  {
    id: 'isw',
    nombre: 'Ingeniería de Software',
    sala: 'C-302',
    profesor: 'Prof. Rodrigo Soto',
    horario: 'Jueves, 14:30',
    clasesGuardadas: 5,
  },
];

export const CLASES_POR_ASIGNATURA = {
  twm: [
    {
      id: 'c18',
      asignaturaId: 'twm',
      fecha: 'Clase del 18 de noviembre',
      duracion: '1 h 20 min',
      palabras: 9840,
      deletreadas: ['proxy', 'endpoint', 'Expo'],
    },
    {
      id: 'c13',
      asignaturaId: 'twm',
      fecha: 'Clase del 13 de noviembre',
      duracion: '1 h 15 min',
      palabras: 8912,
      deletreadas: [],
    },
    {
      id: 'c11',
      asignaturaId: 'twm',
      fecha: 'Clase del 11 de noviembre',
      duracion: '1 h 22 min',
      palabras: 10105,
      deletreadas: [],
    },
  ],
  bd2: [],
  isw: [],
};

export const TRANSCRIPCIONES = {
  c18: [
    {
      hora: '10:32',
      texto: 'Hoy vamos a ver navegación con Expo Router. Cada archivo dentro de la carpeta app se convierte en una pantalla.',
      claves: ['Expo Router'],
    },
    {
      hora: '10:35',
      texto: 'Para las pestañas usamos un layout con Tabs y, para el detalle, una ruta dinámica.',
      claves: ['pestañas', 'ruta dinámica'],
    },
    {
      hora: '10:41',
      texto: 'Recuerden: mañana hay prueba sobre arquitectura de servicios.',
      claves: ['prueba'],
    },
  ],
};

export const SUBTITULOS_EN_VIVO = [
  '…mañana hay',
  '…mañana hay prueba',
  '…mañana hay prueba sobre arquitectura',
  '…mañana hay prueba sobre arquitectura de servicios.',
];

export const SENAS_PROXIMAS = ['MAÑANA', 'PRUEBA', 'ARQUITECTURA'];

export const MENSAJES_DIALOGO_INICIALES = [
  {
    id: 'm1',
    lado: 'otra',
    autor: 'Voz · Persona cerca',
    mensaje: '¿Necesitas ayuda para encontrar la sala?',
  },
  {
    id: 'm2',
    lado: 'yo',
    autor: 'Tú',
    mensaje: 'Sí, busco la ayudantía de Bases de Datos.',
  },
  {
    id: 'm3',
    lado: 'otra',
    autor: 'Voz · Persona cerca',
    mensaje: 'Es en la A-110, en el segundo piso.',
  },
];
