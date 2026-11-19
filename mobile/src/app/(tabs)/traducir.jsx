import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SIZES } from '../../constants/theme';
import { LECTURE_SIMULATIONS } from '../../data/mockData';
import { useSubjects } from '../../context/SubjectsContext';

export default function TraducirScreen() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams();
  const { subjects, saveSessionToSubject } = useSubjects();

  const [isListening, setIsListening] = useState(true);
  const [speed, setSpeed] = useState('1x');
  const [isRepeating, setIsRepeating] = useState(false);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [activeGlossIndex, setActiveGlossIndex] = useState(0);
  const [history, setHistory] = useState([LECTURE_SIMULATIONS[0]]);

  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || subjects[0]?.id);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const currentSegment = LECTURE_SIMULATIONS[segmentIndex];
  const currentSign = currentSegment.glosses[activeGlossIndex] || currentSegment.glosses[0];

  useEffect(() => {
    if (subjectId) setSelectedSubjectId(subjectId);
  }, [subjectId]);

  useEffect(() => {
    if (!isListening) return;
    const intervalMs = speed === '1x' ? 4500 : 2500;
    const timer = setInterval(() => {
      setSegmentIndex((prev) => {
        const next = (prev + 1) % LECTURE_SIMULATIONS.length;
        setActiveGlossIndex(0);
        setHistory((h) => [LECTURE_SIMULATIONS[next], ...h]);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isListening, speed]);

  const handleRepeatSign = () => {
    setIsRepeating(true);
    setTimeout(() => setIsRepeating(false), 900);
  };

  const handleOpenFinishModal = () => {
    setIsListening(false);
    setFinishModalVisible(true);
  };

  const handleConfirmSave = () => {
    const targetId = currentSubject?.id || subjects[0]?.id;
    const formattedSegments = [...history].reverse().map((item) => ({
      time: item.time,
      spoken: item.spoken,
      glosses: item.glosses.map((g) => g.glosa),
    }));

    saveSessionToSubject(targetId, {
      topic: topicName || `Clase del ${new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}`,
      segments: formattedSegments,
    });

    setFinishModalVisible(false);
    setTopicName('');
    setHistory([LECTURE_SIMULATIONS[0]]);
    router.replace({
      pathname: '/asignatura/[id]',
      params: { id: targetId },
    });
  };

  const handleContinueTranslating = () => {
    setFinishModalVisible(false);
    setIsListening(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={handleOpenFinishModal}>
            <Text style={styles.backText}>‹ Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentSubject?.title || 'Tecnologías Web y Móviles'}
          </Text>
        </View>

        <View style={styles.livePillRow}>
          <View style={[styles.livePill, !isListening && { backgroundColor: COLORS.textSecondary }]}>
            <Text style={styles.livePillText}>
              {isListening ? '🎙️ Escuchando · es-CL' : '⏸️ En pausa · es-CL'}
            </Text>
          </View>
        </View>

        <View style={[styles.viewerCard, isRepeating && styles.viewerCardRepeat]}>
          <Text style={styles.avatarEmoji}>🧑🏽‍🏫</Text>
          <View style={styles.signBadge}>
            <Text style={styles.signBadgeText}>
              {isRepeating ? `↻ Repitiendo · ${currentSign.glosa}` : `Seña · ${currentSign.glosa}`}
            </Text>
          </View>
          <Text style={styles.signDesc}>{currentSign.mano}</Text>
        </View>

        <View style={styles.utilityRow}>
          <Pressable style={styles.utilityBtn} onPress={handleRepeatSign}>
            <Text style={styles.utilityText}>↻ Repetir seña</Text>
          </Pressable>
          <Pressable
            style={styles.utilityBtn}
            onPress={() => setSpeed((s) => (s === '1x' ? '1.5x' : '1x'))}
          >
            <Text style={styles.utilityText}>⏱ Velocidad {speed}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>PRÓXIMAS SEÑAS</Text>
        <View style={{ height: 48, marginBottom: 10 }}>
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

        <View style={styles.captionBox}>
          <Text style={styles.captionText}>"...{currentSegment.spoken}"</Text>
        </View>

        <View style={styles.bottomRow}>
          <Pressable
            style={[styles.pauseBtn, !isListening && { backgroundColor: COLORS.secondary }]}
            onPress={() => setIsListening(!isListening)}
          >
            <Text style={styles.pauseBtnText}>{isListening ? '⏸ Pausar' : '▶ Reanudar'}</Text>
          </Pressable>

          <Pressable style={styles.finishBtn} onPress={handleOpenFinishModal}>
            <Text style={styles.finishBtnText}>⏹ Terminar</Text>
          </Pressable>
        </View>

        <Modal visible={finishModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>¿Terminar la clase?</Text>
              <Text style={styles.modalSub}>
                Guardaremos la transcripción en {currentSubject?.title}.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Título opcional (ej: Clase del 19 de noviembre)"
                placeholderTextColor={COLORS.textMuted}
                value={topicName}
                onChangeText={setTopicName}
              />

              <Pressable style={styles.confirmSaveBtn} onPress={handleConfirmSave}>
                <Text style={styles.confirmSaveText}>Sí, terminar y guardar</Text>
              </Pressable>

              <Pressable style={styles.continueBtn} onPress={handleContinueTranslating}>
                <Text style={styles.continueText}>Seguir traduciendo</Text>
              </Pressable>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  backBtn: {
    minHeight: SIZES.touchMin,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backText: { fontSize: TYPOGRAPHY.body, fontWeight: 'bold', color: COLORS.secondary },
  headerTitle: { flex: 1, fontSize: TYPOGRAPHY.h3, fontWeight: 'bold', color: COLORS.textDark },
  livePillRow: { alignItems: 'flex-start', marginBottom: 10 },
  livePill: { backgroundColor: COLORS.secondary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  livePillText: { color: COLORS.surface, fontSize: TYPOGRAPHY.caption, fontWeight: 'bold' },
  viewerCard: {
    backgroundColor: '#FAD7B8',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  viewerCardRepeat: {
    borderColor: COLORS.secondary,
    backgroundColor: '#F6C8A0',
  },
  avatarEmoji: { fontSize: 54, marginBottom: 6 },
  signBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
  },
  signBadgeText: { color: COLORS.secondary, fontSize: TYPOGRAPHY.caption, fontWeight: 'bold' },
  signDesc: { fontSize: TYPOGRAPHY.caption, color: COLORS.textDark, textAlign: 'center' },
  utilityRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  utilityBtn: {
    flex: 1,
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  utilityText: { fontSize: TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.textDark },
  sectionLabel: { fontSize: TYPOGRAPHY.caption, fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 6 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  chipText: { fontSize: TYPOGRAPHY.caption, fontWeight: 'bold', color: COLORS.textDark },
  chipTextActive: { color: COLORS.surface },
  captionBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    marginBottom: 12,
  },
  captionText: { fontSize: TYPOGRAPHY.body, color: COLORS.textDark, lineHeight: 22 },
  bottomRow: { flexDirection: 'row', gap: 12 },
  pauseBtn: {
    flex: 1,
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseBtnText: { color: COLORS.surface, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
  finishBtn: {
    flex: 1,
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishBtnText: { color: COLORS.textDark, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: TYPOGRAPHY.h2, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  modalSub: { fontSize: TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 16 },
  input: {
    width: '100%',
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  confirmSaveBtn: {
    width: '100%',
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmSaveText: { color: COLORS.surface, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
  continueBtn: { minHeight: SIZES.touchMin, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  continueText: { color: COLORS.secondary, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
});
