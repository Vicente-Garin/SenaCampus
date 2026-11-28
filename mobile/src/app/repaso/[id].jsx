/**
 * PANTALLA · REPASO DE UNA CLASE · ruta dinámica "/repaso/[id]"
 * Reproduce una clase guardada DESDE EL PRINCIPIO, como un video:
 * - Recorre la transcripción frase por frase y muestra sus señas en el visor.
 * - Controles: reproducir/pausar, frase anterior/siguiente, volver al inicio y velocidad.
 * - Las señas se piden al traductor del backend al abrir la pantalla; si no hay conexión,
 *   cada palabra se muestra deletreada para que el repaso igual funcione.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { useClases } from '../../context/ClasesContext';
import { traducirTexto } from '../../services/api';
import { BarraSuperior } from '../../components/BarraSuperior';
import { VisorSenas } from '../../components/VisorSenas';
import { Chip } from '../../components/Chip';
import { Aviso } from '../../components/Aviso';
import { Pantalla, BandaEncabezado, RotuloSeccion, PanelAcciones } from '../../components/Secciones';

const VELOCIDADES = ['0.75x', '1x', '1.5x'];
const FACTOR_VELOCIDAD = [0.75, 1, 1.5];
const MS_POR_SENA = 1400; // a velocidad 1x (igual que Traducir)

// Si no hay servidor: cada palabra pasa como deletreo
const senasSinServidor = (texto) =>
  texto
    .replace(/[¿?¡!.,;:]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra, i) => ({ id: `local-${i}`, termino: palabra, tipo: 'dactilologia', deletreo: palabra.split('') }));

export default function RepasoClaseScreen() {
  const { id } = useLocalSearchParams();
  const { transcripciones, buscarClase } = useClases();
  const clase = buscarClase(id);
  const fragmentos = useMemo(() => transcripciones[id] || [], [transcripciones, id]);

  // pasos = cada seña de la clase, en orden: [{ frase, sena }]
  const [pasos, setPasos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [sinServidor, setSinServidor] = useState(false);
  const [indice, setIndice] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [indiceVelocidad, setIndiceVelocidad] = useState(1);

  // 1. Traduce todas las frases de la clase una sola vez
  useEffect(() => {
    let activo = true;
    (async () => {
      const resultado = [];
      let fallo = false;
      for (let f = 0; f < fragmentos.length; f += 1) {
        let senas;
        try {
          senas = await traducirTexto(fragmentos[f].texto);
        } catch {
          fallo = true;
          senas = senasSinServidor(fragmentos[f].texto);
        }
        senas.forEach((sena) => resultado.push({ frase: f, sena }));
      }
      if (!activo) return;
      setPasos(resultado);
      setSinServidor(fallo);
      setCargando(false);
      setReproduciendo(resultado.length > 0); // empieza solo, como un video
    })();
    return () => {
      activo = false;
    };
  }, [fragmentos]);

  // 2. Avanza seña por seña mientras se reproduce
  useEffect(() => {
    if (!reproduciendo || pasos.length === 0) return undefined;
    if (indice >= pasos.length - 1) {
      // Última seña: se deja ver un momento y se detiene
      const fin = setTimeout(() => setReproduciendo(false), MS_POR_SENA);
      return () => clearTimeout(fin);
    }
    const sena = pasos[indice].sena;
    const letras = sena.tipo === 'dactilologia' ? Math.max(sena.deletreo?.length || 1, 2) : 1;
    const espera = (MS_POR_SENA * Math.min(letras, 4)) / FACTOR_VELOCIDAD[indiceVelocidad];
    const t = setTimeout(() => setIndice((i) => i + 1), espera);
    return () => clearTimeout(t);
  }, [reproduciendo, indice, pasos, indiceVelocidad]);

  if (!clase) {
    return (
      <Pantalla>
        <View style={styles.contenedor}>
          <BarraSuperior textoVolver="Transcripción" />
          <Aviso tipo="info" mensaje="Esta clase ya no existe o fue eliminada." />
        </View>
      </Pantalla>
    );
  }

  const paso = pasos[indice];
  const fraseActual = paso ? paso.frase : 0;
  const terminado = !reproduciendo && pasos.length > 0 && indice >= pasos.length - 1;
  const progreso = pasos.length > 1 ? indice / (pasos.length - 1) : 0;

  // Salta al inicio de una frase (anterior o siguiente)
  const irAFrase = (f) => {
    const destino = pasos.findIndex((p) => p.frase === f);
    if (destino !== -1) setIndice(destino);
  };

  const alternar = () => {
    if (terminado) setIndice(0); // al terminar, el botón vuelve a empezar
    setReproduciendo((r) => !r || terminado);
  };

  const estadoVisor = cargando ? 'cargando' : paso?.sena.tipo === 'dactilologia' ? 'deletreo' : 'senando';

  return (
    <Pantalla>
      <View style={styles.contenedor}>
        {/* 1. Encabezado */}
        <BandaEncabezado style={styles.banda}>
          <BarraSuperior textoVolver="Transcripción" />
          <Text style={styles.titulo}>Repaso de la clase</Text>
          <Text style={styles.meta}>{clase.fecha} · {clase.duracion}</Text>
        </BandaEncabezado>

        {fragmentos.length === 0 ? (
          <Aviso
            tipo="info"
            mensaje="Esta clase de ejemplo no tiene la transcripción cargada. Las clases que traduzcas sí se pueden repasar."
          />
        ) : (
          <ScrollView contentContainerStyle={styles.cuerpo} showsVerticalScrollIndicator={false}>
            {sinServidor && (
              <Aviso tipo="advertencia" mensaje="Sin conexión con el servidor: las palabras se muestran deletreadas." />
            )}

            {/* 2. Visor de señas */}
            <VisorSenas
              estado={estadoVisor}
              senaActual={paso ? paso.sena.termino.toUpperCase() : '—'}
              alto={200}
            />

            {/* Barra de avance */}
            <View style={styles.barraAvance} accessibilityLabel={`Avance ${Math.round(progreso * 100)} %`}>
              <View style={[styles.rellenoAvance, { width: `${progreso * 100}%` }]} />
            </View>
            <Text style={styles.contador}>
              {cargando ? 'Preparando el repaso…' : `Frase ${fraseActual + 1} de ${fragmentos.length}`}
              {terminado ? ' · Fin del repaso' : ''}
            </Text>

            {/* 3. Subtítulos: la frase actual destacada, las demás atenuadas */}
            <RotuloSeccion texto="SUBTÍTULOS" />
            <View style={styles.cajaSubtitulos}>
              {fragmentos.map((frag, f) => (
                <Pressable
                  key={f}
                  onPress={() => irAFrase(f)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ir a la frase ${f + 1}: ${frag.texto}`}
                  style={[styles.frase, f === fraseActual && styles.fraseActual]}
                >
                  <Text style={styles.hora}>{frag.hora}</Text>
                  <Text style={[styles.textoFrase, f !== fraseActual && styles.textoAtenuado]}>{frag.texto}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        {/* 4. Controles como un reproductor */}
        {fragmentos.length > 0 && (
          <PanelAcciones>
            <View style={styles.filaReproductor}>
              <BotonControl Icono={RotateCcw} etiqueta="Volver al inicio" onPress={() => setIndice(0)} deshabilitado={cargando} />
              <BotonControl Icono={SkipBack} etiqueta="Frase anterior" onPress={() => irAFrase(Math.max(0, fraseActual - 1))} deshabilitado={cargando} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={reproduciendo ? 'Pausar' : terminado ? 'Repetir desde el inicio' : 'Reproducir'}
                disabled={cargando}
                onPress={alternar}
                style={({ pressed }) => [styles.botonPlay, pressed && styles.botonPlayPresionado, cargando && styles.deshabilitado]}
              >
                {reproduciendo
                  ? <Pause size={30} strokeWidth={2} color={COLORES.blanco} />
                  : <Play size={30} strokeWidth={2} color={COLORES.blanco} />}
              </Pressable>
              <BotonControl
                Icono={SkipForward}
                etiqueta="Frase siguiente"
                onPress={() => irAFrase(Math.min(fragmentos.length - 1, fraseActual + 1))}
                deshabilitado={cargando}
              />
              <View style={styles.espacioControl} />
            </View>
            <Chip
              texto={`Velocidad ${VELOCIDADES[indiceVelocidad]}`}
              Icono={Gauge}
              onPress={() => setIndiceVelocidad((v) => (v + 1) % VELOCIDADES.length)}
              style={styles.chipVelocidad}
            />
          </PanelAcciones>
        )}
      </View>
    </Pantalla>
  );
}

function BotonControl({ Icono, etiqueta, onPress, deshabilitado }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [styles.botonControl, pressed && { backgroundColor: COLORES.azulSuave }, deshabilitado && styles.deshabilitado]}
    >
      <Icono size={24} strokeWidth={2} color={COLORES.tinta} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingBottom: 14,
    gap: 12,
  },
  banda: { paddingTop: 0 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  meta: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  cuerpo: { gap: 12, paddingBottom: 8 },
  barraAvance: { height: 8, borderRadius: 4, backgroundColor: COLORES.borde, overflow: 'hidden' },
  rellenoAvance: { height: '100%', backgroundColor: COLORES.coral },
  contador: { ...TIPOGRAFIA.secundario, color: COLORES.tintaSuave, marginTop: -4 },
  cajaSubtitulos: {
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 8,
    gap: 4,
  },
  frase: { padding: 10, borderRadius: 14, gap: 2 },
  fraseActual: { backgroundColor: COLORES.azulSuave },
  hora: { ...TIPOGRAFIA.etiqueta, color: COLORES.tintaSuave },
  textoFrase: { ...TIPOGRAFIA.cuerpo, color: COLORES.tinta },
  textoAtenuado: { color: COLORES.tintaSuave },
  filaReproductor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  botonControl: {
    width: MEDIDAS.altos.tactilMin + 4,
    height: MEDIDAS.altos.tactilMin + 4,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  espacioControl: { width: MEDIDAS.altos.tactilMin + 4 },
  botonPlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORES.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonPlayPresionado: { backgroundColor: COLORES.coralTexto },
  chipVelocidad: { alignSelf: 'center' },
  deshabilitado: { opacity: 0.4 },
});
