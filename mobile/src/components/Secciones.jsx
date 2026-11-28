/**
 * COMPONENTES · Separación de secciones (UI Kit)
 * Todas las pantallas siguen el mismo patrón para que cada parte se distinga por color
 * (Pantalla envuelve las pantallas apiladas y pinta la zona de la barra de estado):
 *  1. BandaEncabezado: franja cremaEncabezado de borde a borde con el título de la pantalla.
 *  2. RotuloSeccion: título de sección en mayúsculas con una barrita coral a la izquierda.
 *  3. PanelAcciones: los botones principales en un panel blanco, separado del contenido.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

// Contenedor de pantallas apiladas (Detalle, Transcripción, Ajustes…): la zona de la barra de
// estado toma el color de la franja y el resto es crema, respetando las áreas seguras del teléfono.
export function Pantalla({ children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.pantalla}>
      <View style={{ height: insets.top, backgroundColor: COLORES.cremaEncabezado }} />
      <View style={[styles.flexUno, { paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }]}>
        {children}
      </View>
    </View>
  );
}

// Franja de encabezado. Usa márgenes negativos para llegar a los bordes de la pantalla
// aunque esté dentro de un contenedor con margen de 20 pt.
export function BandaEncabezado({ children, style }) {
  return <View style={[styles.banda, style]}>{children}</View>;
}

// Rótulo de sección: "TUS ASIGNATURAS", "HISTORIAL DE CLASES", "PRÓXIMAS SEÑAS"…
export function RotuloSeccion({ texto, style }) {
  return (
    <View style={[styles.rotulo, style]} accessibilityRole="header">
      <View style={styles.barrita} />
      <Text style={styles.textoRotulo}>{texto}</Text>
    </View>
  );
}

// Panel blanco para las acciones principales al final de la pantalla
export function PanelAcciones({ children, style }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  flexUno: { flex: 1 },
  banda: {
    marginHorizontal: -MEDIDAS.margenPantalla, // la pantalla que la usa pone paddingTop: 0

    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: COLORES.cremaEncabezado,
    borderBottomLeftRadius: MEDIDAS.radios.visor,
    borderBottomRightRadius: MEDIDAS.radios.visor,
    gap: 6,
  },
  rotulo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barrita: { width: 4, height: 18, borderRadius: 2, backgroundColor: COLORES.coral },
  textoRotulo: { ...TIPOGRAFIA.etiqueta, color: COLORES.tinta, letterSpacing: 0.5 },
  panel: {
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 12,
    gap: 10,
  },
});
