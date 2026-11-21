import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

// Visor de Lengua de Señas con intérprete virtual geométrico (sin emoticones) y animación suave
export function VisorSenas({ estado = 'senando', senaActual = 'PRUEBA', alto = 220 }) {
  const pulsoManos = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (estado !== 'senando' && estado !== 'deletreo') return;
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(pulsoManos, { toValue: -8, duration: 700, useNativeDriver: true }),
        Animated.timing(pulsoManos, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    animacion.start();
    return () => animacion.stop();
  }, [estado, pulsoManos]);

  if (estado === 'cargando') {
    return (
      <View style={[styles.caja, { height: alto }]}>
        <ActivityIndicator size="large" color={COLORES.azul} />
        <Text style={styles.estadoTexto}>Preparando las señas…</Text>
      </View>
    );
  }

  if (estado === 'sinSenal') {
    return (
      <View style={[styles.caja, { height: alto }]}>
        <WifiOff size={36} strokeWidth={2} color={COLORES.tintaSuave} />
        <Text style={styles.estadoTexto}>Sin conexión: pausamos las señas</Text>
      </View>
    );
  }

  return (
    <View style={[styles.caja, { height: alto }]}>
      {/* Intérprete virtual geométrico igual al diseño de Figma */}
      <View style={styles.interprete}>
        <View style={styles.cabeza} />
        <View style={styles.cuerpo} />
        <Animated.View
          style={[
            styles.mano,
            styles.manoIzquierda,
            { transform: [{ translateY: pulsoManos }] },
          ]}
        />
        <Animated.View
          style={[
            styles.mano,
            styles.manoDerecha,
            { transform: [{ translateY: Animated.multiply(pulsoManos, -1) }] },
          ]}
        />
      </View>

      {/* Cápsula blanca inferior izquierda con la glosa activa */}
      <View style={styles.capsula}>
        <Text style={styles.capsulaTexto}>
          {estado === 'deletreo' ? `Deletreo · ${senaActual}` : `Seña · ${senaActual}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    width: '100%',
    backgroundColor: COLORES.durazno,
    borderRadius: MEDIDAS.radios.visor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  interprete: {
    width: 220,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cabeza: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORES.azul,
    marginBottom: 10,
  },
  cuerpo: {
    width: 150,
    height: 96,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    backgroundColor: COLORES.azul,
  },
  mano: {
    position: 'absolute',
    width: 34,
    height: 46,
    borderRadius: 20,
    backgroundColor: COLORES.coral,
  },
  manoIzquierda: {
    left: 22,
    top: '44%',
  },
  manoDerecha: {
    right: 22,
    top: '36%',
  },
  capsula: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: MEDIDAS.radios.chip,
  },
  capsulaTexto: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.azul,
  },
  estadoTexto: {
    ...TIPOGRAFIA.secundario,
    color: COLORES.tinta,
    marginTop: 12,
  },
});
