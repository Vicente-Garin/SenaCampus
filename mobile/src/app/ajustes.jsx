import React, { useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';

export default function AjustesScreen() {
  const router = useRouter();
  const [largeText, setLargeText] = useState(false);
  const [subtitles, setSubtitles] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader title="Ajustes" subtitle="Accesibilidad en aula" />

        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Subtítulos automáticos</Text>
            <Text style={styles.itemSub}>Mostrar transcripción junto a la seña</Text>
          </View>
          <Switch value={subtitles} onValueChange={setSubtitles} trackColor={{ true: COLORS.primary }} />
        </View>

        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Texto ampliado</Text>
            <Text style={styles.itemSub}>Aumentar tamaño de lectura en cátedra</Text>
          </View>
          <Switch value={largeText} onValueChange={setLargeText} trackColor={{ true: COLORS.primary }} />
        </View>

        <Pressable style={styles.logoutBtn} onPress={() => router.replace('/')}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.padding },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  itemTitle: { fontSize: TYPOGRAPHY.body, fontWeight: 'bold', color: COLORS.textDark },
  itemSub: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  logoutBtn: {
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: { color: COLORS.primary, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
});
