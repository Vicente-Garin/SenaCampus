/**
 * PANTALLA 8 · TRADUCCIÓN EN CLASE (+ 18 · elegir clase) · ruta "/(tabs)/traducir"
 * - Si no llega asignaturaId, primero pregunta qué clase traducir (pantalla 18).
 * - Voz a texto real con useVozATexto (es-CL): subtítulo en vivo mientras el docente habla.
 * - Cada frase terminada se envía al backend (traducirTexto) y sus glosas pasan al visor de señas.
 * - En Expo Go no existe el reconocimiento de voz: se muestra una simulación y un aviso.
 * - Terminar -> confirmación -> espera la última frase -> guardarClase() -> /resumen.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Mic, MicOff, RotateCcw, Gauge, Pause, Play, Square, BookOpen } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { SUBTITULOS_EN_VIVO } from '../../data/mockData';
import { useClases } from '../../context/ClasesContext';
import { useVozATexto } from '../../hooks/useVozATexto';
import { traducirTexto } from '../../services/api';
import { Chip } from '../../components/Chip';
import { VisorSenas } from '../../components/VisorSenas';
import { Boton } from '../../components/Boton';
import { Aviso } from '../../components/Aviso';
import { VentanaConfirmacion } from '../../components/VentanaConfirmacion';
import { Tarjeta } from '../../components/Tarjeta';

const VELOCIDADES = ['0.75x', '1x', '1.5x'];
const FACTOR_VELOCIDAD = [0.75, 1, 1.5];
const MS_POR_SENA = 1400; // a velocidad 1x
const MAX_SENAS_EN_COLA = 12;

// Hora actual en formato 10:32
const horaActual = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// "mañana hay prueba" -> "Mañana hay prueba."
const comoFrase = (texto) => {
  const t = texto.replace(/^…/, '').trim();
  if (!t) return t;
  const conMayuscula = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(conMayuscula) ? conMayuscula : `${conMayuscula}.`;
};

// Quita tildes para comparar palabras con los términos del diccionario
const sinTildes = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function TraducirScreen() {
  const router = useRouter();
  const { guardarClase, asignaturas, setUltimaAsignaturaId } = useClases();
  const navigation = useNavigation();

  // La asignatura llega como parámetro desde Asignaturas o desde el Detalle
  const { asignaturaId } = useLocalSearchParams();
  const asignatura = asignaturas.find((a) => a.id === asignaturaId) || asignaturas[0];
  // Sin asignatura elegida no se traduce: primero se pregunta qué clase es
  const hayClaseElegida = !!asignaturaId;

  // useRef guarda datos que NO necesitan redibujar la pantalla
  const inicioRef = useRef(Date.now());
  const fragmentosRef = useRef([]); // [{ hora, marcaTiempo, texto, claves, glosas }]
  const deletreadasRef = useRef(new Set());

  const [escuchando, setEscuchando] = useState(true); // intención del usuario (Pausar / Reanudar)
  const [indiceVelocidad, setIndiceVelocidad] = useState(1); // 1x por defecto
  const [ultimaFrase, setUltimaFrase] = useState('');
  const [palabrasConSena, setPalabrasConSena] = useState([]); // se resaltan en el subtítulo
  const [colaSenas, setColaSenas] = useState([]); // [{ id, termino, tipo, deletreo }]
  const [indiceSena, setIndiceSena] = useState(0);
  const [traduciendo, setTraduciendo] = useState(false);
  const [sinServidor, setSinServidor] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [indiceSimulado, setIndiceSimulado] = useState(0);

  // Cada frase terminada: se guarda en la transcripción y se traduce a señas
  const alTerminarFrase = useCallback(async (textoReconocido) => {
    const texto = comoFrase(textoReconocido);
    if (!texto) return;
    const fragmento = { hora: horaActual(), marcaTiempo: new Date().toISOString(), texto, claves: [], glosas: [] };
    fragmentosRef.current.push(fragmento);
    setUltimaFrase(texto);

    setTraduciendo(true);
    try {
      const glosas = await traducirTexto(texto);
      setSinServidor(false);
      fragmento.glosas = glosas.map((g) => g.id);
      fragmento.claves = glosas.filter((g) => g.tipo !== 'dactilologia').map((g) => g.termino);
      glosas.filter((g) => g.tipo === 'dactilologia').forEach((g) => deletreadasRef.current.add(g.termino));
      setPalabrasConSena(fragmento.claves.map(sinTildes));
      setColaSenas((prev) => {
        const nueva = [...prev, ...glosas].slice(-MAX_SENAS_EN_COLA);
        // salta a la primera seña de la frase nueva
        setIndiceSena(Math.max(0, nueva.length - glosas.length));
        return nueva;
      });
    } catch {
      // Sin backend la clase igual se transcribe: las señas se agregan cuando vuelva la conexión
      setSinServidor(true);
    } finally {
      setTraduciendo(false);
    }
  }, []);

  const voz = useVozATexto({ onFraseFinal: alTerminarFrase });

  // Empieza o pausa el micrófono según el botón y si hay una clase elegida
  useEffect(() => {
    if (!voz.disponible || !hayClaseElegida) return;
    if (escuchando) voz.iniciar();
    else voz.pausar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escuchando, hayClaseElegida, voz.disponible]);

  // Si el micrófono falló por un error que el usuario debe resolver, el botón pasa a "Reanudar"
  useEffect(() => {
    if (voz.estado === 'error') setEscuchando(false);
  }, [voz.estado]);

  // Modo simulación (Expo Go): avanza los subtítulos de ejemplo cada 1,5 s
  useEffect(() => {
    if (voz.disponible || !escuchando || !hayClaseElegida) return undefined;
    const intervalo = setInterval(() => {
      setIndiceSimulado((prev) => {
        const siguiente = (prev + 1) % SUBTITULOS_EN_VIVO.length;
        if (siguiente === SUBTITULOS_EN_VIVO.length - 1) alTerminarFrase(SUBTITULOS_EN_VIVO[siguiente]);
        return siguiente;
      });
    }, 1500);
    return () => clearInterval(intervalo);
  }, [voz.disponible, escuchando, hayClaseElegida, alTerminarFrase]);

  // El visor avanza por la cola de señas según la velocidad elegida
  useEffect(() => {
    if (colaSenas.length === 0 || indiceSena >= colaSenas.length - 1) return undefined;
    const sena = colaSenas[indiceSena];
    const letras = sena?.tipo === 'dactilologia' ? Math.max(sena.deletreo?.length || 1, 2) : 1;
    const espera = (MS_POR_SENA * Math.min(letras, 4)) / FACTOR_VELOCIDAD[indiceVelocidad];
    const t = setTimeout(() => setIndiceSena((i) => Math.min(i + 1, colaSenas.length - 1)), espera);
    return () => clearTimeout(t);
  }, [indiceSena, colaSenas, indiceVelocidad]);

  // Recuerda la asignatura elegida para el botón "Retomar…" de la pantalla Asignaturas
  useEffect(() => {
    if (hayClaseElegida) setUltimaAsignaturaId(asignatura.id);
  }, [hayClaseElegida, asignatura.id, setUltimaAsignaturaId]);

  // Si cambia la asignatura, empieza una sesión nueva
  useEffect(() => {
    inicioRef.current = Date.now();
    fragmentosRef.current = [];
    deletreadasRef.current = new Set();
    setUltimaFrase('');
    setColaSenas([]);
    setIndiceSena(0);
  }, [asignatura.id]);

  // Al salir de Traducir sin terminar, se olvida la asignatura elegida.
  // useFocusEffect ejecuta la limpieza (return) cuando la pantalla pierde el foco.
  useFocusEffect(
    useCallback(() => {
      setEscuchando(true);
      return () => {
        setEscuchando(false);
        navigation.setParams({ asignaturaId: undefined });
      };
    }, [navigation])
  );

  // Guarda la clase en el estado compartido y abre el resumen de ESA clase
  const terminarYGuardar = async () => {
    setModalVisible(false);
    await voz.detener(); // espera la última frase que se estaba reconociendo
    const segundos = (Date.now() - inicioRef.current) / 1000;
    const fragmentos = fragmentosRef.current.length
      ? fragmentosRef.current
      : [{ hora: horaActual(), marcaTiempo: new Date().toISOString(), texto: 'No se reconoció voz durante esta clase.', claves: [], glosas: [] }];
    const id = guardarClase({
      asignaturaId: asignatura.id,
      fragmentos,
      segundos,
      deletreadas: [...deletreadasRef.current],
    });

    // Reinicia la sesión para la próxima clase
    inicioRef.current = Date.now();
    fragmentosRef.current = [];
    deletreadasRef.current = new Set();
    setUltimaFrase('');
    setColaSenas([]);
    setIndiceSena(0);
    // Se borra la asignatura elegida: la próxima vez la pestaña vuelve a preguntar
    navigation.setParams({ asignaturaId: undefined });
    router.push({ pathname: '/resumen', params: { claseId: id } });
  };

  // Resalta en el subtítulo las palabras que tienen seña en el diccionario
  const renderizarSubtitulo = (texto) => {
    if (palabrasConSena.length === 0 || texto === voz.textoParcial) return texto;
    return texto.split(/(\s+)/).map((parte, idx) => {
      const limpia = sinTildes(parte.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ]/g, ''));
      const conSena = limpia && palabrasConSena.some((p) => p === limpia || `${p}s` === limpia);
      return conSena ? (
        <Text key={idx} style={styles.claveSubtitulo}>{parte}</Text>
      ) : (
        <Text key={idx}>{parte}</Text>
      );
    });
  };

  const rotarVelocidad = () => setIndiceVelocidad((prev) => (prev + 1) % VELOCIDADES.length);

  // Pantalla de selección: aparece si se entra a la pestaña sin elegir una clase
  if (!hayClaseElegida) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.contenedor}>
          <Text style={styles.tituloSeleccion}>¿Qué clase vas a traducir?</Text>
          <Text style={styles.textoSeleccion}>
            Elige la asignatura para guardar la transcripción en su historial.
          </Text>
          <FlatList
            data={asignaturas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listaSeleccion}
            renderItem={({ item }) => (
              <Tarjeta
                titulo={item.nombre}
                detalle={`Sala ${item.sala} · ${item.horario}`}
                Icono={BookOpen}
                onPress={() => navigation.setParams({ asignaturaId: item.id })}
              />
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Lo que se muestra en el subtítulo y en el chip de estado
  const subtitulo = voz.disponible
    ? voz.textoParcial || ultimaFrase || (escuchando ? 'Esperando que hable el docente…' : 'Micrófono en pausa.')
    : SUBTITULOS_EN_VIVO[indiceSimulado];
  const textoEstado = !escuchando
    ? 'En pausa'
    : !voz.disponible
      ? 'Simulación · sin micrófono'
      : voz.estado === 'iniciando'
        ? 'Activando micrófono…'
        : `Escuchando · ${voz.idioma}`;
  const senaActual = colaSenas[indiceSena];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.contenedor}>
        {/* Parte central desplazable: en pantallas chicas nada queda oculto ni se corta */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contenidoScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titulo}>{asignatura.nombre}</Text>

          <View style={styles.filaEstado}>
            <Chip
              texto={textoEstado}
              estado={escuchando ? 'activo' : 'normal'}
              Icono={escuchando ? Mic : MicOff}
            />
            {/* Barra de volumen: muestra que el micrófono está captando la voz */}
            {voz.disponible && escuchando && (
              <View style={styles.barraVolumen} accessibilityLabel="Nivel del micrófono">
                <View style={[styles.nivelVolumen, { width: `${Math.round(voz.volumen * 100)}%` }]} />
              </View>
            )}
          </View>

          {!voz.disponible && (
            <Aviso
              tipo="info"
              mensaje="El reconocimiento de voz funciona en la app instalada (no en Expo Go). Mientras, se muestra una simulación."
            />
          )}
          {voz.error && <Aviso tipo={voz.error.codigo === 'network' ? 'advertencia' : 'error'} mensaje={voz.error.mensaje} />}
          {sinServidor && (
            <Aviso tipo="advertencia" mensaje="Sin conexión con el servidor: los subtítulos se guardan, pero sin señas por ahora." />
          )}

          <VisorSenas
            estado={traduciendo && !senaActual ? 'cargando' : senaActual?.tipo === 'dactilologia' ? 'deletreo' : 'senando'}
            senaActual={senaActual ? senaActual.termino.toUpperCase() : '—'}
            alto={200}
          />

          <View style={styles.filaControles}>
            <Chip
              texto="Repetir seña"
              estado="normal"
              Icono={RotateCcw}
              onPress={() => setIndiceSena((i) => Math.max(0, i - 1))}
              style={styles.flexUno}
            />
            <Chip
              texto={`Velocidad ${VELOCIDADES[indiceVelocidad]}`}
              estado="normal"
              Icono={Gauge}
              onPress={rotarVelocidad}
              style={styles.flexUno}
            />
          </View>

          <Text style={styles.rotulo}>PRÓXIMAS SEÑAS</Text>
          {/* Fila horizontal desplazable: las señas no se parten en dos líneas */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filaSenas}>
            {colaSenas.length === 0 ? (
              <Text style={styles.textoVacio}>Las señas aparecen cuando el docente termina una frase.</Text>
            ) : (
              colaSenas.map((sena, idx) => (
                <Chip
                  key={`${sena.id}-${idx}`}
                  texto={sena.termino.toUpperCase()}
                  estado={idx < indiceSena ? 'completado' : idx === indiceSena ? 'activo' : 'normal'}
                  mostrarCheck={false}
                  onPress={() => setIndiceSena(idx)}
                />
              ))
            )}
          </ScrollView>

          <View style={styles.cajaSubtitulo} accessibilityLiveRegion="polite">
            <Text style={[styles.textoSubtitulo, voz.textoParcial ? styles.textoParcial : null]}>
              {renderizarSubtitulo(subtitulo)}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.filaInferior}>
          <Boton
            etiqueta={escuchando ? 'Pausar' : 'Reanudar'}
            tipo="primario"
            Icono={escuchando ? Pause : Play}
            onPress={() => setEscuchando((prev) => !prev)}
            style={styles.flexUno}
          />
          <Boton
            etiqueta="Terminar"
            tipo="secundario"
            Icono={Square}
            onPress={() => {
              setEscuchando(false);
              setModalVisible(true);
            }}
            style={styles.flexUno}
          />
        </View>

        <VentanaConfirmacion
          visible={modalVisible}
          titulo="¿Terminar la clase?"
          mensaje={`Guardaremos la transcripción en ${asignatura.nombre}.`}
          textoConfirmar="Sí, terminar y guardar"
          textoCancelar="Seguir traduciendo"
          onConfirmar={terminarYGuardar}
          onCancelar={() => {
            setModalVisible(false);
            setEscuchando(true);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORES.crema },
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
  },
  titulo: { ...TIPOGRAFIA.subtitulo, color: COLORES.tinta },
  tituloSeleccion: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  textoSeleccion: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  listaSeleccion: { gap: 12, paddingVertical: 8 },
  filaEstado: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barraVolumen: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORES.borde, overflow: 'hidden' },
  nivelVolumen: { height: '100%', borderRadius: 3, backgroundColor: COLORES.mentaOscura },
  filaControles: { flexDirection: 'row', gap: 10 },
  rotulo: { ...TIPOGRAFIA.etiqueta, color: COLORES.tintaSuave },
  scroll: { flex: 1 },
  contenidoScroll: { gap: 12, paddingBottom: 4 },
  filaSenas: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  textoVacio: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  cajaSubtitulo: {
    minHeight: 76, // alto mínimo: el subtítulo siempre se ve
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 16,
  },
  textoSubtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tinta },
  textoParcial: { color: COLORES.tintaSuave }, // frase aún en curso
  claveSubtitulo: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.azul },
  filaInferior: { flexDirection: 'row', gap: 12 },
  flexUno: { flex: 1 },
});
