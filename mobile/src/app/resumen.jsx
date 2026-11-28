/**
 * PANTALLA 9 · RESUMEN DE SESIÓN · ruta "/resumen?claseId=..."
 * - Recibe el id de la clase recién guardada como parámetro.
 * - Datos: la clase desde el Context (buscarClase).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, Clock, Type } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';
import { Pantalla, BandaEncabezado, RotuloSeccion, PanelAcciones } from '../components/Secciones';
import { useClases } from '../context/ClasesContext';

export default function ResumenScreen() {
  const router = useRouter();
  // El id de la clase llega como parámetro desde Traducir
  const { claseId } = useLocalSearchParams();
  const { buscarClase } = useClases();
  const clase = buscarClase(claseId) || buscarClase('c18');
  const deletreadas = clase.deletreadas || [];

  return (
    <Pantalla>
      <View style={styles.contenedor}>
        {/* 1. Encabezado: confirmación */}
        <BandaEncabezado style={styles.banda}>
          <View style={styles.circuloExito}>
            <Check size={44} strokeWidth={2.5} color={COLORES.exito} />
          </View>

          <Text style={styles.titulo}>¡Clase guardada!</Text>
          <Text style={styles.nombreClase}>{clase.fecha}</Text>
          <Text style={styles.subtitulo}>
            Ya puedes repasarla cuando quieras, incluso sin conexión.
          </Text>
        </BandaEncabezado>

        {/* 2. Contenido: datos de la clase */}
        <View style={styles.contenido}>
          <RotuloSeccion texto="RESUMEN DE LA CLASE" />
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

        {/* 3. Acciones */}
        <PanelAcciones>
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
        </PanelAcciones>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingBottom: 16,
    gap: 16,
  },
  banda: { paddingTop: 24, gap: 8 },
  contenido: { flex: 1, gap: 12 },
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
  subtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  tarjetas: { gap: 12 },
});
