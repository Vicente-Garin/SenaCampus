import React from 'react';
import { Pressable, View, Text, Switch, StyleSheet } from 'react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

/**
 * Fila de ajuste con interruptor (pantallas Permisos y Ajustes del Figma).
 * Toda la fila es tocable (64 pt de alto), no solo el interruptor.
 * Props:
 *  - titulo, detalle: textos
 *  - Icono: componente de lucide-react-native
 *  - valor: true/false (viene del useState de la pantalla)
 *  - onCambiar: función que recibe el nuevo valor
 */
function FilaAjuste({ titulo, detalle, Icono, valor, onCambiar }) {
  return (
    <Pressable
      onPress={() => onCambiar(!valor)}
      accessibilityRole="switch"
      accessibilityLabel={titulo}
      accessibilityState={{ checked: valor }}
      style={({ pressed }) => [styles.fila, pressed && styles.presionada]}
    >
      {Icono && <Icono size={24} strokeWidth={2} color={COLORES.tinta} />}
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {!!detalle && <Text style={styles.detalle}>{detalle}</Text>}
      </View>
      <Switch
        value={valor}
        onValueChange={onCambiar}
        trackColor={{ false: COLORES.bordeCampo, true: COLORES.azul }}
        thumbColor={COLORES.blanco}
        ios_backgroundColor={COLORES.bordeCampo}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: MEDIDAS.altos.filaAjusteMin, // 64
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 10,
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.campo,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  presionada: { backgroundColor: COLORES.azulSuave },
  textos: { flex: 1, gap: 2 },
  titulo: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.tinta },
  detalle: { ...TIPOGRAFIA.secundario, color: COLORES.tintaSuave },
});

export { FilaAjuste };
export default FilaAjuste;
