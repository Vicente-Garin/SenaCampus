import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Clock, Type } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';

export default function ResumenScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.contenedor}>
        <View style={styles.contenido}>
          <View style={styles.circuloExito}>
            <Check size={44} strokeWidth={2.5} color={COLORES.exito} />
          </View>

          <Text style={styles.titulo}>¡Clase guardada!</Text>
          <Text style={styles.subtitulo}>
            Ya puedes repasarla cuando quieras, incluso sin conexión.
          </Text>

          <View style={styles.tarjetas}>
            <Tarjeta
              titulo="Duración"
              detalle="1 h 20 min · 9.840 palabras"
              Icono={Clock}
              mostrarChevron={false}
            />
            <Tarjeta
              titulo="Palabras deletreadas"
              detalle="3 sin seña: proxy, endpoint, Expo"
              Icono={Type}
              mostrarChevron={false}
            />
          </View>
        </View>

        <View style={styles.acciones}>
          <Boton
            etiqueta="Ver transcripción"
            tipo="primario"
            onPress={() => router.push('/clase/c18')}
          />
          <Boton
            etiqueta="Volver al inicio"
            tipo="texto"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORES.crema },
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingTop: 32,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  contenido: { gap: 12 },
  circuloExito: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORES.exitoSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  subtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave, marginBottom: 12 },
  tarjetas: { gap: 12 },
  acciones: { gap: 8 },
});
