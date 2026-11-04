import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function SubjectDetailScreen({ route, navigation }) {
  const { title } = route.params || { title: 'Asignatura' };

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

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>Sala 102 · Profesor/a · Horario</Text>

      <TouchableOpacity 
        style={styles.actionBtn} 
        onPress={() => navigation.navigate('TraducirTab')}
      >
        <Text style={styles.actionText}>Traducir esta clase</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding, paddingTop: 56 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backArrow: { color: COLORS.primary, fontSize: 28, fontWeight: '700', lineHeight: 28, marginRight: 4 },
  backText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark },
  meta: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, marginBottom: 24 },
  actionBtn: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', ...SHADOWS.light },
  actionText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' }
});
