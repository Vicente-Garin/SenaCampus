/**
 * PANTALLA 11 · AJUSTES · ruta "/ajustes" (se abre desde Asignaturas)
 * - Estado local de cada interruptor y de la velocidad (useState).
 * - Cerrar sesión -> router.replace('/') vuelve al Acceso.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
import { Pantalla, BandaEncabezado, RotuloSeccion, PanelAcciones } from '../components/Secciones';

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
    <Pantalla>
      <View style={styles.contenedor}>
        {/* 1. Encabezado */}
        <BandaEncabezado style={styles.banda}>
          <BarraSuperior textoVolver="Inicio" />
          <Text style={styles.titulo}>Ajustes</Text>
        </BandaEncabezado>

        {/* 2. Contenido agrupado por secciones */}
        <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
          <RotuloSeccion texto="ACCESIBILIDAD" />
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

          <RotuloSeccion texto="SEÑAS Y VOZ" style={styles.rotulo} />
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

        {/* 3. Acciones */}
        <PanelAcciones>
          <Boton
            etiqueta="Cerrar sesión"
            tipo="secundario"
            Icono={LogOut}
            onPress={() => router.replace('/')}
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
  rotulo: { marginTop: 8 },
  lista: { gap: 12, paddingBottom: 16 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
});
