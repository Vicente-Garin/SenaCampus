import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

// Colores de cada estado del chip según el UI Kit de Figma
const ESTILOS_ESTADO = {
  normal: { fondo: COLORES.blanco, borde: COLORES.bordeCampo, texto: COLORES.tinta },
  activo: { fondo: COLORES.azul, borde: null, texto: COLORES.blanco },
  completado: { fondo: COLORES.exitoSuave, borde: null, texto: COLORES.exito },
  deshabilitado: { fondo: COLORES.borde, borde: null, texto: COLORES.tintaSuave },
};

/**
 * Chip de 44 pt de alto (área táctil mínima).
 * Props:
 *  - texto
 *  - estado: 'normal' | 'activo' | 'completado' | 'deshabilitado'
 *  - Icono: componente de lucide-react-native (opcional)
 *  - mostrarCheck: en estado "completado" muestra ✓ si no se pasa otro ícono
 *  - onPress: si existe, el chip es tocable
 *  - style: estilos extra (por ejemplo flex: 1)
 */
function Chip({ texto, estado = 'normal', Icono, mostrarCheck = true, onPress, style }) {
  const c = ESTILOS_ESTADO[estado] || ESTILOS_ESTADO.normal;
  const IconoFinal = Icono || (estado === 'completado' && mostrarCheck ? Check : null);
  const tocable = typeof onPress === 'function' && estado !== 'deshabilitado';

  return (
    <Pressable
      onPress={onPress}
      disabled={!tocable}
      accessibilityRole={tocable ? 'button' : 'text'}
      accessibilityLabel={texto}
      accessibilityState={{ selected: estado === 'activo', disabled: estado === 'deshabilitado' }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: c.fondo },
        c.borde && { borderWidth: 1.5, borderColor: c.borde },
        pressed && tocable && styles.presionado,
        style,
      ]}
    >
      {IconoFinal && <IconoFinal size={20} strokeWidth={2} color={c.texto} />}
      <Text style={[styles.texto, { color: c.texto }]} numberOfLines={1}>
        {texto}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: MEDIDAS.altos.chip, // 44
    borderRadius: MEDIDAS.radios.chip,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  presionado: {
    opacity: 0.75,
  },
  texto: {
    ...TIPOGRAFIA.etiqueta,
  },
});

export { Chip };
export default Chip;
