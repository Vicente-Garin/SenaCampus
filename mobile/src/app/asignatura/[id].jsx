import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import { useSubjects } from '../../context/SubjectsContext';
import ScreenHeader from '../../components/ScreenHeader';

export default function DetalleAsignaturaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { subjects } = useSubjects();

  const subject = subjects.find((s) => s.id === id) || subjects[0];
  const sessions = subject?.sessions || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader title={subject.title} subtitle={subject.room} />

        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Clases Guardadas ({sessions.length})</Text>
          <Pressable
            style={({ pressed }) => [styles.newLiveBtn, pressed && styles.pressed]}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/traducir',
                params: { subjectId: subject.id },
              })
            }
          >
            <Text style={styles.newLiveText}>+ Nueva clase</Text>
          </Pressable>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Aún no hay clases guardadas</Text>
            <Text style={styles.emptySub}>
              Presiona "+ Nueva clase" para grabar la cátedra y guardarla aquí.
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.sessionCard, pressed && styles.pressed]}
                onPress={() =>
                  router.push({
                    pathname: '/sesion/[sessionId]',
                    params: { subjectId: subject.id, sessionId: item.id },
                  })
                }
              >
                <View style={styles.sessionTop}>
                  <Text style={styles.dateBadge}>{item.date}</Text>
                  <Text style={styles.readOnlyTag}>Solo lectura ›</Text>
                </View>
                <Text style={styles.topicTitle}>{item.topic}</Text>
                <Text style={styles.segmentCount}>
                  {item.segments.length} bloques transcritos y traducidos
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SIZES.padding, paddingTop: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: TYPOGRAPHY.h3, fontWeight: 'bold', color: COLORS.textDark },
  newLiveBtn: {
    minHeight: SIZES.touchMin,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
  },
  newLiveText: { color: COLORS.surface, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
  emptyBox: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: TYPOGRAPHY.body, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4 },
  emptySub: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center' },
  sessionCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dateBadge: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readOnlyTag: { fontSize: TYPOGRAPHY.caption, color: COLORS.secondary, fontWeight: 'bold' },
  topicTitle: { fontSize: TYPOGRAPHY.h3, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4 },
  segmentCount: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary },
  pressed: { opacity: 0.85 },
});
