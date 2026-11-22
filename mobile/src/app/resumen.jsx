import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, Clock, Type } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';
import { useClases } from '../context/ClasesContext';

export default function ResumenScreen() {
  const router = useRouter();
  // El id de la clase llega como parámetro desde Traducir
  const { claseId } = useLocalSearchParams();
  const { buscarClase } = useClases();
  const clase = buscarClase(claseId) || buscarClase('c18');
  const deletreadas = clase.deletreadas || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.contenedor}>
        <View style={styles.contenido}>
          <View style={styles.circuloExito}>
            <Check size={44} strokeWidth={2.5} color={COLORES.exito} />
          </View>

          <Text style={styles.titulo}>¡Clase guardada!</Text>
          <Text style={styles.nombreClase}>{clase.fecha}</Text>
          <Text style={styles.subtitulo}>
            Ya puedes repasarla cuando quieras, incluso sin conexión.
          </Text>

          <View style={styles.tarjetas}>
            <Tarjeta
              titulo="Duración"
              detalle={`${clase.duracion} · ${clase.palabras.toLocaleString('es-CL')} palabras`}
              Icono={Clock}
              mostrarChevron={false}
            />
            <Tarjeta
              titulo="Palabras deletreadas"
              detalle={deletreadas.length ? `${deletreadas.length} sin seña: ${deletreadas.join(', ')}` : 'Ninguna: todas tenían seña'}
              Icono={Type}
              mostrarChevron={false}
            />
          </View>
        </View>

        <View style={styles.acciones}>
          <Boton
            etiqueta="Ver transcripción"
            tipo="primario"
            onPress={() => router.push(`/clase/${clase.id}`)}
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
  nombreClase: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.tinta },
  subtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave, marginBottom: 12 },
  tarjetas: { gap: 12 },
  acciones: { gap: 8 },
});
