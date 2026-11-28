/**
 * PANTALLA · CREAR CUENTA · ruta "/registro"
 * - Crea la cuenta en Firebase (correo + contraseña) y el perfil en MongoDB (nombre, apellido, sede).
 * - Si la cuenta de Firebase ya existe pero falta el perfil (estado 'sinPerfil'), solo pide los datos.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { CampoTexto } from '../components/CampoTexto';
import { Chip } from '../components/Chip';
import { Boton } from '../components/Boton';
import { Aviso } from '../components/Aviso';
import { RotuloSeccion } from '../components/Secciones';
import { useSesion, correoInstitucional, SEDES } from '../context/SesionContext';

export default function RegistroScreen() {
  const router = useRouter();
  const { estado, cuenta, registrar, cerrarSesion } = useSesion();
  // La cuenta de Firebase ya existe: solo faltan los datos del perfil
  const soloPerfil = estado === 'sinPerfil' && !!cuenta;

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [sede, setSede] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [clave2, setClave2] = useState('');
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);

  const validar = () => {
    const e = {};
    if (nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.';
    if (apellido.trim().length < 2) e.apellido = 'Escribe tu apellido.';
    if (!sede) e.sede = 'Elige tu sede.';
    if (!soloPerfil) {
      if (!correoInstitucional(correo)) e.correo = 'Usa tu correo @alumnos.ulagos.cl.';
      if (clave.length < 6) e.clave = 'Mínimo 6 caracteres.';
      else if (clave !== clave2) e.clave2 = 'Las contraseñas no coinciden.';
    }
    return e;
  };

  const crear = async () => {
    const e = validar();
    setErrores(e);
    setAviso('');
    if (Object.keys(e).length) return;
    setCargando(true);
    try {
      await registrar({ nombre, apellido, sede, correo, clave });
      // GuardiaSesion lleva a la app
    } catch (error) {
      setAviso(error.message);
    } finally {
      setCargando(false);
    }
  };

  const volver = async () => {
    if (soloPerfil) await cerrarSesion(); // salir de la cuenta a medias y volver al Acceso
    else router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver al acceso"
            onPress={volver}
            hitSlop={8}
            style={({ pressed }) => [styles.volver, pressed && { opacity: 0.7 }]}
          >
            <ChevronLeft size={28} strokeWidth={2} color={COLORES.azul} />
            <Text style={styles.textoVolver}>Acceso</Text>
          </Pressable>

          <Text style={styles.titulo}>{soloPerfil ? 'Completa tu perfil' : 'Crear cuenta'}</Text>
          <Text style={styles.cuerpo}>
            {soloPerfil
              ? `Tu cuenta ${cuenta.email} está lista. Solo faltan tus datos.`
              : 'Con tu correo de la universidad. Tus asignaturas y clases quedan guardadas en tu cuenta.'}
          </Text>

          <RotuloSeccion texto="TUS DATOS" />
          <CampoTexto etiqueta="Nombre" valor={nombre} alCambiar={setNombre} placeholder="Ej.: Vicente" error={errores.nombre} autoCapitalize="words" />
          <CampoTexto etiqueta="Apellido" valor={apellido} alCambiar={setApellido} placeholder="Ej.: Garín" error={errores.apellido} autoCapitalize="words" />

          <View style={styles.grupo}>
            <Text style={styles.etiqueta}>Sede</Text>
            <View style={styles.filaSedes}>
              {SEDES.map((s) => (
                <Chip key={s} texto={s} estado={sede === s ? 'activo' : 'normal'} onPress={() => setSede(s)} />
              ))}
            </View>
            {!!errores.sede && <Text style={styles.error}>{errores.sede}</Text>}
          </View>

          {!soloPerfil && (
            <>
              <RotuloSeccion texto="TU CUENTA" />
              <CampoTexto
                etiqueta="Correo institucional"
                valor={correo}
                alCambiar={setCorreo}
                placeholder="nombre@alumnos.ulagos.cl"
                error={errores.correo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
              <CampoTexto
                etiqueta="Contraseña"
                valor={clave}
                alCambiar={setClave}
                placeholder="Mínimo 6 caracteres"
                error={errores.clave}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <CampoTexto
                etiqueta="Repite la contraseña"
                valor={clave2}
                alCambiar={setClave2}
                placeholder="La misma contraseña"
                error={errores.clave2}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={crear}
              />
            </>
          )}

          {!!aviso && <Aviso tipo="error" mensaje={aviso} />}

          <Boton
            etiqueta={soloPerfil ? 'Guardar y entrar' : 'Crear mi cuenta'}
            tipo="primario"
            Icono={Check}
            onPress={crear}
            cargando={cargando}
          />
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
    paddingTop: 8,
    paddingBottom: 20,
    gap: 16,
  },
  volver: { flexDirection: 'row', alignItems: 'center', gap: 4, height: MEDIDAS.altos.tactilMin, marginLeft: -6, alignSelf: 'flex-start' },
  textoVolver: { ...TIPOGRAFIA.cuerpoDestacado, color: COLORES.azul },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  cuerpo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  grupo: { gap: 8 },
  etiqueta: { ...TIPOGRAFIA.etiqueta, color: COLORES.tinta },
  filaSedes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { ...TIPOGRAFIA.secundario, color: COLORES.error },
});
