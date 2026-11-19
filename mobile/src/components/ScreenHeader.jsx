import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/theme';

export default function ScreenHeader({ title, subtitle, showBack = true, rightElement }) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Volver atrás"
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      ) : null}

      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      {rightElement ? <View style={styles.rightSlot}>{rightElement}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  backBtn: {
    minHeight: SIZES.touchMin,
    minWidth: SIZES.touchMin,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  backIcon: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, lineHeight: 24 },
  backText: { fontSize: TYPOGRAPHY.body, fontWeight: 'bold', color: COLORS.primary },
  titleBlock: { flex: 1 },
  title: { fontSize: TYPOGRAPHY.h2, fontWeight: 'bold', color: COLORS.textDark },
  subtitle: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  rightSlot: { alignItems: 'flex-end' },
  pressed: { opacity: 0.8 },
});
