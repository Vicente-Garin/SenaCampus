/**
 * PANTALLA 10 · MODO DIÁLOGO · ruta "/(tabs)/dialogo"
 * - Para conversar fuera de clase: la otra persona habla (voz) y el usuario escribe.
 * - Estado: lista de mensajes + texto del campo (TextInput controlado).
 * - Interacción: enviar agrega una burbuja; el botón se desactiva si el campo está vacío.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';
import { MENSAJES_DIALOGO_INICIALES } from '../../data/mockData';
import { VisorSenas } from '../../components/VisorSenas';
import { Burbuja } from '../../components/Burbuja';

export default function DialogoScreen() {
  // Estado: lista de mensajes. Al cambiarla, React vuelve a dibujar la FlatList.
  const [mensajes, setMensajes] = useState(MENSAJES_DIALOGO_INICIALES);
  // TextInput controlado: el texto del campo vive en este estado.
  const [texto, setTexto] = useState('');
  const [enfocado, setEnfocado] = useState(false);
  const listaRef = useRef(null);

  const textoLimpio = texto.trim();
  const puedeEnviar = textoLimpio.length > 0;

  const enviarMensaje = () => {
    if (!puedeEnviar) return;
    const nuevo = {
      id: `m-${Date.now()}`,
      lado: 'yo',
      autor: 'Tú',
      mensaje: textoLimpio,
    };
    // Se crea un arreglo NUEVO (no se modifica el anterior) para que React detecte el cambio.
    setMensajes((prev) => [...prev, nuevo]);
    setTexto('');
    setTimeout(() => listaRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Evita que el teclado tape el campo de texto. */}
      <KeyboardAvoidingView
        style={styles.flexUno}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Conversar</Text>
          <Text style={styles.subtitulo}>Para hablar con alguien fuera de clase.</Text>

          <VisorSenas estado="senando" senaActual="SALA" alto={170} />

          <FlatList
            ref={listaRef}
            data={mensajes}
            keyExtractor={(item) => item.id}
            style={styles.lista}
            contentContainerStyle={styles.listaContenido}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Burbuja autor={item.autor} mensaje={item.mensaje} lado={item.lado} />
            )}
          />

          <View style={styles.filaEntrada}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              onFocus={() => setEnfocado(true)}
              onBlur={() => setEnfocado(false)}
              placeholder="Escribe tu respuesta…"
              placeholderTextColor={COLORES.tintaSuave}
              style={[styles.campo, enfocado && styles.campoEnfocado]}
              returnKeyType="send"
              onSubmitEditing={enviarMensaje}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar mensaje"
              accessibilityState={{ disabled: !puedeEnviar }}
              // Prevención de errores: no se puede enviar un mensaje vacío.
              disabled={!puedeEnviar}
              onPress={enviarMensaje}
              style={[styles.botonEnviar, !puedeEnviar && styles.botonDeshabilitado]}
            >
              <Send size={22} strokeWidth={2} color={COLORES.blanco} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORES.crema },
  flexUno: { flex: 1 },
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
  },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  subtitulo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  lista: { flex: 1 },
  listaContenido: { paddingVertical: 8 },
  filaEntrada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
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
  campoEnfocado: {
    borderWidth: 3,
    borderColor: COLORES.azul,
  },
  botonEnviar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORES.azul,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.4,
  },
});
