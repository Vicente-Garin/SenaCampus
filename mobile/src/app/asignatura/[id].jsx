/**
 * PANTALLA 6 · DETALLE DE ASIGNATURA · ruta dinámica "/asignatura/[id]"
 * - Recibe el id con useLocalSearchParams (ej. /asignatura/twm -> id = 'twm').
 * - Datos: la asignatura y su historial desde el Context.
 * - Interacción: abrir una clase (/clase/[id]) o "Traducir esta clase" con el id como parámetro.
 */
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Hand, Inbox } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { useClases } from '../../context/ClasesContext';
import { BarraSuperior } from '../../components/BarraSuperior';
import { Tarjeta } from '../../components/Tarjeta';
import { Boton } from '../../components/Boton';

export default function DetalleAsignaturaScreen() {
  // El nombre del archivo [id] crea una ruta dinámica; aquí se lee ese parámetro.
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Asignatura e historial desde el estado compartido (incluye las recién creadas)
  const { asignaturas, clasesPorAsignatura } = useClases();
  const asignatura = asignaturas.find((a) => a.id === id) || asignaturas[0];
  const clases = clasesPorAsignatura[asignatura.id] || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.contenedor}>
        <BarraSuperior textoVolver="Asignaturas" />

        <Text style={styles.titulo}>{asignatura.nombre}</Text>
        <Text style={styles.meta}>
          Sala {asignatura.sala} · {asignatura.profesor}
        </Text>
        <Text style={styles.meta}>{asignatura.horario}</Text>

        <Text style={styles.rotulo}>HISTORIAL DE CLASES</Text>

        {clases.length === 0 ? (
          <View style={styles.vacio}>
            <View style={styles.circuloVacio}>
              <Inbox size={36} strokeWidth={2} color={COLORES.azul} />
            </View>
            <Text style={styles.tituloVacio}>Aún no hay clases guardadas</Text>
            <Text style={styles.textoVacio}>
              Cuando traduzcas una clase, aparecerá aquí para que la repases.
            </Text>
            <Boton
              etiqueta="Ir a traducir ahora"
              tipo="secundario"
              onPress={() =>
                router.push({ pathname: '/(tabs)/traducir', params: { asignaturaId: asignatura.id } })
              }
            />
          </View>
        ) : (
          <FlatList
            data={clases}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Tarjeta
                titulo={item.fecha}
                detalle={`${item.duracion} · ${item.palabras.toLocaleString('es-CL')} palabras`}
                Icono={Clock}
                onPress={() => router.push(`/clase/${item.id}`)}
              />
            )}
          />
        )}

        <View style={styles.accionInferior}>
          <Boton
            etiqueta="Traducir esta clase"
            tipo="primario"
            Icono={Hand}
            onPress={() =>
                router.push({ pathname: '/(tabs)/traducir', params: { asignaturaId: asignatura.id } })
              }
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
    paddingBottom: 14,
  },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta, marginBottom: 6 },
  meta: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  rotulo: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.tintaSuave,
    marginTop: 18,
    marginBottom: 10,
  },
  lista: { gap: 12, paddingBottom: 16 },
  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  circuloVacio: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORES.azulSuave,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tituloVacio: { ...TIPOGRAFIA.subtitulo, color: COLORES.tinta, textAlign: 'center' },
  textoVacio: {
    ...TIPOGRAFIA.cuerpo,
    color: COLORES.tintaSuave,
    textAlign: 'center',
    marginBottom: 8,
  },
  accionInferior: { paddingTop: 8 },
});
