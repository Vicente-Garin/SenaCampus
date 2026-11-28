/**
 * COMPONENTE · Chat por voz (lo usan la Conversación rápida y las conversaciones con contactos)
 * 1. El estudiante escribe (o toca una frase rápida) y el teléfono LEE el mensaje en voz alta.
 * 2. La otra persona MANTIENE PRESIONADO el micrófono y responde hablando: su voz aparece como texto.
 * - Los mensajes viven en la pantalla que lo usa (props mensajes / setMensajes), así cada
 *   conversación guarda los suyos.
 * - Con el teclado abierto se esconden las frases rápidas para dejar más mensajes a la vista.
 * - En Expo Go no hay micrófono: el botón agrega una respuesta de ejemplo.
 */
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { Send, Mic, Volume2, VolumeX } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { Burbuja } from './Burbuja';
import { Chip } from './Chip';
import { Aviso } from './Aviso';
import { PanelAcciones } from './Secciones';
import { useVozATexto } from '../hooks/useVozATexto';
import { useTecladoAbierto } from '../hooks/useTecladoAbierto';

// Frases que se usan mucho en trámites y pasillos: se envían y se leen con un toque
export const FRASES_RAPIDAS = [
  'Disculpe, ¿me puede ayudar?',
  'Soy sordo/a y uso esta app para comunicarme.',
  '¿Puede repetir, por favor?',
  'Más lento, por favor.',
  'Gracias.',
];

const RESPUESTA_SIMULADA = 'Sí, claro. Es en la sala A-110, en el segundo piso.';

// Botón redondo de 48 pt para el encabezado (leer en voz alta, nueva conversación…)
export function BotonIcono({ Icono, etiqueta, onPress, activo = false, deshabilitado = false, compacto = false, color }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botonIcono,
        compacto && styles.botonIconoCompacto,
        activo && styles.botonIconoActivo,
        deshabilitado && styles.deshabilitado,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icono size={compacto ? 20 : 22} strokeWidth={2} color={color || (activo ? COLORES.blanco : COLORES.tinta)} />
    </Pressable>
  );
}

// Interruptor de "leer mis mensajes en voz alta"
export function BotonLeer({ activado, onCambiar, compacto }) {
  return (
    <BotonIcono
      Icono={activado ? Volume2 : VolumeX}
      etiqueta={activado ? 'Lectura en voz alta activada' : 'Lectura en voz alta desactivada'}
      activo={activado}
      compacto={compacto}
      onPress={onCambiar}
    />
  );
}

export function ChatVoz({ mensajes, setMensajes, autorOtra = 'Persona cerca', voz, leerActivado, guia, frases = FRASES_RAPIDAS }) {
  const [texto, setTexto] = useState('');
  const [enfocado, setEnfocado] = useState(false);
  const [presionado, setPresionado] = useState(false);
  const [pista, setPista] = useState('');
  const tecladoAbierto = useTecladoAbierto();

  const listaRef = useRef(null);
  const presionadoRef = useRef(false);
  const inicioPresionRef = useRef(0);
  const turnoRef = useRef(null); // id de la burbuja de la respuesta que se está dictando

  const bajarAlFinal = () => setTimeout(() => listaRef.current?.scrollToEnd({ animated: true }), 100);

  // Cada frase reconocida se suma a la burbuja de la respuesta actual de la otra persona
  const alReconocerFrase = useCallback((frase) => {
    const textoFrase = frase.charAt(0).toUpperCase() + frase.slice(1);
    setMensajes((prev) => {
      const idTurno = turnoRef.current;
      const existente = prev.find((m) => m.id === idTurno);
      if (existente) {
        return prev.map((m) => (m.id === idTurno ? { ...m, mensaje: `${m.mensaje} ${frase}` } : m));
      }
      const id = idTurno || `m-${Date.now()}`;
      turnoRef.current = id;
      return [...prev, { id, lado: 'otra', autor: autorOtra, mensaje: textoFrase }];
    });
    bajarAlFinal();
  }, [setMensajes, autorOtra]);

  const microfono = useVozATexto({ onFraseFinal: alReconocerFrase });

  // Envía un mensaje del estudiante y lo lee en voz alta
  const enviar = (contenido) => {
    const limpio = contenido.trim();
    if (!limpio) return;
    setMensajes((prev) => [...prev, { id: `m-${Date.now()}`, lado: 'yo', autor: 'Tú', mensaje: limpio }]);
    turnoRef.current = null; // la próxima respuesta hablada va en una burbuja nueva
    if (leerActivado) voz.leer(limpio);
    bajarAlFinal();
  };

  const enviarCampo = () => {
    enviar(texto);
    setTexto('');
  };

  // "Mantén presionado para responder": escucha solo mientras el dedo está encima
  const alPresionar = async () => {
    if (voz.hablando) return;
    presionadoRef.current = true;
    inicioPresionRef.current = Date.now();
    setPresionado(true);
    setPista('');
    turnoRef.current = `m-${Date.now()}`; // cada vez que presiona, su respuesta va en una burbuja nueva

    if (!microfono.disponible) return; // Expo Go: se simula al soltar
    await microfono.iniciar(); // la primera vez pide permiso del micrófono
    // Si soltó mientras aparecía el permiso, se detiene de inmediato
    if (!presionadoRef.current) microfono.pausar();
  };

  const alSoltar = () => {
    if (!presionadoRef.current) return;
    presionadoRef.current = false;
    setPresionado(false);
    const duracion = Date.now() - inicioPresionRef.current;

    if (!microfono.disponible) {
      alReconocerFrase(RESPUESTA_SIMULADA);
      return;
    }
    microfono.pausar(); // entrega lo último que se alcanzó a reconocer
    if (duracion < 400) setPista('Mantén presionado el micrófono mientras la persona habla.');
  };

  // Burbuja temporal con lo que la otra persona está diciendo ahora mismo
  const parcial = microfono.textoParcial;
  const textoEstado = voz.hablando ? 'Leyendo tu mensaje en voz alta…' : 'Escuchando… suelta el micrófono al terminar';

  return (
    <>
      {microfono.error && <Aviso tipo="error" mensaje={microfono.error.mensaje} />}
      {!microfono.disponible && (
        <Aviso tipo="info" mensaje="El micrófono funciona en la app instalada. En Expo Go el botón muestra una respuesta de ejemplo." />
      )}

      <FlatList
        ref={listaRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        contentContainerStyle={[styles.listaContenido, mensajes.length === 0 && styles.listaVacia]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <Burbuja
            autor={item.autor}
            mensaje={item.mensaje}
            lado={item.lado}
            onLeer={item.lado === 'yo' ? () => voz.leer(item.mensaje) : undefined}
          />
        )}
        ListEmptyComponent={!parcial ? guia : null}
        ListFooterComponent={parcial ? <Burbuja autor={autorOtra} mensaje={parcial} lado="otra" parcial /> : null}
      />

      {/* Aviso de estado (como "grabando" en WhatsApp): aparece mientras se escucha o se lee */}
      {(presionado || voz.hablando || !!pista) && (
        <View style={[styles.estado, pista && !presionado && !voz.hablando && styles.estadoPista]}>
          {voz.hablando ? <Volume2 size={18} strokeWidth={2} color={COLORES.coralTexto} /> : <Mic size={18} strokeWidth={2} color={COLORES.coralTexto} />}
          <Text style={styles.textoEstado}>{voz.hablando || presionado ? textoEstado : pista}</Text>
        </View>
      )}

      {/* Zona para escribir (panel blanco, como la barra de WhatsApp) */}
      <PanelAcciones style={styles.panelEscribir}>
        {/* Carrusel de una sola fila; se esconde mientras se escribe */}
        {!tecladoAbierto && (
          <ScrollView
            horizontal
            style={styles.carrusel}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filaFrases}
            keyboardShouldPersistTaps="handled"
            accessibilityLabel="Frases rápidas"
          >
            {frases.map((frase) => (
              <Chip key={frase} texto={frase} estado="normal" mostrarCheck={false} onPress={() => enviar(frase)} />
            ))}
          </ScrollView>
        )}

        <View style={styles.filaEntrada}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            onFocus={() => setEnfocado(true)}
            onBlur={() => setEnfocado(false)}
            placeholder="Escribe lo que quieres decir…"
            placeholderTextColor={COLORES.tintaSuave}
            style={[styles.campo, enfocado && styles.campoEnfocado]}
            returnKeyType="send"
            onSubmitEditing={enviarCampo}
          />
          {/* Un solo botón redondo, como en WhatsApp:
              con texto escrito → enviar; campo vacío → micrófono (mantener para que la otra persona hable) */}
          {texto.trim() ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar y leer en voz alta"
              onPress={enviarCampo}
              style={({ pressed }) => [styles.botonRedondo, pressed && styles.botonRedondoPresionado]}
            >
              <Send size={22} strokeWidth={2} color={COLORES.blanco} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mantén presionado para que la otra persona responda hablando"
              accessibilityHint="Mantener presionado mientras la persona habla y soltar al terminar"
              disabled={voz.hablando}
              onPressIn={alPresionar}
              onPressOut={alSoltar}
              style={[styles.botonRedondo, presionado && styles.botonRedondoGrabando, voz.hablando && styles.deshabilitado]}
            >
              <Mic size={24} strokeWidth={2} color={COLORES.blanco} />
            </Pressable>
          )}
        </View>
      </PanelAcciones>
    </>
  );
}

const styles = StyleSheet.create({
  botonIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.borde,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonIconoCompacto: { width: 40, height: 40, borderRadius: 20 },
  botonIconoActivo: { backgroundColor: COLORES.azul, borderColor: COLORES.azul },
  lista: { flex: 1 },
  listaContenido: { paddingVertical: 8 },
  listaVacia: { flexGrow: 1, justifyContent: 'center' },
  panelEscribir: { padding: 10, gap: 10 },
  carrusel: { flexGrow: 0, flexShrink: 0, height: MEDIDAS.altos.chip }, // alto fijo: una fila de chips (44)
  filaFrases: { gap: 8, alignItems: 'center', paddingRight: 8 },
  filaEntrada: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  campo: {
    flex: 1,
    height: 54,
    backgroundColor: COLORES.blanco,
    borderWidth: 2,
    borderColor: COLORES.bordeCampo,
    borderRadius: 27,
    paddingHorizontal: 18,
    ...TIPOGRAFIA.cuerpo,
    color: COLORES.tinta,
  },
  campoEnfocado: { borderWidth: 3, borderColor: COLORES.azul },
  // Botón redondo coral (el mismo color de "Retomar"): enviar o micrófono, como en WhatsApp
  botonRedondo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORES.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonRedondoPresionado: { backgroundColor: COLORES.coralTexto },
  // Mientras se mantiene presionado crece un poco, igual que el micrófono de WhatsApp
  botonRedondoGrabando: { backgroundColor: COLORES.coralTexto, transform: [{ scale: 1.2 }] },
  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: COLORES.coralSuave,
    borderRadius: MEDIDAS.radios.chip,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  estadoPista: { backgroundColor: COLORES.amarilloSuave },
  textoEstado: { ...TIPOGRAFIA.cuerpo, color: COLORES.coralTexto },
  deshabilitado: { opacity: 0.4 },
});
