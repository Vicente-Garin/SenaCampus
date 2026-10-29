const Gloss = require('../models/Gloss');
const { cleanTokens } = require('../utils/textParser');

const parseTranscriptToGlosses = async (req, res) => {
  try {
    const { texto, contexto } = req.body;

    if (!texto || typeof texto !== 'string') {
      return res.status(400).json({ error: 'El campo "texto" es obligatorio y debe ser una cadena.' });
    }

    const tokens = cleanTokens(texto);

    if (tokens.length === 0) {
      return res.status(200).json({
        textoOriginal: texto,
        glosas: [],
        totalGlosas: 0
      });
    }

    const sequence = [];
    let i = 0;

    while (i < tokens.length) {
      let matchedGloss = null;
      let matchedLength = 1;

      // 1. Probar combinación de 2 tokens consecutivos (ej. "sala" + "clases")
      if (i + 1 < tokens.length) {
        const bigram = `${tokens[i]} ${tokens[i+1]}`;
        const bigramWithDe = `${tokens[i]} de ${tokens[i+1]}`; // caso "sala de clases"
        
        matchedGloss = await Gloss.findOne({
          $or: [
            { termino: bigram },
            { variantes: bigram },
            { termino: bigramWithDe },
            { variantes: bigramWithDe }
          ]
        }).select('glosa_id termino categoria tipo_recurso archivo_asset');

        if (matchedGloss) {
          matchedLength = 2; // Consume ambos tokens ("sala" y "clases")
        }
      }

      // 2. Probar token individual si no hubo coincidencia compuesta
      if (!matchedGloss) {
        const single = tokens[i];
        // Quitar la 's' final para lematizar plurales simples si aplica (ej. matematicas -> matematica)
        const singular = single.endsWith('s') && single.length > 3 ? single.slice(0, -1) : single;

        matchedGloss = await Gloss.findOne({
          $or: [
            { termino: single },
            { variantes: single },
            { termino: singular },
            { variantes: singular }
          ]
        }).select('glosa_id termino categoria tipo_recurso archivo_asset');
      }

      const currentTerm = tokens.slice(i, i + matchedLength).join(' ');

      if (matchedGloss) {
        sequence.push({
          id: matchedGloss.glosa_id,
          termino: matchedGloss.termino,
          categoria: matchedGloss.categoria,
          tipo: matchedGloss.tipo_recurso,
          asset: matchedGloss.archivo_asset,
          deletreo: matchedGloss.tipo_recurso === 'dactilologia' ? matchedGloss.termino.toUpperCase().replace(/\s+/g, '').split('') : null
        });
      } else {
        // Fallback dactilológico
        sequence.push({
          id: `GL_${currentTerm.toUpperCase().replace(/\s+/g, '_')}`,
          termino: currentTerm,
          categoria: 'desconocido',
          tipo: 'dactilologia',
          asset: null,
          deletreo: currentTerm.toUpperCase().replace(/[^A-Z0-9]/g, '').split('')
        });
      }

      i += matchedLength;
    }

    return res.status(200).json({
      textoOriginal: texto,
      contexto: contexto || 'academico',
      totalGlosas: sequence.length,
      glosas: sequence
    });

  } catch (error) {
    console.error('Error al procesar la traducción:', error);
    return res.status(500).json({ error: 'Error interno al procesar el texto a glosas.' });
  }
};

module.exports = {
  parseTranscriptToGlosses
};