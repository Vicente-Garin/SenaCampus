import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Hand, MessageCircle } from 'lucide-react-native';
import { COLORES } from '../../constants/colores';
import { TIPOGRAFIA } from '../../constants/tipografia';
import { MEDIDAS } from '../../constants/medidas';

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
