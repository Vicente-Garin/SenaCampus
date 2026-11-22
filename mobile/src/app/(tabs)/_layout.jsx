/**
 * LAYOUT DE PESTAÑAS · grupo (tabs)
 * - Los paréntesis forman un "grupo": (tabs) no aparece en la ruta.
 * - Cada <Tabs.Screen name="..."> es un archivo de esta carpeta:
 *   index = Asignaturas · traducir = Traducir · dialogo = Diálogo.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Hand, MessageCircle } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';

// Cápsula azul detrás del ícono de la pestaña activa (focused), igual que en el Figma.
function IconoPestana({ Icono, focused, color }) {
  return (
    <View style={[styles.capsula, focused && styles.capsulaActiva]}>
      <Icono size={24} strokeWidth={2} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    // Tabs = barra de pestañas inferior (patrón móvil, al alcance del pulgar).
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORES.azul,
        tabBarInactiveTintColor: COLORES.tintaSuave,
        tabBarLabelStyle: {
          ...TIPOGRAFIA.etiqueta,
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: COLORES.blanco,
          borderTopWidth: 1,
          borderTopColor: COLORES.borde,
          // Se suma insets.bottom para no quedar bajo la barra de gestos (zona segura).
          height: MEDIDAS.altos.barraPestanas + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Asignaturas',
          tabBarIcon: ({ focused, color }) => (
            <IconoPestana Icono={BookOpen} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="traducir"
        options={{
          title: 'Traducir',
          tabBarIcon: ({ focused, color }) => (
            <IconoPestana Icono={Hand} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dialogo"
        options={{
          title: 'Diálogo',
          tabBarIcon: ({ focused, color }) => (
            <IconoPestana Icono={MessageCircle} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  capsula: {
    width: 64,
    height: 32,
    borderRadius: MEDIDAS.radios.pestana,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capsulaActiva: {
    backgroundColor: COLORES.azulSuave,
  },
});
