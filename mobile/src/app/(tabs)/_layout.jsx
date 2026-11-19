import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          minHeight: 48,
          justifyContent: 'center',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.caption,
          fontWeight: '700',
          marginTop: Platform.OS === 'android' ? 2 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Asignaturas',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📚</Text>,
        }}
      />
      <Tabs.Screen
        name="traducir"
        options={{
          title: 'Traducir',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🤟</Text>,
        }}
      />
      <Tabs.Screen
        name="dialogo"
        options={{
          title: 'Diálogo',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>,
        }}
      />
    </Tabs>
  );
}
