import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

// Mantiene la splash visible hasta que la fuente Nunito termine de cargar
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fuentesCargadas] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fuentesCargadas) {
      SplashScreen.hideAsync();
    }
  }, [fuentesCargadas]);

  if (!fuentesCargadas) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
