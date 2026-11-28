/**
 * PANTALLA 3 · ACCESO · ruta "/"
 * - Inicio de sesión real con Firebase Authentication (correo institucional + contraseña).
 * - Validación: solo correos @alumnos.ulagos.cl o @ulagos.cl (prevención de errores).
 * - "¿Olvidaste tu contraseña?": Firebase envía un correo para crear una nueva.
 * - "Crear cuenta" abre /registro. Al entrar, GuardiaSesion (_layout) lleva a la app.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogIn, UserPlus } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { Logo } from '../components/Logo';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { Aviso } from '../components/Aviso';
import { useSesion, correoInstitucional } from '../context/SesionContext';

export default function AccesoScreen() {
  const router = useRouter();
  const { iniciarSesion, recuperarClave, firebaseConfigurado } = useSesion();

  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null); // { tipo, mensaje }
  const [cargando, setCargando] = useState(false);

  const validarCorreo = () => {
    if (!correo.trim()) return 'Escribe tu correo institucional.';
    if (!correoInstitucional(correo)) return 'Usa tu correo @alumnos.ulagos.cl.';
    return '';
  };

  const ingresar = async () => {
    const errorCorreo = validarCorreo();
    const errorClave = clave ? '' : 'Escribe tu contraseña.';
    setErrores({ correo: errorCorreo, clave: errorClave });
    setAviso(null);
    if (errorCorreo || errorClave) return;

    setCargando(true);
    try {
      await iniciarSesion(correo, clave);
      // GuardiaSesion cambia de pantalla cuando el perfil está listo
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: error.message });
    } finally {
      setCargando(false);
    }
  };

  const olvideClave = async () => {
    const errorCorreo = validarCorreo();
    setErrores({ correo: errorCorreo });
    if (errorCorreo) {
      setAviso({ tipo: 'info', mensaje: 'Escribe tu correo arriba y vuelve a tocar "¿Olvidaste tu contraseña?".' });
      return;
    }
    try {
      await recuperarClave(correo);
      setAviso({ tipo: 'exito', mensaje: `Te enviamos un correo a ${correo.trim().toLowerCase()} para crear una contraseña nueva.` });
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: error.message });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
          <View style={styles.contenido}>
            <Logo tamano={64} />
            <Text style={styles.titulo}>Tus clases, en señas.</Text>
            <Text style={styles.cuerpo}>Entra con tu correo de la universidad.</Text>

            {!firebaseConfigurado && (
              <Aviso tipo="error" mensaje="Falta la configuración de Firebase en mobile/.env." />
            )}

            <CampoTexto
              etiqueta="Correo institucional"
              valor={correo}
              alCambiar={(t) => {
                setCorreo(t);
                if (errores.correo) setErrores((e) => ({ ...e, correo: '' }));
              }}
              placeholder="nombre@alumnos.ulagos.cl"
              error={errores.correo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
            <CampoTexto
              etiqueta="Contraseña"
              valor={clave}
              alCambiar={(t) => {
                setClave(t);
                if (errores.clave) setErrores((e) => ({ ...e, clave: '' }));
              }}
              placeholder="Tu contraseña"
              error={errores.clave}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={ingresar}
            />

            <Pressable
              accessibilityRole="button"
              onPress={olvideClave}
              hitSlop={8}
              style={({ pressed }) => [styles.enlace, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.textoEnlace}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {aviso && <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />}
          </View>

          <View style={styles.acciones}>
            <Boton etiqueta="Iniciar sesión" tipo="primario" Icono={LogIn} onPress={ingresar} cargando={cargando} deshabilitado={!firebaseConfigurado} />
            <Boton etiqueta="Crear cuenta" tipo="secundario" Icono={UserPlus} onPress={() => router.push('/registro')} />
            <Text style={styles.legal}>
              Al continuar aceptas los Términos de uso y la Política de privacidad.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORES.crema },
  flexUno: { flex: 1 },
  contenedor: {
    flexGrow: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingTop: 40,
    paddingBottom: 14,
    justifyContent: 'space-between',
    gap: 24,
  },
  contenido: { gap: 16 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  cuerpo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  enlace: { alignSelf: 'flex-start', minHeight: MEDIDAS.altos.tactilMin, justifyContent: 'center' },
  textoEnlace: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.azul },
  acciones: { gap: 12 },
  legal: { ...TIPOGRAFIA.secundario, color: COLORES.tintaSuave, textAlign: 'center' },
});
