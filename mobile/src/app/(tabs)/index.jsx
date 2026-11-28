/**
 * PANTALLA 5 · ASIGNATURAS (inicio) · ruta "/(tabs)"
 * - Datos: asignaturas y clases desde el Context (useClases); nombre desde USUARIO.
 * - Interacción: tocar una tarjeta -> router.push a /asignatura/[id];
 *   botón "Agregar asignatura" -> <Link> a /nueva-asignatura; ajustes -> /ajustes.
 */
import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { BookOpen, Hand, SlidersHorizontal, Plus } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { USUARIO } from '../../data/mockData';
import { Aviso } from '../../components/Aviso';
import { Tarjeta } from '../../components/Tarjeta';
import { Boton } from '../../components/Boton';
import { BandaEncabezado, RotuloSeccion, PanelAcciones } from '../../components/Secciones';
import { useClases } from '../../context/ClasesContext';

export default function AsignaturasScreen() {
  const router = useRouter();
  // El contador de clases sale del estado compartido: sube al guardar una clase
  const { asignaturas, clasesPorAsignatura, ultimaAsignaturaId } = useClases();
  // "Retomar…" abre la última asignatura que se tradujo (si todavía existe)
  const ultima = asignaturas.find((a) => a.id === ultimaAsignaturaId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.contenedor}>
        {/* 1. Encabezado (franja de color): saludo, ajustes y próxima clase */}
        <BandaEncabezado>
          <View style={styles.encabezado}>
            {/* El nombre viene de data/mockData.js (USUARIO), no está escrito a mano */}
            <Text style={styles.titulo}>Hola, {USUARIO.nombre}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ajustes"
              // router.push: navega por código y apila la pantalla de Ajustes.
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
          <Aviso tipo="info" mensaje="Próxima clase: Tecnologías Web y Móviles, hoy a las 10:15." />
        </BandaEncabezado>

        {/* 2. Contenido: lo más usado (tus asignaturas) arriba; "Agregar" al final de la lista,
            porque se usa pocas veces y es donde aparecerá la asignatura nueva */}
        <RotuloSeccion texto="TUS ASIGNATURAS" style={styles.rotulo} />

        {/* FlatList: lista que puede crecer; solo dibuja lo visible (mejor que ScrollView + .map). */}
        <FlatList
          data={asignaturas}
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
          ListFooterComponent={
            /* <Link>: navegación declarativa (como un enlace). asChild hace que el Pressable sea el enlace.
               La otra forma es router.push(...) por código, como en las tarjetas.
               Ojo: con asChild, Link descarta los estilos escritos como función ({ pressed }) => …,
               por eso el fondo azul va en un estilo fijo y el efecto al presionar va en el contenido. */
            <Link href="/nueva-asignatura" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Agregar asignatura"
                style={styles.botonAgregar}
                android_ripple={{ color: COLORES.azulSuave }}
              >
                {({ pressed }) => (
                  <View style={[styles.contenidoAgregar, pressed && styles.botonAgregarPresionado]}>
                    <Plus size={22} strokeWidth={2.5} color={COLORES.blanco} />
                    <Text style={styles.textoAgregar}>Agregar asignatura</Text>
                  </View>
                )}
              </Pressable>
            </Link>
          }
        />

        {/* 3. Acción principal en su propio panel */}
        {ultima && (
          <PanelAcciones>
            <Boton
              etiqueta={`Retomar ${ultima.nombre}`}
              tipo="primario"
              Icono={Hand}
              onPress={() =>
                router.push({ pathname: '/(tabs)/traducir', params: { asignaturaId: ultima.id } })
              }
            />
          </PanelAcciones>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // El área superior toma el color de la franja; el resto de la pantalla es crema
  safeArea: { flex: 1, backgroundColor: COLORES.cremaEncabezado },
  // Flexbox: flex: 1 ocupa todo el alto; los hijos van en columna (dirección por defecto).
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.crema,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingBottom: 14,
    gap: 14,
  },
  // Fila: título a la izquierda y botón a la derecha (space-between).
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  subtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave, marginBottom: 6 },
  rotulo: { marginTop: 4 },
  // Botón azul sólido al final de la lista (blanco sobre azul: contraste 10:1)
  botonAgregar: {
    height: MEDIDAS.altos.boton, // mismo alto que los demás botones (54)
    borderRadius: MEDIDAS.radios.boton,
    backgroundColor: COLORES.azul,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // la onda de Android queda dentro de las esquinas redondeadas
  },
  contenidoAgregar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botonAgregarPresionado: { opacity: 0.7 },
  textoAgregar: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.blanco },
  lista: { gap: 12, paddingBottom: 4 },
});
