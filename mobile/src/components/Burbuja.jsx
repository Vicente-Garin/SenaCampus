/**
 * COMPONENTE · Burbuja de diálogo (UI Kit)
 * - Props: autor, mensaje y lado ('otra' a la izquierda en blanco, 'yo' a la derecha en azul).
 * - onLeer (opcional): muestra un botón para volver a leer el mensaje en voz alta.
 * - parcial: la otra persona aún está hablando (texto en gris y cursiva, se completa en vivo).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';

// Burbuja de conversación para Modo Diálogo (izquierda = voz cercana, derecha = usuario)
export function Burbuja({ autor, mensaje, lado = 'otra', onLeer, parcial = false }) {
  const esYo = lado === 'yo';

  return (
    <View style={[styles.fila, esYo ? styles.derecha : styles.izquierda]}>
      <View
        style={[
          styles.burbuja,
          esYo ? styles.burbujaYo : styles.burbujaOtra,
          parcial && styles.burbujaParcial,
        ]}
        accessibilityLiveRegion={esYo ? 'none' : 'polite'}
      >
        <View style={styles.cabecera}>
          <Text style={[styles.autor, esYo ? styles.autorYo : styles.autorOtra]}>
            {parcial ? `${autor} · hablando…` : autor}
          </Text>
          {onLeer && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Leer este mensaje en voz alta"
              onPress={onLeer}
              hitSlop={10}
              style={({ pressed }) => [styles.botonLeer, pressed && { opacity: 0.6 }]}
            >
              <Volume2 size={18} strokeWidth={2} color={esYo ? COLORES.azulSuave : COLORES.azul} />
            </Pressable>
          )}
        </View>
        <Text
          style={[
            styles.mensaje,
            esYo ? styles.mensajeYo : styles.mensajeOtra,
            parcial && styles.mensajeParcial,
          ]}
        >
          {mensaje}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    width: '100%',
    marginBottom: 10,
  },
  izquierda: { alignItems: 'flex-start' },
  derecha: { alignItems: 'flex-end' },
  burbuja: {
    maxWidth: 280,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  burbujaOtra: {
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderBottomLeftRadius: 6,
  },
  burbujaYo: {
    backgroundColor: COLORES.azul,
    borderBottomRightRadius: 6,
  },
  burbujaParcial: {
    borderStyle: 'dashed',
    borderColor: COLORES.bordeCampo,
  },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  autor: {
    ...TIPOGRAFIA.etiqueta,
  },
  autorOtra: { color: COLORES.coralTexto },
  autorYo: { color: COLORES.azulSuave },
  botonLeer: { marginLeft: 'auto', padding: 2 },
  mensaje: {
    ...TIPOGRAFIA.cuerpo,
  },
  mensajeOtra: { color: COLORES.tinta },
  mensajeYo: { color: COLORES.blanco },
  mensajeParcial: { color: COLORES.tintaSuave, fontStyle: 'italic' },
});
