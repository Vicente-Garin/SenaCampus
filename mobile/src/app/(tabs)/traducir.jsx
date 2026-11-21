import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, RotateCcw, Gauge, Pause, Play, Square } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { SUBTITULOS_EN_VIVO, SENAS_PROXIMAS } from '../../data/mockData';
import { Chip } from '../../components/Chip';
import { VisorSenas } from '../../components/VisorSenas';
import { Boton } from '../../components/Boton';
import { VentanaConfirmacion } from '../../components/VentanaConfirmacion';

const VELOCIDADES = ['0.75x', '1x', '1.5x'];

export default function TraducirScreen() {
  const router = useRouter();

  const [escuchando, setEscuchando] = useState(true);
  const [indiceVelocidad, setIndiceVelocidad] = useState(1); // 1x por defecto
  const [indiceSubtitulo, setIndiceSubtitulo] = useState(0);
  const [indiceSena, setIndiceSena] = useState(1); // PRUEBA activa por defecto
  const [modalVisible, setModalVisible] = useState(false);

  // Simula el avance de subtítulos en vivo cada 1,5 s y limpia el intervalo al desmontar
  useEffect(() => {
    if (!escuchando) return;
    const intervalo = setInterval(() => {
      setIndiceSubtitulo((prev) => (prev + 1) % SUBTITULOS_EN_VIVO.length);
    }, 1500);
    return () => clearInterval(intervalo);
  }, [escuchando]);

  const textoActual = SUBTITULOS_EN_VIVO[indiceSubtitulo];

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>Tecnologías Web y Móviles</Text>

        <View style={styles.filaEstado}>
          <Chip
            texto={escuchando ? 'Escuchando · es-CL' : 'En pausa'}
            estado={escuchando ? 'activo' : 'normal'}
            Icono={escuchando ? Mic : undefined}
          />
        </View>

        <VisorSenas estado="senando" senaActual={SENAS_PROXIMAS[indiceSena]} alto={210} />

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
        <View style={styles.filaSenas}>
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
        </View>

        <View style={styles.cajaSubtitulo}>
          <Text style={styles.textoSubtitulo}>{renderizarSubtitulo(textoActual)}</Text>
        </View>

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
          mensaje="Guardaremos la transcripción en Tecnologías Web y Móviles."
          textoConfirmar="Sí, terminar y guardar"
          textoCancelar="Seguir traduciendo"
          onConfirmar={() => {
            setModalVisible(false);
            router.push('/resumen');
          }}
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
  filaEstado: { alignItems: 'flex-start' },
  filaControles: { flexDirection: 'row', gap: 10 },
  rotulo: { ...TIPOGRAFIA.etiqueta, color: COLORES.tintaSuave },
  filaSenas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cajaSubtitulo: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 16,
    justifyContent: 'center',
  },
  textoSubtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tinta },
  claveSubtitulo: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.azul },
  filaInferior: { flexDirection: 'row', gap: 12 },
  flexUno: { flex: 1 },
});
