import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { SubjectsProvider } from '../context/SubjectsContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SubjectsProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="ajustes" />
          <Stack.Screen name="asignatura/[id]" />
          <Stack.Screen name="sesion/[sessionId]" />
        </Stack>
      </SubjectsProvider>
    </SafeAreaProvider>
  );
}
