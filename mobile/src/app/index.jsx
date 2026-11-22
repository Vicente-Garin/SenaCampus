/**
 * PANTALLA 3 · ACCESO · ruta "/"
 * - Primera pantalla de la app.
 * - Datos: el correo inicial viene de USUARIO (src/data/mockData.js).
 * - Interacción: TextInput controlado + validación del dominio @alumnos.ulagos.cl.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, AlertCircle } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { USUARIO } from '../data/mockData';
import { Logo } from '../components/Logo';
import { Boton } from '../components/Boton';

const DOMINIO = '@alumnos.ulagos.cl';

// Pantalla 3 · Acceso (Figma). Es la ruta "/" y la primera pantalla de la app.
export default function AccesoScreen() {
  const router = useRouter();

  // TextInput controlado: el valor vive en el estado y se actualiza con cada tecla
  const [correo, setCorreo] = useState(USUARIO.correo);
  const [enfocado, setEnfocado] = useState(false);
  const [error, setError] = useState('');

  const ingresar = () => {
    // Prevención de errores: solo se acepta el correo institucional
    if (!correo.trim().toLowerCase().endsWith(DOMINIO)) {
      setError(`Debe terminar en ${DOMINIO}`);
      return;
    }
    setError('');
    // replace (no push): el Acceso no queda en la pila, así «Volver» no regresa al login.
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flexUno}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contenedor}>
          <View style={styles.contenido}>
            <Logo tamano={64} />
            <Text style={styles.titulo}>Tus clases, en señas.</Text>
            <Text style={styles.cuerpo}>
              Entra con tu cuenta de la universidad. No necesitas una contraseña nueva.
            </Text>

            <View style={styles.campoGrupo}>
              <Text style={styles.etiqueta}>Correo institucional</Text>
              <TextInput
                value={correo}
                onChangeText={(texto) => {
                  setCorreo(texto);
                  if (error) setError('');
                }}
                onFocus={() => setEnfocado(true)}
                onBlur={() => setEnfocado(false)}
                placeholder={`nombre${DOMINIO}`}
                placeholderTextColor={COLORES.tintaSuave}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={ingresar}
                accessibilityLabel="Correo institucional"
                style={[
                  styles.campo,
                  enfocado && styles.campoFoco,
                  !!error && styles.campoError,
                ]}
              />
              {/* El error se comunica con color, ícono y texto (no solo color) */}
              {error ? (
                <View style={styles.ayudaFila}>
                  <AlertCircle size={18} strokeWidth={2} color={COLORES.error} />
                  <Text style={[styles.ayuda, { color: COLORES.error }]}>{error}</Text>
                </View>
              ) : (
                <Text style={styles.ayuda}>Usa tu correo de la universidad.</Text>
              )}
            </View>
          </View>

          <View style={styles.acciones}>
            <Boton etiqueta="Continuar con mi correo" tipo="primario" Icono={Mail} onPress={ingresar} />
            <Boton etiqueta="Continuar con Google" tipo="secundario" onPress={ingresar} />
            <Boton etiqueta="Continuar con Microsoft" tipo="secundario" onPress={ingresar} />
            <Text style={styles.legal}>
              Al continuar aceptas los Términos de uso y la Política de privacidad.
            </Text>
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
    paddingTop: 40,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  contenido: { gap: 16 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  cuerpo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  campoGrupo: { gap: 8, marginTop: 4 },
  etiqueta: { ...TIPOGRAFIA.etiqueta, color: COLORES.tinta },
  campo: {
    height: 54,
    backgroundColor: COLORES.blanco,
    borderWidth: 2,
    borderColor: COLORES.bordeCampo,
    borderRadius: MEDIDAS.radios.campo,
    paddingHorizontal: 16,
    ...TIPOGRAFIA.cuerpo,
    color: COLORES.tinta,
  },
  campoFoco: { borderWidth: 3, borderColor: COLORES.azul },
  campoError: { borderWidth: 3, borderColor: COLORES.error },
  ayudaFila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ayuda: { ...TIPOGRAFIA.secundario, color: COLORES.tintaSuave },
  acciones: { gap: 12 },
  legal: { ...TIPOGRAFIA.secundario, color: COLORES.tintaSuave, textAlign: 'center' },
});
