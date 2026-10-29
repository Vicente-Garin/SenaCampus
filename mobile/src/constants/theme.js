export const COLORS = {
  // Paleta principal Figma (SeñaCampus)
  coral: '#D14426',         // Color acento primario (botones principales, destacados)
  coralLight: '#FBECE8',    // Fondo suave para chips y elementos activos
  menta: '#4ECDC4',         // Acento secundario (estado activo, éxito)
  mentaLight: '#E8F8F7',
  durazno: '#F7A072',       // Acento cálido (avisos, tags de categoría)
  crema: '#FAF9F6',         // Fondo general de la app (neutral background)
  blanco: '#FFFFFF',

  // Escala neutra para textos y bordes
  textoPrincipal: '#1E293B', // Slate 800 (títulos y texto legible)
  textoSecundario: '#64748B',// Slate 500 (subtítulos, metadatos)
  borde: '#E2E8F0',          // Slate 200 (separadores de tarjetas)
  superficie: '#FFFFFF',     // Fondo de tarjetas y cards

  // Estados
  error: '#EF4444',
  success: '#10B981'
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export const FONTS = {
  regular: 'Nunito-Regular',
  medium: 'Nunito-Medium',
  bold: 'Nunito-Bold',
  semiBold: 'Nunito-SemiBold'
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  }
};