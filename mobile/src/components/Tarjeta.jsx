import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

/**
 * Tarjeta de lista (asignaturas, historial de clases, resumen).
 * Props:
 *  - titulo, detalle: textos de la tarjeta
 *  - Icono: componente de lucide-react-native que va en la caja azul
 *  - mostrarChevron: muestra la flecha ">" cuando la tarjeta lleva a otra pantalla
 *  - onPress: si existe, toda la tarjeta es tocable y muestra estado presionado
 */
function Tarjeta({ titulo, detalle, Icono, mostrarChevron = true, onPress, style }) {
  const tocable = typeof onPress === 'function';

  return (
    <Pressable
      onPress={onPress}
      disabled={!tocable}
      accessibilityRole={tocable ? 'button' : 'summary'}
      accessibilityLabel={detalle ? `${titulo}. ${detalle}` : titulo}
      style={({ pressed }) => [
        styles.tarjeta,
        pressed && tocable && styles.presionada,
        style,
      ]}
    >
      <View style={styles.cajaIcono}>
        {Icono && <Icono size={24} strokeWidth={2} color={COLORES.azul} />}
      </View>

      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {!!detalle && <Text style={styles.detalle}>{detalle}</Text>}
      </View>

      {mostrarChevron && <ChevronRight size={24} strokeWidth={2} color={COLORES.tintaSuave} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: MEDIDAS.altos.tarjetaMin, // 76
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 12,
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  // Estado presionado del UI Kit: fondo Coral suave y borde Coral de 2 px
  presionada: {
    backgroundColor: COLORES.coralSuave,
    borderColor: COLORES.coral,
    borderWidth: 2,
  },
  cajaIcono: {
    width: 52,
    height: 52,
    borderRadius: MEDIDAS.radios.iconoCaja,
    backgroundColor: COLORES.azulSuave,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...TIPOGRAFIA.cuerpoDestacado,
    color: COLORES.tinta,
  },
  detalle: {
    ...TIPOGRAFIA.secundario,
    color: COLORES.tintaSuave,
  },
});

export { Tarjeta };
export default Tarjeta;
