// Palabras funcionales y conectores que la LSCh prescinde en interpretación directa
const STOPWORDS_LSCH = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'a', 'al', 'en', 'por', 'con', 'para', 'hacia',
  'y', 'e', 'o', 'u', 'que', 'se', 'lo', 'le', 'les', 'me', 'te', 'nos',
  'hay', 'haber', 'es', 'son', 'fue', 'era'
]);

/**
 * Normaliza cadenas manejando problemas de encoding en consolas Windows.
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    // Reemplaza posibles secuencias rotas de la 'ñ' enviada por terminales sin UTF-8
    .replace(/ma[\ufffd]ana/g, 'manana')
    .replace(/[\ufffd]/g, '')
    .replace(/ñ/g, 'n')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/[^a-z0-9\s]/g, '')     // Quita signos de puntuación
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Filtra stopwords manteniendo el orden conceptual
 */
const cleanTokens = (text) => {
  const clean = normalizeText(text);
  if (!clean) return [];
  return clean.split(' ').filter(w => w.length > 0 && !STOPWORDS_LSCH.has(w));
};

module.exports = {
  normalizeText,
  cleanTokens
};