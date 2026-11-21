import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

// Barra superior con botón volver (>= 44 pt) y acción opcional a la derecha
export function BarraSuperior({ textoVolver, accion }) {
  const router = useRouter();
  const IconoAccion = accion?.Icono;

  return (
    <View style={styles.barra}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Volver a ${textoVolver}`}
        onPress={() => router.back()}
        hitSlop={8}
        style={({ pressed }) => [styles.volverBtn, pressed && { opacity: 0.7 }]}
      >
        <ChevronLeft size={28} strokeWidth={2} color={COLORES.azul} />
        <Text style={styles.volverTexto}>{textoVolver}</Text>
      </Pressable>

      {accion && IconoAccion ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accion.etiqueta || 'Acción'}
          onPress={accion.onPress}
          style={({ pressed }) => [styles.accionBtn, pressed && { backgroundColor: COLORES.azulSuave }]}
        >
          <IconoAccion size={22} strokeWidth={2} color={COLORES.tinta} />
        </Pressable>
      ) : (
        <View style={styles.espacioDerecha} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    height: MEDIDAS.altos.barraSuperior,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volverBtn: {
    height: MEDIDAS.altos.tactilMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: -6,
  },
  volverTexto: {
    ...TIPOGRAFIA.cuerpoDestacado,
    color: COLORES.azul,
  },
  accionBtn: {
    width: MEDIDAS.altos.tactilMin,
    height: MEDIDAS.altos.tactilMin,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  espacioDerecha: {
    width: MEDIDAS.altos.tactilMin,
  },
});
