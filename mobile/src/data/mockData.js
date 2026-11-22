// Datos realistas de ejemplo en español de Chile para SeñaCampus

// Usuario con sesión iniciada (se muestra en el saludo de Asignaturas y en el Acceso)
export const USUARIO = {
  nombre: 'Vicente',
  apellido: 'Garín',
  correo: 'vicente.garin@alumnos.ulagos.cl',
};

export const ASIGNATURAS = [
  {
    id: 'twm',
    nombre: 'Tecnologías Web y Móviles',
    sala: 'B-204',
    profesor: 'Prof. Andrés Morales',
    horario: 'Lunes y miércoles, 10:15',
  },
  {
    id: 'bd2',
    nombre: 'Bases de Datos II',
    sala: 'A-110',
    profesor: 'Prof. Paula Vera',
    horario: 'Martes, 08:30',
  },
  {
    id: 'isw',
    nombre: 'Ingeniería de Software',
    sala: 'C-302',
    profesor: 'Prof. Rodrigo Soto',
    horario: 'Jueves, 14:30',
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
    { id: 'c06', asignaturaId: 'twm', fecha: 'Clase del 6 de noviembre', duracion: '1 h 18 min', palabras: 9320, deletreadas: [] },
    { id: 'c04', asignaturaId: 'twm', fecha: 'Clase del 4 de noviembre', duracion: '1 h 10 min', palabras: 8475, deletreadas: [] },
    { id: 'c30', asignaturaId: 'twm', fecha: 'Clase del 30 de octubre', duracion: '1 h 21 min', palabras: 9910, deletreadas: [] },
  ],
  bd2: [
    { id: 'b17', asignaturaId: 'bd2', fecha: 'Clase del 17 de noviembre', duracion: '1 h 25 min', palabras: 10240, deletreadas: [] },
    { id: 'b10', asignaturaId: 'bd2', fecha: 'Clase del 10 de noviembre', duracion: '1 h 20 min', palabras: 9605, deletreadas: [] },
    { id: 'b03', asignaturaId: 'bd2', fecha: 'Clase del 3 de noviembre', duracion: '1 h 15 min', palabras: 8890, deletreadas: [] },
    { id: 'b27', asignaturaId: 'bd2', fecha: 'Clase del 27 de octubre', duracion: '1 h 22 min', palabras: 9785, deletreadas: [] },
  ],
  isw: [
    { id: 'i20', asignaturaId: 'isw', fecha: 'Clase del 20 de noviembre', duracion: '1 h 30 min', palabras: 10870, deletreadas: [] },
    { id: 'i13', asignaturaId: 'isw', fecha: 'Clase del 13 de noviembre', duracion: '1 h 24 min', palabras: 10150, deletreadas: [] },
    { id: 'i06', asignaturaId: 'isw', fecha: 'Clase del 6 de noviembre', duracion: '1 h 28 min', palabras: 10430, deletreadas: [] },
    { id: 'i30', asignaturaId: 'isw', fecha: 'Clase del 30 de octubre', duracion: '1 h 19 min', palabras: 9510, deletreadas: [] },
    { id: 'i23', asignaturaId: 'isw', fecha: 'Clase del 23 de octubre', duracion: '1 h 26 min', palabras: 10260, deletreadas: [] },
  ],
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
