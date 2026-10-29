const express = require('express');
const router = express.Router();
const { parseTranscriptToGlosses } = require('../controllers/translationController');

// Ruta principal para el parseo de transcripciones a glosas LSCh
router.post('/parse', parseTranscriptToGlosses);

module.exports = router;