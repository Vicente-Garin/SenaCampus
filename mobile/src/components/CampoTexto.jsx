import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

/**
 * Campo de texto del UI Kit (estados: normal, foco y error).
 * Es un TextInput CONTROLADO: el valor vive en el estado de la pantalla que lo usa.
 * Props:
 *  - etiqueta: texto sobre el campo
 *  - valor / alCambiar: valor actual y función que lo actualiza (value / onChangeText)
 *  - placeholder, ayuda: textos de apoyo
 *  - error: si tiene texto, el campo se marca en rojo con ícono y mensaje
 */
function CampoTexto({ etiqueta, valor, alCambiar, placeholder, ayuda, error, ...resto }) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        value={valor}
        onChangeText={alCambiar}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        placeholder={placeholder}
        placeholderTextColor={COLORES.tintaSuave}
        accessibilityLabel={etiqueta}
        style={[styles.campo, enfocado && styles.campoFoco, !!error && styles.campoError]}
        {...resto}
      />
      {/* El error se comunica con color, ícono y texto (no solo color) */}
      {error ? (
        <View style={styles.ayudaFila}>
          <AlertCircle size={18} strokeWidth={2} color={COLORES.error} />
          <Text style={[styles.ayuda, { color: COLORES.error }]}>{error}</Text>
        </View>
      ) : ayuda ? (
        <Text style={styles.ayuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: 8 },
  etiqueta: { ...TIPOGRAFIA.etiqueta, color: COLORES.tinta },
  campo: {
    height: 54,
    backgroundColor: COLORES.blanco,
    borderWidth: 2,
    borderColor: COLORES.bordeCampo,
    borderRadius: MEDIDAS.radios.campo,
    paddingHorizontal: 16,
    ...TIPOGRAFIA.cuerpo,
    color: COLORES.tinta,
  },
  campoFoco: { borderWidth: 3, borderColor: COLORES.azul },
  campoError: { borderWidth: 3, borderColor: COLORES.error },
  ayudaFila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ayuda: { ...TIPOGRAFIA.secundario, color: COLORES.tintaSuave },
});

export { CampoTexto };
export default CampoTexto;
