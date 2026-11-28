import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';

// Colores de cada tipo de botón según el UI Kit de Figma.
// "normal" es el estado en reposo y "presionado" el estado mientras el dedo está encima.
const ESTILOS_TIPO = {
  primario: {
    normal: { fondo: COLORES.coral, borde: null, texto: COLORES.blanco },
    presionado: { fondo: COLORES.coralTexto, borde: null, texto: COLORES.blanco },
    deshabilitado: { fondo: COLORES.borde, borde: null, texto: COLORES.tintaSuave },
  },
  secundario: {
    normal: { fondo: COLORES.blanco, borde: COLORES.bordeCampo, texto: COLORES.tinta },
    presionado: { fondo: COLORES.coralSuave, borde: COLORES.coral, texto: COLORES.tinta },
    deshabilitado: { fondo: COLORES.crema, borde: COLORES.borde, texto: COLORES.tintaSuave },
  },
  // Acciones que borran datos (ej. Eliminar transcripción): rojo de error del UI Kit
  peligro: {
    normal: { fondo: COLORES.blanco, borde: COLORES.error, texto: COLORES.error },
    presionado: { fondo: COLORES.errorSuave, borde: COLORES.error, texto: COLORES.error },
    deshabilitado: { fondo: COLORES.crema, borde: COLORES.borde, texto: COLORES.tintaSuave },
  },
  texto: {
    normal: { fondo: 'transparent', borde: null, texto: COLORES.azul },
    presionado: { fondo: COLORES.azulSuave, borde: null, texto: COLORES.azul },
    deshabilitado: { fondo: 'transparent', borde: null, texto: COLORES.tintaSuave },
  },
};

/**
 * Botón reutilizable de SeñaCampus.
 * Props:
 *  - etiqueta: texto del botón
 *  - tipo: 'primario' | 'secundario' | 'peligro' | 'texto'
 *  - Icono: componente de lucide-react-native (opcional)
 *  - deshabilitado / cargando: estados del botón
 *  - onPress: función que se ejecuta al tocar
 *  - style: estilos extra (por ejemplo flex: 1 para dos botones en una fila)
 */
function Boton({ etiqueta, tipo = 'primario', Icono, deshabilitado = false, cargando = false, onPress, style }) {
  const paleta = ESTILOS_TIPO[tipo] || ESTILOS_TIPO.primario;
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      // Pressable entrega "pressed" para cambiar el estilo mientras se presiona
      // Pressable entrega 'pressed' (true mientras el dedo está encima) para mostrar el estado presionado.
      style={({ pressed }) => {
        const c = deshabilitado ? paleta.deshabilitado : pressed ? paleta.presionado : paleta.normal;
        return [
          styles.base,
          { backgroundColor: c.fondo },
          c.borde && { borderWidth: 2, borderColor: c.borde },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const c = deshabilitado ? paleta.deshabilitado : pressed ? paleta.presionado : paleta.normal;
        return (
          <View style={styles.contenido}>
            {cargando ? (
              <ActivityIndicator size="small" color={c.texto} />
            ) : (
              Icono && <Icono size={22} strokeWidth={2} color={c.texto} />
            )}
            <Text style={[styles.etiqueta, { color: c.texto }]} numberOfLines={1}>
              {cargando ? 'Cargando…' : etiqueta}
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: MEDIDAS.altos.boton, // 54: supera el mínimo táctil de 44 pt
    borderRadius: MEDIDAS.radios.boton,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  etiqueta: {
    ...TIPOGRAFIA.cuerpoDestacado,
  },
});

export { Boton };
export default Boton;
