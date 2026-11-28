// Voz natural en la nube (pública como el traductor: no guarda datos del estudiante)
const express = require('express');
const voz = require('../controllers/vozController');

const router = express.Router();

router.get('/estado', voz.estado);
router.post('/', voz.crear);
router.get('/:archivo', voz.audio);

module.exports = router;
