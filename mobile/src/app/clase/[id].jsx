/**
 * PANTALLA 7 · TRANSCRIPCIÓN GUARDADA · ruta dinámica "/clase/[id]"
 * - Solo lectura: no se puede volver a grabar aquí (decisión de UX).
 * - Datos: la clase y su transcripción desde el Context.
 * - Interacción: copiar texto (muestra un aviso 2 s con useState + setTimeout).
 * - Eliminar transcripción: pide confirmación, borra la clase del Context y vuelve al historial.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Copy, Hand, Trash2 } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { useClases } from '../../context/ClasesContext';
import { BarraSuperior } from '../../components/BarraSuperior';
import { Boton } from '../../components/Boton';
import { Aviso } from '../../components/Aviso';
import { VentanaConfirmacion } from '../../components/VentanaConfirmacion';

function resaltarClaves(texto, claves = []) {
  if (!claves.length) return texto;
  const regex = new RegExp(`(${claves.join('|')})`, 'gi');
  const partes = texto.split(regex);
  return partes.map((parte, idx) => {
    const esClave = claves.some((c) => c.toLowerCase() === parte.toLowerCase());
    return esClave ? (
      <Text key={idx} style={styles.clave}>
        {parte}
      </Text>
    ) : (
      <Text key={idx}>{parte}</Text>
    );
  });
}

export default function TranscripcionGuardadaScreen() {
  // Ruta dinámica: el id de la clase llega en la URL /clase/[id].
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  // Datos de la clase desde el estado compartido (incluye las recién guardadas)
  const { transcripciones, buscarClase, eliminarClase } = useClases();
  const clase = buscarClase(id);

  const manejarCopiar = () => {
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Borra la clase y vuelve al historial de la asignatura
  const manejarEliminar = () => {
    setConfirmarEliminar(false);
    eliminarClase(clase.id);
    router.back();
  };

  // Si la clase ya no existe (por ejemplo, recién eliminada) no se muestra nada roto
  if (!clase) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.contenedor}>
          <BarraSuperior textoVolver="Historial" />
          <Aviso tipo="info" mensaje="Esta clase ya no existe o fue eliminada." />
        </View>
      </SafeAreaView>
    );
  }

  const fragmentos = transcripciones[clase.id] || [];
  const deletreadas = clase.deletreadas || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.contenedor}>
        <BarraSuperior
          textoVolver="Historial"
          accion={{ Icono: Copy, etiqueta: 'Copiar texto', onPress: manejarCopiar }}
        />

        <Text style={styles.titulo}>{clase.fecha}</Text>
        <Text style={styles.meta}>
          {clase.duracion} · {deletreadas.length} palabras deletreadas
        </Text>

        {copiado && (
          <Aviso tipo="exito" mensaje="Texto copiado" style={styles.avisoCopiado} />
        )}

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {fragmentos.length === 0 && (
            <Aviso
              tipo="info"
              mensaje="Esta clase de ejemplo no tiene la transcripción cargada. Las clases que traduzcas sí la guardan."
            />
          )}
          <View style={[styles.cajaTranscripcion, fragmentos.length === 0 && { display: 'none' }]}>
            {fragmentos.map((frag, idx) => (
              <View key={idx} style={styles.fragmento}>
                <Text style={styles.hora}>{frag.hora}</Text>
                <Text style={styles.texto}>{resaltarClaves(frag.texto, frag.claves)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.acciones}>
          <Boton
            etiqueta="Repasar señas"
            tipo="primario"
            Icono={Hand}
            onPress={() => router.push('/(tabs)/traducir')}
          />
          <View style={styles.filaSecundaria}>
            <Boton
              etiqueta="Copiar"
              tipo="secundario"
              Icono={Copy}
              onPress={manejarCopiar}
              style={styles.flexUno}
            />
            <Boton
              etiqueta="Eliminar"
              tipo="peligro"
              Icono={Trash2}
              onPress={() => setConfirmarEliminar(true)}
              style={styles.flexUno}
            />
          </View>
        </View>

        <VentanaConfirmacion
          visible={confirmarEliminar}
          titulo="¿Eliminar esta transcripción?"
          mensaje={`Se borrará la ${clase.fecha.toLowerCase()} y su texto. Esta acción no se puede deshacer.`}
          textoConfirmar="Sí, eliminar"
          textoCancelar="Cancelar"
          onConfirmar={manejarEliminar}
          onCancelar={() => setConfirmarEliminar(false)}
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
    paddingBottom: 14,
  },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta, marginBottom: 4 },
  meta: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave, marginBottom: 14 },
  avisoCopiado: { marginBottom: 12 },
  scroll: { flex: 1 },
  cajaTranscripcion: {
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 16,
    gap: 16,
  },
  fragmento: { gap: 4 },
  hora: { ...TIPOGRAFIA.etiqueta, color: COLORES.tintaSuave },
  texto: { ...TIPOGRAFIA.cuerpo, color: COLORES.tinta },
  clave: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.azul },
  acciones: { gap: 10, paddingTop: 12 },
  filaSecundaria: { flexDirection: 'row', gap: 10 },
  flexUno: { flex: 1 },
});
