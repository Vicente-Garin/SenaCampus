// Convierte cualquier error en una respuesta JSON clara para la app:
// { ok: false, error: "mensaje para el usuario", campos: { nombre: "mensaje" } }
const { ErrorApi } = require('../utils/errores');

// Mensajes en español para los campos que valida $jsonSchema (los ve el estudiante en los formularios)
const MENSAJES_CAMPO = {
  nombre: 'El nombre es obligatorio (entre 3 y 80 caracteres).',
  sala: 'La sala no puede quedar vacía (máximo 40 caracteres).',
  profesor: 'El profesor no puede quedar vacío (máximo 80 caracteres).',
  color: 'El color debe tener el formato #RRGGBB.',
  horario: 'El horario debe tener al menos un día y una hora de inicio HH:MM.',
  correo: 'Usa tu correo institucional @alumnos.ulagos.cl.',
  ajustes: 'Los ajustes no son válidos (velocidad permitida: 0.75, 1 o 1.5).',
  fecha: 'La fecha de la clase no es válida.',
  duracionSegundos: 'La duración debe ser un número entero de segundos mayor a 0.',
  fragmentos: 'La transcripción tiene fragmentos inválidos.',
  deletreadas: 'La lista de palabras deletreadas no es válida.',
};

// Lee el detalle que entrega MongoDB cuando un documento no cumple el $jsonSchema (código 121)
const camposDesdeValidacion = (errInfo) => {
  const campos = {};
  const reglas = errInfo?.details?.schemaRulesNotSatisfied || [];
  for (const regla of reglas) {
    for (const p of regla.propertiesNotSatisfied || []) campos[p.propertyName] = MENSAJES_CAMPO[p.propertyName] || 'Valor no válido.';
    for (const p of regla.missingProperties || []) campos[p] = MENSAJES_CAMPO[p] || 'Campo obligatorio.';
    for (const p of regla.additionalProperties || []) campos[p] = 'Campo no permitido.';
  }
  return campos;
};

// eslint-disable-next-line no-unused-vars
const manejarErrores = (error, req, res, next) => {
  if (error instanceof ErrorApi) {
    return res.status(error.estado).json({ ok: false, error: error.message, ...(error.detalles && { campos: error.detalles }) });
  }
  if (error.code === 121) {
    return res.status(400).json({ ok: false, error: 'Revisa los datos ingresados.', campos: camposDesdeValidacion(error.errInfo) });
  }
  if (error.code === 11000) {
    return res.status(409).json({ ok: false, error: 'Ya existe un registro con esos datos.' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'El cuerpo de la solicitud no es un JSON válido.' });
  }
  console.error('Error no controlado:', error);
  return res.status(500).json({ ok: false, error: 'Error interno del servidor. Intenta de nuevo.' });
};

const rutaNoEncontrada = (req, res) => res.status(404).json({ ok: false, error: `La ruta ${req.method} ${req.originalUrl} no existe.` });

module.exports = { manejarErrores, rutaNoEncontrada };
