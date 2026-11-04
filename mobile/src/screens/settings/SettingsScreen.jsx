import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ajustes</Text>
      <Text style={styles.subtitle}>Hazla tuya.</Text>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Texto grande</Text>
        <Text style={styles.itemSub}>Aumentar tamaño de letra en transcripción</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Mostrar subtítulos</Text>
        <Text style={styles.itemSub}>Activar subtítulos automáticos en cátedra</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Velocidad de las señas</Text>
        <Text style={styles.itemSub}>1x (normal)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Idioma de la voz</Text>
        <Text style={styles.itemSub}>Español de Chile (es-CL)</Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding, paddingTop: 56 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backArrow: { color: COLORS.primary, fontSize: 28, fontWeight: '700', lineHeight: 28, marginRight: 4 },
  backText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.textDark },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: COLORS.surface, padding: 16, borderRadius: SIZES.radius, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.light },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textDark },
  itemSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  logoutBtn: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  logoutText: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold' }
});
