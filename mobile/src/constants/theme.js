export const COLORS = {
  background: '#FBF5EE',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBackground: '#FFFFFF',
  primary: '#C84626',
  primaryLight: '#F3E8DB',
  text: '#1C1917',
  textDark: '#1C1917',
  textSecondary: '#706E6B',
  textMuted: '#706E6B',
  border: '#E8E1D7',
  cardPeach: '#FAD9CF',
  cardYellow: '#F9D87E',
  cardGreen: '#BAE6D8',
};

export const SIZES = {
  radius: 16,
  padding: 20,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  card: 16,
};

export const SPACING = SIZES;

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

const theme = {
  colors: COLORS,
  sizes: SIZES,
  spacing: SPACING,
  shadows: SHADOWS,
  COLORS,
  SIZES,
  SPACING,
  SHADOWS,
};

export default theme;
