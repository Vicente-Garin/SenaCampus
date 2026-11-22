/**
 * COMPONENTE · Burbuja de diálogo (UI Kit)
 * - Props: autor, mensaje y lado ('otra' a la izquierda en blanco, 'yo' a la derecha en azul).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';

// Burbuja de conversación para Modo Diálogo (izquierda = voz cercana, derecha = usuario)
export function Burbuja({ autor, mensaje, lado = 'otra' }) {
  const esYo = lado === 'yo';

  return (
    <View style={[styles.fila, esYo ? styles.derecha : styles.izquierda]}>
      <View
        style={[
          styles.burbuja,
          esYo ? styles.burbujaYo : styles.burbujaOtra,
        ]}
      >
        <Text style={[styles.autor, esYo ? styles.autorYo : styles.autorOtra]}>
          {autor}
        </Text>
        <Text style={[styles.mensaje, esYo ? styles.mensajeYo : styles.mensajeOtra]}>
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
    maxWidth: 270,
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
  autor: {
    ...TIPOGRAFIA.etiqueta,
  },
  autorOtra: { color: COLORES.coralTexto },
  autorYo: { color: COLORES.azulSuave },
  mensaje: {
    ...TIPOGRAFIA.cuerpo,
  },
  mensajeOtra: { color: COLORES.tinta },
  mensajeYo: { color: COLORES.blanco },
});
