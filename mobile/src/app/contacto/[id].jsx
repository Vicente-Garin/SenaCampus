/**
 * PANTALLA · CONVERSACIÓN CON UN CONTACTO · ruta dinámica "/contacto/[id]"
 * - Mismo chat por voz que la Conversación rápida (componente ChatVoz), pero los mensajes
 *   quedan guardados en el contacto y se pueden retomar otro día.
 * - Las respuestas habladas aparecen con el nombre del contacto.
 * - Eliminar contacto: pide confirmación y vuelve a Diálogo.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, MessageCircle } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { BarraSuperior } from '../../components/BarraSuperior';
import { Aviso } from '../../components/Aviso';
import { VentanaConfirmacion } from '../../components/VentanaConfirmacion';
import { Pantalla, BandaEncabezado } from '../../components/Secciones';
import { ChatVoz, BotonLeer } from '../../components/ChatVoz';
import { useConversaciones } from '../../context/ConversacionesContext';
import { useLeerEnVoz } from '../../hooks/useLeerEnVoz';
import { useTecladoAbierto } from '../../hooks/useTecladoAbierto';

export default function ConversacionContactoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { buscarContacto, mensajesPorContacto, setMensajesDe, eliminarContacto } = useConversaciones();
  const contacto = buscarContacto(id);

  const voz = useLeerEnVoz();
  const tecladoAbierto = useTecladoAbierto();
  const [leerActivado, setLeerActivado] = useState(true);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const setMensajes = useCallback((cambio) => setMensajesDe(id, cambio), [id, setMensajesDe]);

  if (!contacto) {
    return (
      <Pantalla>
        <View style={styles.contenedor}>
          <BarraSuperior textoVolver="Diálogo" />
          <Aviso tipo="info" mensaje="Este contacto ya no existe o fue eliminado." />
        </View>
      </Pantalla>
    );
  }

  const eliminar = () => {
    setConfirmarEliminar(false);
    voz.callar();
    router.back();
    eliminarContacto(contacto.id);
  };

  return (
    <Pantalla>
      <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.contenedor}>
          <BandaEncabezado style={[styles.banda, tecladoAbierto && styles.bandaCompacta]}>
            <BarraSuperior
              textoVolver="Diálogo"
              accion={{ Icono: Trash2, etiqueta: 'Eliminar contacto', onPress: () => setConfirmarEliminar(true) }}
            />
            <View style={styles.encabezado}>
              <View style={styles.flexUno}>
                <Text style={[styles.titulo, tecladoAbierto && styles.tituloCompacto]} numberOfLines={1}>
                  {contacto.nombre}
                </Text>
                {!tecladoAbierto && <Text style={styles.subtitulo}>{contacto.tipo}</Text>}
              </View>
              <BotonLeer
                activado={leerActivado}
                compacto={tecladoAbierto}
                onCambiar={() => {
                  if (leerActivado) voz.callar();
                  setLeerActivado((v) => !v);
                }}
              />
            </View>
          </BandaEncabezado>

          <ChatVoz
            mensajes={mensajesPorContacto[contacto.id] || []}
            setMensajes={setMensajes}
            autorOtra={contacto.nombre}
            voz={voz}
            leerActivado={leerActivado}
            guia={
              <View style={styles.guia}>
                <MessageCircle size={32} strokeWidth={2} color={COLORES.azul} />
                <Text style={styles.guiaTitulo}>Empieza a conversar con {contacto.nombre}</Text>
                <Text style={styles.guiaPaso}>
                  Escribe y el teléfono lo dirá en voz alta. Para responder, {contacto.nombre} mantiene presionado el
                  micrófono. La conversación queda guardada aquí.
                </Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>

      <VentanaConfirmacion
        visible={confirmarEliminar}
        titulo={`¿Eliminar a ${contacto.nombre}?`}
        mensaje="Se borrará el contacto y toda su conversación. Esta acción no se puede deshacer."
        textoConfirmar="Sí, eliminar"
        textoCancelar="Cancelar"
        onConfirmar={eliminar}
        onCancelar={() => setConfirmarEliminar(false)}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flexUno: { flex: 1 },
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingBottom: 12,
    gap: 10,
  },
  banda: { paddingTop: 0 },
  bandaCompacta: { paddingBottom: 10 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  tituloCompacto: { ...TIPOGRAFIA.subtitulo },
  subtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  guia: {
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 20,
    gap: 8,
    alignItems: 'flex-start',
  },
  guiaTitulo: { ...TIPOGRAFIA.subtitulo, color: COLORES.tinta },
  guiaPaso: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
});
