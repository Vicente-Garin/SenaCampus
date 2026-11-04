import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from '../constants/theme';

import SubjectsScreen from '../screens/subjects/SubjectsScreen';
import ClassroomTranslateScreen from '../screens/translation/ClassroomTranslateScreen';
import DialogScreen from '../screens/dialog/DialogScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="AsignaturasTab" 
        component={SubjectsScreen}
        options={{
          tabBarLabel: 'Asignaturas',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📚</Text>,
        }}
      />
      <Tab.Screen 
        name="TraducirTab" 
        component={ClassroomTranslateScreen}
        options={{
          tabBarLabel: 'Traducir',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🤟</Text>,
        }}
      />
      <Tab.Screen 
        name="DialogoTab" 
        component={DialogScreen}
        options={{
          tabBarLabel: 'Diálogo',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💬</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
