import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import { LECTURE_SIMULATIONS } from '../../data/mockData';
import { useSubjects } from '../../context/SubjectsContext';

export default function TraducirScreen() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams();
  const { subjects, saveSessionToSubject } = useSubjects();

  const [isListening, setIsListening] = useState(false);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [activeGlossIndex, setActiveGlossIndex] = useState(0);
  const [history, setHistory] = useState([LECTURE_SIMULATIONS[0]]);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || subjects[0]?.id);

  useEffect(() => {
    if (subjectId) setSelectedSubjectId(subjectId);
  }, [subjectId]);

  const currentSegment = LECTURE_SIMULATIONS[segmentIndex];
  const currentSign = currentSegment.glosses[activeGlossIndex] || currentSegment.glosses[0];

  useEffect(() => {
    if (!isListening) return;
    const timer = setInterval(() => {
      setSegmentIndex((prev) => {
        const next = (prev + 1) % LECTURE_SIMULATIONS.length;
        setActiveGlossIndex(0);
        setHistory((h) => [LECTURE_SIMULATIONS[next], ...h]);
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [isListening]);

  const handleNextPhraseManual = () => {
    const next = (segmentIndex + 1) % LECTURE_SIMULATIONS.length;
    setSegmentIndex(next);
    setActiveGlossIndex(0);
    setHistory((h) => [LECTURE_SIMULATIONS[next], ...h]);
  };

  const handleAttemptBack = () => {
    setIsListening(false);
    setSaveModalVisible(true);
  };

  const exitScreen = () => {
    setSaveModalVisible(false);
    setTopicName('');
    setHistory([LECTURE_SIMULATIONS[0]]);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleConfirmSave = () => {
    const targetId = selectedSubjectId || subjects[0]?.id;
    const formattedSegments = [...history].reverse().map((item) => ({
      time: item.time,
      spoken: item.spoken,
      glosses: item.glosses.map((g) => g.glosa),
    }));

    saveSessionToSubject(targetId, {
      topic: topicName || `Cátedra ${new Date().toLocaleDateString('es-CL')}`,
      segments: formattedSegments,
    });

    setSaveModalVisible(false);
    setTopicName('');
    setHistory([LECTURE_SIMULATIONS[0]]);
    router.replace({
      pathname: '/asignatura/[id]',
      params: { id: targetId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={handleAttemptBack}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Volver</Text>
          </Pressable>

          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>Clase Nueva en Vivo</Text>
            <Text style={styles.subtitle} numberOfLines={1}>Voz docente → LSCh</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isListening ? COLORS.successLight : COLORS.primaryLight },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isListening ? COLORS.success : COLORS.primary },
              ]}
            >
              {isListening ? '● Grabando' : '● Pausa'}
            </Text>
          </View>
        </View>

        <View style={styles.viewerCard}>
          <View style={styles.viewerTop}>
            <Text style={styles.categoryTag}>{currentSign.categoria}</Text>
            <Text style={styles.stepCounter}>
              Seña {activeGlossIndex + 1} de {currentSegment.glosses.length}
            </Text>
          </View>
          <Text style={styles.signEmoji}>🤟</Text>
          <Text style={styles.glosaTitle}>{currentSign.glosa}</Text>
          <Text style={styles.glosaDesc}>{currentSign.mano}</Text>
        </View>

        <Text style={styles.sectionLabel}>Glosas de la frase actual:</Text>
        <View style={{ height: 52, marginBottom: 10 }}>
          <FlatList
            horizontal
            data={currentSegment.glosses}
            keyExtractor={(_, idx) => `${currentSegment.id}-${idx}`}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Pressable
                style={[styles.chip, index === activeGlossIndex && styles.chipActive]}
                onPress={() => setActiveGlossIndex(index)}
              >
                <Text style={[styles.chipText, index === activeGlossIndex && styles.chipTextActive]}>
                  {item.glosa}
                </Text>
              </Pressable>
            )}
          />
        </View>

        <Text style={styles.sectionLabel}>Transcripción capturada ({history.length} bloques):</Text>
        <FlatList
          data={history}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          style={{ flex: 1, marginBottom: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={[styles.transcriptCard, index === 0 && styles.transcriptActive]}>
              <Text style={styles.transcriptTime}>Docente · {item.time}</Text>
              <Text style={styles.transcriptText}>"{item.spoken}"</Text>
            </View>
          )}
        />

        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              isListening && styles.stopBtn,
              pressed && styles.pressed,
            ]}
            onPress={() => setIsListening(!isListening)}
          >
            <Text style={styles.primaryBtnText}>
              {isListening ? 'Pausar Escucha' : 'Escuchar Profesor'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={handleNextPhraseManual}
          >
            <Text style={styles.secondaryBtnText}>Siguiente ›</Text>
          </Pressable>
        </View>

        <Modal visible={saveModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>¿Quieres guardar esta clase?</Text>
              <Text style={styles.modalSub}>
                Se guardará el texto organizado y las glosas para que puedas repasarlas luego.
              </Text>

              <Text style={styles.inputLabel}>Tema de la clase:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Clase 4 - Navegación Móvil"
                placeholderTextColor={COLORS.textMuted}
                value={topicName}
                onChangeText={setTopicName}
              />

              <Text style={styles.inputLabel}>Asignatura destino:</Text>
              <View style={{ maxHeight: 130, marginBottom: 14 }}>
                <FlatList
                  data={subjects}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.subjectOption,
                        selectedSubjectId === item.id && styles.subjectOptionActive,
                      ]}
                      onPress={() => setSelectedSubjectId(item.id)}
                    >
                      <Text
                        style={[
                          styles.subjectOptionText,
                          selectedSubjectId === item.id && styles.subjectOptionTextActive,
                        ]}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>

              <View style={styles.modalActions}>
                <Pressable style={styles.discardBtn} onPress={exitScreen}>
                  <Text style={styles.discardText}>Descartar</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleConfirmSave}>
                  <Text style={styles.saveText}>Guardar clase</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SIZES.padding, paddingTop: 8, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10 },
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
    gap: 4,
  },
  backIcon: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, lineHeight: 24 },
  backText: { fontSize: TYPOGRAPHY.body, fontWeight: 'bold', color: COLORS.primary },
  titleBlock: { flex: 1 },
  title: { fontSize: TYPOGRAPHY.h3, fontWeight: 'bold', color: COLORS.textDark },
  subtitle: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: TYPOGRAPHY.caption, fontWeight: 'bold' },
  viewerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  viewerTop: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  categoryTag: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stepCounter: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '600' },
  signEmoji: { fontSize: 42, marginVertical: 2 },
  glosaTitle: { fontSize: TYPOGRAPHY.h2, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4 },
  glosaDesc: { fontSize: TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  sectionLabel: { fontSize: TYPOGRAPHY.caption, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 6 },
  chip: {
    minHeight: SIZES.touchMin,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: TYPOGRAPHY.body, fontWeight: '600', color: COLORS.textDark },
  chipTextActive: { color: COLORS.surface },
  transcriptCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  transcriptActive: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  transcriptTime: { fontSize: TYPOGRAPHY.caption, color: COLORS.secondary, fontWeight: 'bold', marginBottom: 2 },
  transcriptText: { fontSize: TYPOGRAPHY.body, color: COLORS.textDark, lineHeight: 22 },
  btnRow: { flexDirection: 'row', gap: 10, paddingTop: 4 },
  primaryBtn: {
    flex: 1.4,
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  stopBtn: { backgroundColor: COLORS.secondary },
  primaryBtnText: { fontSize: TYPOGRAPHY.body, fontWeight: 'bold', color: COLORS.surface },
  secondaryBtn: {
    flex: 1,
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  secondaryBtnText: { fontSize: TYPOGRAPHY.body, fontWeight: 'bold', color: COLORS.primary },
  pressed: { opacity: 0.85 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 22 },
  modalTitle: { fontSize: TYPOGRAPHY.h2, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 6 },
  modalSub: { fontSize: TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 14, lineHeight: 20 },
  inputLabel: { fontSize: TYPOGRAPHY.caption, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 6 },
  input: {
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  subjectOption: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    marginBottom: 6,
  },
  subjectOptionActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  subjectOptionText: { fontSize: TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '600' },
  subjectOptionTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  discardBtn: { minHeight: SIZES.touchMin, justifyContent: 'center', paddingHorizontal: 14 },
  discardText: { fontSize: TYPOGRAPHY.body, color: COLORS.error, fontWeight: '600' },
  saveBtn: {
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  saveText: { fontSize: TYPOGRAPHY.body, color: COLORS.surface, fontWeight: 'bold' },
});
