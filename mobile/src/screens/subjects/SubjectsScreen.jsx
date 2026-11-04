import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

export default function SubjectsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, Vicente</Text>
          <Text style={styles.subgreeting}>¿Qué clase vas a seguir hoy?</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.menuIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.subjectCard, { borderLeftColor: COLORS.cardPeach }]}
        onPress={() => navigation.navigate('SubjectDetail', { title: 'Tecnologías Web y Móviles' })}
      >
        <Text style={styles.subjectTitle}>Tecnologías Web y Móviles</Text>
        <Text style={styles.subjectMeta}>Sala 102 · 4 transcripciones</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.subjectCard, { borderLeftColor: COLORS.cardYellow }]}
        onPress={() => navigation.navigate('SubjectDetail', { title: 'Ingeniería de Software' })}
      >
        <Text style={styles.subjectTitle}>Ingeniería de Software</Text>
        <Text style={styles.subjectMeta}>Sala 204 · 2 transcripciones</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.resumeButton}
        onPress={() => navigation.navigate('TraducirTab')}
      >
        <Text style={styles.resumeButtonText}>Iniciar Cátedra en Vivo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark },
  subgreeting: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  menuButton: { padding: 8, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  menuIcon: { fontSize: 18 },
  subjectCard: { 
    backgroundColor: COLORS.surface, 
    padding: 18, 
    borderRadius: SIZES.radius, 
    marginBottom: 14, 
    borderLeftWidth: 6, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    ...SHADOWS.card 
  },
  subjectTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  subjectMeta: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  resumeButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  resumeButtonText: { color: COLORS.surface, fontSize: 15, fontWeight: 'bold' }
});
