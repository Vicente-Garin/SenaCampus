// Acceso a las colecciones de MongoDB desde la API.
// Las consultas usan el driver nativo (a través de Mongoose) para que sean las mismas
// del Trabajo 3 (database/queries/consultas.js). La validación la hace MongoDB con $jsonSchema.
const mongoose = require('mongoose');

const { ObjectId } = mongoose.mongo;

const coleccion = (nombre) => mongoose.connection.db.collection(nombre);

const usuarios = () => coleccion('usuarios');
const asignaturas = () => coleccion('asignaturas');
const clases = () => coleccion('clases');

// Convierte un texto en ObjectId, o devuelve null si no tiene el formato correcto
const aObjectId = (valor) => (typeof valor === 'string' && ObjectId.isValid(valor) && valor.length === 24 ? new ObjectId(valor) : null);

module.exports = { usuarios, asignaturas, clases, aObjectId, ObjectId };
