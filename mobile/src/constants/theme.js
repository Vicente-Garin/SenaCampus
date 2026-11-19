export const COLORS = {
  // Fondos y superficies (Neutros cálidos)
  background: '#FBF5EE',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E5DDD3',

  // Identidad primaria y secundaria
  primary: '#C84626',       // Terracota (Contraste > 4.5:1 con texto blanco)
  primaryDark: '#9E3319',
  primaryLight: '#F3E8DB',
  secondary: '#2B5B6C',     // Azul petróleo secundario

  // Tipografía (Contraste WCAG AA > 4.5:1)
  text: '#1C1917',
  textDark: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#57534E',

  // Semánticos exigidos por rúbrica
  success: '#1E6F50',
  successLight: '#DCFCE7',
  warning: '#9A5B00',
  warningLight: '#FEF3C7',
  error: '#B91C1C',
  errorLight: '#FEE2E2',

  // Acentos pastel para tarjetas de asignaturas
  cardPeach: '#FAD9CF',
  cardYellow: '#F9D87E',
  cardGreen: '#BAE6D8',
};

export const TYPOGRAPHY = {
  h1: 26,
  h2: 20,
  h3: 18,
  body: 16,      // Mínimo 16 sp exigido por rúbrica
  caption: 14,
};

export const SIZES = {
  radius: 16,
  padding: 20,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  touchMin: 48,  // Área táctil mínima 48 dp
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
};

export default { COLORS, TYPOGRAPHY, SIZES, SHADOWS };
