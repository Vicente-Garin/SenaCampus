// Rutas de la API que necesitan saber quién es el estudiante (todas pasan por autenticar)
const express = require('express');
const { autenticar, verificarToken } = require('../middlewares/autenticar');
const usuario = require('../controllers/usuarioController');
const asignatura = require('../controllers/asignaturaController');
const clase = require('../controllers/claseController');

const router = express.Router();

// Crear cuenta: solo exige la cuenta de Firebase (el perfil todavía no existe)
router.post('/usuarios', verificarToken, usuario.crearPerfil);

// Desde aquí todas las rutas exigen un perfil
router.use(autenticar);

// Acceso y Ajustes
router.get('/usuarios/me', usuario.obtenerPerfil);
router.patch('/usuarios/me/ajustes', usuario.actualizarAjustes);

// Asignaturas, Nueva asignatura y Detalle
router.get('/asignaturas', asignatura.listar);
router.post('/asignaturas', asignatura.crear);
router.get('/asignaturas/estadisticas', asignatura.estadisticas);
router.get('/asignaturas/:id', asignatura.detalle);
router.patch('/asignaturas/:id', asignatura.actualizar);
router.delete('/asignaturas/:id', asignatura.eliminar);

// Traducir (guardar), Resumen y Transcripción
router.post('/clases', clase.guardar);
router.get('/clases/deletreadas', clase.masDeletreadas);
router.get('/clases/:id', clase.obtener);
router.delete('/clases/:id', clase.eliminar);

module.exports = router;
