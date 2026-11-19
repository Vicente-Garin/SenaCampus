import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('vicente.garin@alumnos.ulagos.cl');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = () => {
    if (!email.trim().includes('@')) {
      setErrorMsg('Ingresa un correo institucional válido.');
      return;
    }
    setErrorMsg('');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SC</Text>
        </View>

        <Text style={styles.title}>SeñaCampus</Text>
        <Text style={styles.subtitle}>
          Tus clases universitarias traducidas en tiempo real a Lengua de Señas Chilena (LSCh).
        </Text>

        <Text style={styles.label}>Correo institucional</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errorMsg) setErrorMsg('');
          }}
          placeholder="nombre@alumnos.ulagos.cl"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
          onPress={handleLogin}
        >
          <Text style={styles.primaryBtnText}>Ingresar a mis clases</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.padding, justifyContent: 'center' },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.card,
  },
  badgeText: { color: COLORS.surface, fontSize: 24, fontWeight: 'bold' },
  title: { fontSize: TYPOGRAPHY.h1, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  subtitle: { fontSize: TYPOGRAPHY.body, color: COLORS.textSecondary, lineHeight: 24, marginBottom: 28 },
  label: { fontSize: TYPOGRAPHY.body, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  input: {
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  errorText: { color: COLORS.error, fontSize: TYPOGRAPHY.caption, marginBottom: 12, fontWeight: '600' },
  primaryBtn: {
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.light,
  },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  primaryBtnText: { color: COLORS.surface, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
});
