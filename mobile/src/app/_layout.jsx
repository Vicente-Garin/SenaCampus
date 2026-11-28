/**
 * LAYOUT RAÍZ (envuelve a toda la app)
 * - Carga la fuente Nunito antes de mostrar la app (useFonts + SplashScreen).
 * - SafeAreaProvider: permite respetar el notch y la barra de gestos.
 * - ClasesProvider: estado compartido de asignaturas y clases (src/context).
 * - ConversacionesProvider: contactos y conversaciones guardadas de Diálogo.
 * - SesionProvider + GuardiaSesion: Firebase Auth; sin sesión solo se ve Acceso / Crear cuenta.
 * - Stack: navegación en pila; las pantallas nuevas se apilan encima.
 */
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClasesProvider } from '../context/ClasesContext';
import { ConversacionesProvider } from '../context/ConversacionesContext';
import { despertarServidor } from '../services/api';
import { SesionProvider, useSesion } from '../context/SesionContext';
import { COLORES } from '../constants/colores';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

// Mantiene la splash visible hasta que la fuente Nunito termine de cargar
SplashScreen.preventAutoHideAsync();

// Lleva a cada pantalla según la sesión: Acceso, Crear cuenta o la app
const RUTAS_PUBLICAS = [undefined, 'registro'];
function GuardiaSesion() {
  const { estado } = useSesion();
  const segmentos = useSegments();
  const router = useRouter();

  // La splash se esconde de inmediato; si revisar la sesión tarda (servidor dormido), se ve el aviso
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (estado === 'cargando') return;
    const enPublica = RUTAS_PUBLICAS.includes(segmentos[0]);
    if (estado === 'sinSesion' && !enPublica) router.replace('/');
    else if (estado === 'sinPerfil' && segmentos[0] !== 'registro') router.replace('/registro');
    else if (estado === 'listo' && enPublica) router.replace('/(tabs)');
  }, [estado, segmentos, router]);

  if (estado !== 'cargando') return null;
  // Mientras revisa la sesión guardada: pantalla crema con un indicador (sobre la navegación)
  return (
    <View style={[StyleSheet.absoluteFill, estilos.cargando]}>
      <ActivityIndicator size="large" color={COLORES.coral} />
      <Text style={estilos.texto}>Abriendo tu sesión…</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cargando: { backgroundColor: COLORES.crema, justifyContent: 'center', alignItems: 'center', gap: 12 },
  texto: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: COLORES.tintaSuave },
});

export default function RootLayout() {
  const [fuentesCargadas] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  // Despierta el backend de Render apenas se abre la app (ver services/api.js)
  useEffect(() => {
    despertarServidor();
  }, []);

  if (!fuentesCargadas) return null;

  return (
    <SafeAreaProvider>
      {/* ClasesProvider comparte las clases guardadas con todas las pantallas */}
      <SesionProvider>
        <ClasesProvider>
          <ConversacionesProvider>
            {/* Stack = pila: cada pantalla nueva se apila encima y «Volver» la saca. */}
            <Stack screenOptions={{ headerShown: false }} />
            <GuardiaSesion />
          </ConversacionesProvider>
        </ClasesProvider>
      </SesionProvider>
    </SafeAreaProvider>
  );
}
