/**
 * PANTALLA 10 · MODO DIÁLOGO · ruta "/(tabs)/dialogo"
 * Dos formas de conversar fuera de clase (selector arriba):
 * - RÁPIDA: para alguien que no vas a volver a ver (secretaría, biblioteca, auxiliar de aseo).
 *   No se guarda; "Nueva" la limpia.
 * - CONTACTOS: para personas con las que hablas seguido (profesor, compañero). Cada contacto
 *   tiene su conversación guardada en /contacto/[id].
 * En las dos: escribes y el teléfono lo lee en voz alta; la otra persona mantiene presionado
 * el micrófono y su respuesta aparece como texto (componente ChatVoz).
 */
import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RotateCcw, MessageCircle, User, UserPlus, Zap, Users } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { Tarjeta } from '../../components/Tarjeta';
import { Boton } from '../../components/Boton';
import { VentanaConfirmacion } from '../../components/VentanaConfirmacion';
import { BandaEncabezado, RotuloSeccion } from '../../components/Secciones';
import { ChatVoz, BotonIcono, BotonLeer } from '../../components/ChatVoz';
import { useConversaciones } from '../../context/ConversacionesContext';
import { useLeerEnVoz } from '../../hooks/useLeerEnVoz';
import { useTecladoAbierto } from '../../hooks/useTecladoAbierto';

const MODOS = [
  { id: 'rapida', etiqueta: 'Rápida', Icono: Zap },
  { id: 'contactos', etiqueta: 'Contactos', Icono: Users },
];

const SUBTITULOS = {
  rapida: 'Escribe y el teléfono lo dice en voz alta.',
  contactos: 'Conversaciones guardadas con quienes hablas seguido.',
};

export default function DialogoScreen() {
  const router = useRouter();
  const [modo, setModo] = useState('rapida');
  // Los mensajes de la conversación rápida viven aquí: no se pierden al cambiar a Contactos
  const [mensajes, setMensajes] = useState([]);
  const [leerActivado, setLeerActivado] = useState(true);
  const [confirmarNueva, setConfirmarNueva] = useState(false);

  const voz = useLeerEnVoz();
  const tecladoAbierto = useTecladoAbierto();
  const { contactos, mensajesPorContacto } = useConversaciones();

  const nuevaConversacion = () => {
    setConfirmarNueva(false);
    voz.callar();
    setMensajes([]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Evita que el teclado tape el campo de texto. */}
      <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.contenedor}>
          {/* 1. Encabezado: título corto (no se corta) + selector de modo */}
          <BandaEncabezado style={tecladoAbierto && styles.bandaCompacta}>
            <View style={styles.encabezado}>
              <View style={styles.flexUno}>
                <Text style={[styles.titulo, tecladoAbierto && styles.tituloCompacto]}>Diálogo</Text>
                {!tecladoAbierto && <Text style={styles.subtitulo}>{SUBTITULOS[modo]}</Text>}
              </View>
              {modo === 'rapida' && (
                <>
                  <BotonLeer
                    activado={leerActivado}
                    compacto={tecladoAbierto}
                    onCambiar={() => {
                      if (leerActivado) voz.callar();
                      setLeerActivado((v) => !v);
                    }}
                  />
                  <BotonIcono
                    Icono={RotateCcw}
                    etiqueta="Nueva conversación"
                    compacto={tecladoAbierto}
                    deshabilitado={mensajes.length === 0}
                    onPress={() => setConfirmarNueva(true)}
                  />
                </>
              )}
            </View>

            {/* Selector de modo (se esconde mientras se escribe para dar espacio a los mensajes) */}
            {!tecladoAbierto && (
              <View style={styles.selector} accessibilityRole="tablist">
                {MODOS.map(({ id, etiqueta, Icono }) => {
                  const activo = modo === id;
                  return (
                    <Pressable
                      key={id}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: activo }}
                      onPress={() => setModo(id)}
                      style={[styles.opcion, activo && styles.opcionActiva]}
                    >
                      <Icono size={18} strokeWidth={2} color={activo ? COLORES.blanco : COLORES.tinta} />
                      <Text style={[styles.textoOpcion, activo && styles.textoOpcionActiva]}>{etiqueta}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </BandaEncabezado>

          {modo === 'rapida' ? (
            <ChatVoz
              mensajes={mensajes}
              setMensajes={setMensajes}
              voz={voz}
              leerActivado={leerActivado}
              guia={
                <View style={styles.guia}>
                  <MessageCircle size={32} strokeWidth={2} color={COLORES.azul} />
                  <Text style={styles.guiaTitulo}>¿Cómo funciona?</Text>
                  <Text style={styles.guiaPaso}>1. Escribe lo que quieres decir o toca una frase rápida. El teléfono lo leerá en voz alta.</Text>
                  <Text style={styles.guiaPaso}>2. Pide a la persona que mantenga presionado el micrófono (abajo a la derecha) mientras te responde.</Text>
                  <Text style={styles.guiaPaso}>3. Su respuesta aparecerá aquí como texto.</Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={contactos}
              keyExtractor={(c) => c.id}
              style={styles.flexUno}
              contentContainerStyle={styles.listaContactos}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={<RotuloSeccion texto="TUS CONTACTOS" />}
              renderItem={({ item }) => {
                const conversacion = mensajesPorContacto[item.id] || [];
                const ultimo = conversacion[conversacion.length - 1];
                return (
                  <Tarjeta
                    titulo={item.nombre}
                    detalle={ultimo ? `${ultimo.lado === 'yo' ? 'Tú: ' : ''}${ultimo.mensaje}` : `${item.tipo} · Sin mensajes aún`}
                    Icono={User}
                    onPress={() => router.push(`/contacto/${item.id}`)}
                  />
                );
              }}
              ListEmptyComponent={
                <Text style={styles.vacio}>Aún no tienes contactos. Agrega a las personas con las que hablas seguido.</Text>
              }
              ListFooterComponent={
                <Boton
                  etiqueta="Agregar contacto"
                  tipo="secundario"
                  Icono={UserPlus}
                  onPress={() => router.push('/nuevo-contacto')}
                />
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <VentanaConfirmacion
        visible={confirmarNueva}
        titulo="¿Empezar una conversación nueva?"
        mensaje="La conversación rápida no se guarda: se borrarán los mensajes. Si quieres guardarla, usa Contactos."
        textoConfirmar="Sí, empezar de nuevo"
        textoCancelar="Seguir conversando"
        onConfirmar={nuevaConversacion}
        onCancelar={() => setConfirmarNueva(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // El área de la barra de estado toma el color de la franja del encabezado
  safeArea: { flex: 1, backgroundColor: COLORES.cremaEncabezado },
  flexUno: { flex: 1 },
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.crema,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingTop: 0, // la franja del encabezado llega al borde superior
    paddingBottom: 12,
    gap: 10,
  },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  subtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  // Versión compacta mientras se escribe: una sola línea y menos relleno
  bandaCompacta: { paddingTop: 8, paddingBottom: 10 },
  tituloCompacto: { ...TIPOGRAFIA.subtitulo },
  // Selector de dos opciones (control segmentado)
  selector: {
    flexDirection: 'row',
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.chip,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 4,
    marginTop: 6,
  },
  opcion: {
    flex: 1,
    height: MEDIDAS.altos.tactilMin,
    borderRadius: MEDIDAS.radios.chip - 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  opcionActiva: { backgroundColor: COLORES.azul },
  textoOpcion: { ...TIPOGRAFIA.etiqueta, color: COLORES.tinta },
  textoOpcionActiva: { color: COLORES.blanco },
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
  listaContactos: { gap: 12, paddingTop: 4, paddingBottom: 16 },
  vacio: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
});
