import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mic, RotateCcw, Gauge, Pause, Play, Square, BookOpen } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { SUBTITULOS_EN_VIVO, SENAS_PROXIMAS, ASIGNATURAS } from '../../data/mockData';
import { useClases } from '../../context/ClasesContext';
import { Chip } from '../../components/Chip';
import { VisorSenas } from '../../components/VisorSenas';
import { Boton } from '../../components/Boton';
import { VentanaConfirmacion } from '../../components/VentanaConfirmacion';
import { Tarjeta } from '../../components/Tarjeta';

const VELOCIDADES = ['0.75x', '1x', '1.5x'];

export default function TraducirScreen() {
  const router = useRouter();
  const { guardarClase } = useClases();

  // La asignatura llega como parámetro desde Asignaturas o desde el Detalle
  const { asignaturaId } = useLocalSearchParams();
  const asignatura = ASIGNATURAS.find((a) => a.id === asignaturaId) || ASIGNATURAS[0];
  // Sin asignatura elegida no se traduce: primero se pregunta qué clase es
  const hayClaseElegida = !!asignaturaId;

  // useRef guarda datos que NO necesitan redibujar la pantalla:
  // la hora de inicio de la sesión y las frases ya traducidas
  const inicioRef = useRef(Date.now());
  const fragmentosRef = useRef([]);

  const [escuchando, setEscuchando] = useState(true);
  const [indiceVelocidad, setIndiceVelocidad] = useState(1); // 1x por defecto
  const [indiceSubtitulo, setIndiceSubtitulo] = useState(0);
  const [indiceSena, setIndiceSena] = useState(1); // PRUEBA activa por defecto
  const [modalVisible, setModalVisible] = useState(false);

  // Simula el avance de subtítulos en vivo cada 1,5 s y limpia el intervalo al desmontar
  useEffect(() => {
    if (!escuchando || !hayClaseElegida) return;
    const intervalo = setInterval(() => {
      setIndiceSubtitulo((prev) => (prev + 1) % SUBTITULOS_EN_VIVO.length);
    }, 1500);
    return () => clearInterval(intervalo);
  }, [escuchando, hayClaseElegida]);

  const textoActual = SUBTITULOS_EN_VIVO[indiceSubtitulo];

  // Hora actual en formato 10:32
  const horaActual = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  // Quita los puntos suspensivos y pone mayúscula: "…mañana hay" -> "Mañana hay"
  const limpiar = (t) => {
    const sin = t.replace(/^…/, '').trim();
    return sin.charAt(0).toUpperCase() + sin.slice(1);
  };

  // Cada vez que una frase se completa, se agrega a la transcripción de la sesión
  useEffect(() => {
    if (indiceSubtitulo === SUBTITULOS_EN_VIVO.length - 1) {
      fragmentosRef.current.push({ hora: horaActual(), texto: limpiar(textoActual), claves: ['prueba'] });
    }
  }, [indiceSubtitulo]);

  // Si cambia la asignatura, empieza una sesión nueva
  useEffect(() => {
    inicioRef.current = Date.now();
    fragmentosRef.current = [];
    setIndiceSubtitulo(0);
  }, [asignatura.id]);

  // Guarda la clase en el estado compartido y abre el resumen de ESA clase
  const terminarYGuardar = () => {
    const fragmentos = fragmentosRef.current.length
      ? fragmentosRef.current
      : [{ hora: horaActual(), texto: limpiar(textoActual), claves: ['prueba'] }];
    const segundos = (Date.now() - inicioRef.current) / 1000;
    const id = guardarClase({ asignaturaId: asignatura.id, fragmentos, segundos });

    // Reinicia la sesión para la próxima clase
    inicioRef.current = Date.now();
    fragmentosRef.current = [];
    setIndiceSubtitulo(0);
    setModalVisible(false);
    setEscuchando(true);
    // Se borra la asignatura elegida: la próxima vez la pestaña vuelve a preguntar
    router.setParams({ asignaturaId: undefined });
    router.push({ pathname: '/resumen', params: { claseId: id } });
  };

  const renderizarSubtitulo = (texto) => {
    const partes = texto.split(/(prueba)/i);
    return partes.map((parte, idx) =>
      parte.toLowerCase() === 'prueba' ? (
        <Text key={idx} style={styles.claveSubtitulo}>
          {parte}
        </Text>
      ) : (
        <Text key={idx}>{parte}</Text>
      )
    );
  };

  const rotarVelocidad = () => {
    setIndiceVelocidad((prev) => (prev + 1) % VELOCIDADES.length);
  };

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
            data={ASIGNATURAS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listaSeleccion}
            renderItem={({ item }) => (
              <Tarjeta
                titulo={item.nombre}
                detalle={`Sala ${item.sala} · ${item.horario}`}
                Icono={BookOpen}
                onPress={() => router.setParams({ asignaturaId: item.id })}
              />
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

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
            texto={escuchando ? 'Escuchando · es-CL' : 'En pausa'}
            estado={escuchando ? 'activo' : 'normal'}
            Icono={escuchando ? Mic : undefined}
          />
        </View>

        <VisorSenas estado="senando" senaActual={SENAS_PROXIMAS[indiceSena]} alto={200} />

        <View style={styles.filaControles}>
          <Chip
            texto="Repetir seña"
            estado="normal"
            Icono={RotateCcw}
            onPress={() => setIndiceSena((prev) => prev)}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filaSenas}
        >
          {SENAS_PROXIMAS.map((sena, idx) => {
            const estadoChip =
              idx < indiceSena ? 'completado' : idx === indiceSena ? 'activo' : 'normal';
            return (
              <Chip
                key={sena}
                texto={sena}
                estado={estadoChip}
                mostrarCheck={false}
                onPress={() => setIndiceSena(idx)}
              />
            );
          })}
        </ScrollView>

        <View style={styles.cajaSubtitulo}>
          <Text style={styles.textoSubtitulo}>{renderizarSubtitulo(textoActual)}</Text>
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
  filaEstado: { alignItems: 'flex-start' },
  filaControles: { flexDirection: 'row', gap: 10 },
  rotulo: { ...TIPOGRAFIA.etiqueta, color: COLORES.tintaSuave },
  scroll: { flex: 1 },
  contenidoScroll: { gap: 12, paddingBottom: 4 },
  filaSenas: { flexDirection: 'row', gap: 8 },
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
  claveSubtitulo: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.azul },
  filaInferior: { flexDirection: 'row', gap: 12 },
  flexUno: { flex: 1 },
});
