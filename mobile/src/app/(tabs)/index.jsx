import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Hand, SlidersHorizontal } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { ASIGNATURAS, USUARIO } from '../../data/mockData';
import { Aviso } from '../../components/Aviso';
import { Tarjeta } from '../../components/Tarjeta';
import { Boton } from '../../components/Boton';
import { useClases } from '../../context/ClasesContext';

export default function AsignaturasScreen() {
  const router = useRouter();
  // El contador de clases sale del estado compartido: sube al guardar una clase
  const { clasesPorAsignatura } = useClases();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          {/* El nombre viene de data/mockData.js (USUARIO), no está escrito a mano */}
          <Text style={styles.titulo}>Hola, {USUARIO.nombre}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajustes"
            onPress={() => router.push('/ajustes')}
            hitSlop={4}
            style={({ pressed }) => [
              styles.botonAjustes,
              pressed && { backgroundColor: COLORES.azulSuave },
            ]}
          >
            <SlidersHorizontal size={22} strokeWidth={2} color={COLORES.tinta} />
          </Pressable>
        </View>

        <Text style={styles.subtitulo}>¿Qué clase vas a seguir hoy?</Text>

        <Aviso
          tipo="info"
          mensaje="Próxima clase: Tecnologías Web y Móviles, hoy a las 10:15."
          style={styles.aviso}
        />

        <Text style={styles.rotulo}>TUS ASIGNATURAS</Text>

        <FlatList
          data={ASIGNATURAS}
          keyExtractor={(item) => item.id}
          extraData={clasesPorAsignatura}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Tarjeta
              titulo={item.nombre}
              detalle={`${item.sala} · ${(clasesPorAsignatura[item.id] || []).length} clases guardadas`}
              Icono={BookOpen}
              onPress={() => router.push(`/asignatura/${item.id}`)}
            />
          )}
        />

        <View style={styles.accionInferior}>
          <Boton
            etiqueta="Retomar Tecnologías Web"
            tipo="primario"
            Icono={Hand}
            onPress={() =>
              router.push({ pathname: '/(tabs)/traducir', params: { asignaturaId: 'twm' } })
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
    paddingTop: 12,
    paddingBottom: 14,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  botonAjustes: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.borde,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitulo: {
    ...TIPOGRAFIA.cuerpo,
    color: COLORES.tintaSuave,
    marginBottom: 14,
  },
  aviso: { marginBottom: 18 },
  rotulo: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.tintaSuave,
    marginBottom: 10,
  },
  lista: { gap: 12, paddingBottom: 16 },
  accionInferior: { paddingTop: 8 },
});
