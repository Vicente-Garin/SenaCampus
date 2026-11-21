import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Check, Info } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

const CONFIG_AVISO = {
  error: { fondo: COLORES.errorSuave, color: COLORES.error, Icono: AlertCircle },
  exito: { fondo: COLORES.exitoSuave, color: COLORES.exito, Icono: Check },
  advertencia: { fondo: COLORES.amarilloSuave, color: COLORES.advertencia, Icono: AlertCircle },
  info: { fondo: COLORES.azulSuave, color: COLORES.azul, Icono: Info },
};

function Aviso({ tipo = 'info', mensaje, style }) {
  const { fondo, color, Icono } = CONFIG_AVISO[tipo] || CONFIG_AVISO.info;

  return (
    <View
      style={[styles.contenedor, { backgroundColor: fondo }, style]}
      accessibilityRole="alert"
    >
      <Icono size={22} strokeWidth={2} color={color} />
      <Text style={styles.mensaje}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: MEDIDAS.radios.campo,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  mensaje: {
    ...TIPOGRAFIA.secundario,
    color: COLORES.tinta,
    flex: 1,
  },
});

export { Aviso };
