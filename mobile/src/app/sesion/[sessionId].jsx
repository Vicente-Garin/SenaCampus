import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import { useSubjects } from '../../context/SubjectsContext';
import ScreenHeader from '../../components/ScreenHeader';

export default function SesionGuardadaScreen() {
  const { subjectId, sessionId } = useLocalSearchParams();
  const { subjects } = useSubjects();

  const subject = subjects.find((s) => s.id === subjectId) || subjects[0];
  const session = (subject?.sessions || []).find((ses) => ses.id === sessionId) || subject?.sessions?.[0];

  if (!session) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader title="Clase Guardada" subtitle={`${subject.title} · ${session.date}`} />

        <View style={styles.headerCard}>
          <Text style={styles.topicLabel}>TEMA DE LA CÁTEDRA</Text>
          <Text style={styles.topicTitle}>{session.topic}</Text>
        </View>

        <FlatList
          data={session.segments}
          keyExtractor={(_, idx) => String(idx)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <View style={styles.blockCard}>
              <Text style={styles.blockMeta}>Bloque {index + 1} · {item.time}</Text>
              <Text style={styles.spokenText}>{item.spoken}</Text>

              <View style={styles.glossRow}>
                {(item.glosses || []).map((g, gIdx) => (
                  <View key={gIdx} style={styles.glossPill}>
                    <Text style={styles.glossText}>🤟 {g}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SIZES.padding, paddingTop: 8 },
  headerCard: {
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 14,
  },
  topicLabel: { fontSize: TYPOGRAPHY.caption, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  topicTitle: { fontSize: TYPOGRAPHY.h2, fontWeight: 'bold', color: COLORS.textDark },
  blockCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  blockMeta: { fontSize: TYPOGRAPHY.caption, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 6 },
  spokenText: { fontSize: TYPOGRAPHY.body, color: COLORS.textDark, lineHeight: 24, marginBottom: 12 },
  glossRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  glossPill: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  glossText: { fontSize: TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.textDark },
});
