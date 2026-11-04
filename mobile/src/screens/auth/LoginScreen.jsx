import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}><Text style={styles.badgeText}>S</Text></View>
      <Text style={styles.title}>Tus clases, en señas.</Text>
      <Text style={styles.subtitle}>Entra con tu cuenta, sin contraseñas nuevas.</Text>

      <TouchableOpacity 
        style={styles.buttonPrimary} 
        onPress={() => navigation.replace('MainTabs')}
      >
        <Text style={styles.buttonPrimaryText}>Entrar con mi correo institucional</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.buttonSecondary} 
        onPress={() => navigation.replace('MainTabs')}
      >
        <Text style={styles.buttonSecondaryText}>Acceso rápido (Demo)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding, justifyContent: 'center' },
  badge: { width: 56, height: 56, backgroundColor: COLORS.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  badgeText: { color: COLORS.surface, fontSize: 28, fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: 32 },
  buttonPrimary: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 12, ...SHADOWS.light },
  buttonPrimaryText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  buttonSecondary: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  buttonSecondaryText: { color: COLORS.textDark, fontSize: 16, fontWeight: '600' }
});
