/**
 * PANTALLA 6 · DETALLE DE ASIGNATURA · ruta dinámica "/asignatura/[id]"
 * - Recibe el id con useLocalSearchParams (ej. /asignatura/twm -> id = 'twm').
 * - Datos: la asignatura y su historial desde el Context.
 * - Interacción: abrir una clase (/clase/[id]) o "Traducir esta clase" con el id como parámetro.
 */
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Hand, Inbox } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { useClases } from '../../context/ClasesContext';
import { BarraSuperior } from '../../components/BarraSuperior';
import { Tarjeta } from '../../components/Tarjeta';
import { Boton } from '../../components/Boton';
import { Pantalla, BandaEncabezado, RotuloSeccion, PanelAcciones } from '../../components/Secciones';

export default function DetalleAsignaturaScreen() {
  // El nombre del archivo [id] crea una ruta dinámica; aquí se lee ese parámetro.
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Asignatura e historial desde el estado compartido (incluye las recién creadas)
  const { asignaturas, clasesPorAsignatura } = useClases();
  const asignatura = asignaturas.find((a) => a.id === id) || asignaturas[0];
  const clases = clasesPorAsignatura[asignatura.id] || [];

  return (
    <Pantalla>
      <View style={styles.contenedor}>
        {/* 1. Encabezado: datos de la asignatura */}
        <BandaEncabezado style={styles.banda}>
          <BarraSuperior textoVolver="Asignaturas" />
          <Text style={styles.titulo}>{asignatura.nombre}</Text>
          <Text style={styles.meta}>
            Sala {asignatura.sala} · {asignatura.profesor}
          </Text>
          <Text style={styles.meta}>{asignatura.horario}</Text>
        </BandaEncabezado>

        {/* 2. Contenido: historial */}
        <RotuloSeccion texto="HISTORIAL DE CLASES" />

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

        {/* 3. Acción principal */}
        <PanelAcciones>
          <Boton
            etiqueta="Traducir esta clase"
            tipo="primario"
            Icono={Hand}
            onPress={() =>
                router.push({ pathname: '/(tabs)/traducir', params: { asignaturaId: asignatura.id } })
              }
          />
        </PanelAcciones>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingBottom: 14,
    gap: 14,
  },
  banda: { paddingTop: 0 }, // la barra superior ya da el aire de arriba
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  meta: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
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
});
