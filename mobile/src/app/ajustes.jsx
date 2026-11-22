/**
 * PANTALLA 11 · AJUSTES · ruta "/ajustes" (se abre desde Asignaturas)
 * - Estado local de cada interruptor y de la velocidad (useState).
 * - Cerrar sesión -> router.replace('/') vuelve al Acceso.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ALargeSmall, Captions, Vibrate, Gauge, Globe, LogOut } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { BarraSuperior } from '../components/BarraSuperior';
import { FilaAjuste } from '../components/FilaAjuste';
import { Tarjeta } from '../components/Tarjeta';
import { Aviso } from '../components/Aviso';
import { Boton } from '../components/Boton';

const VELOCIDADES = ['0.75x (lenta)', '1x (normal)', '1.5x (rápida)'];

// Pantalla 11 · Ajustes (Figma). Se abre desde el botón de ajustes de Asignaturas.
export default function AjustesScreen() {
  const router = useRouter();

  // Estado local de cada ajuste: al cambiar, React vuelve a dibujar la pantalla
  const [textoGrande, setTextoGrande] = useState(false);
  const [subtitulos, setSubtitulos] = useState(true);
  const [vibrar, setVibrar] = useState(true);
  const [indiceVelocidad, setIndiceVelocidad] = useState(1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.contenedor}>
        <BarraSuperior textoVolver="Inicio" />

        <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>Ajustes</Text>

          <FilaAjuste
            titulo="Texto grande"
            detalle="Subtítulos más fáciles de leer"
            Icono={ALargeSmall}
            valor={textoGrande}
            onCambiar={setTextoGrande}
          />
          <FilaAjuste
            titulo="Mostrar subtítulos"
            detalle="Texto bajo las señas"
            Icono={Captions}
            valor={subtitulos}
            onCambiar={setSubtitulos}
          />
          <FilaAjuste
            titulo="Vibrar al detectar voz"
            detalle="Aviso cuando alguien habla"
            Icono={Vibrate}
            valor={vibrar}
            onCambiar={setVibrar}
          />

          {/* Al tocar, rota entre las tres velocidades */}
          <Tarjeta
            titulo="Velocidad de las señas"
            detalle={VELOCIDADES[indiceVelocidad]}
            Icono={Gauge}
            onPress={() => setIndiceVelocidad((prev) => (prev + 1) % VELOCIDADES.length)}
          />
          <Tarjeta
            titulo="Idioma de la voz"
            detalle="Español de Chile (es-CL)"
            Icono={Globe}
            mostrarChevron={false}
          />

          <Aviso
            tipo="info"
            mensaje="SeñaCampus es un apoyo. No reemplaza a un intérprete de LSCh."
          />
        </ScrollView>

        <View style={styles.accionInferior}>
          <Boton
            etiqueta="Cerrar sesión"
            tipo="secundario"
            Icono={LogOut}
            onPress={() => router.replace('/')}
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
  lista: { gap: 12, paddingBottom: 16 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta, marginBottom: 4 },
  accionInferior: { paddingTop: 8 },
});
