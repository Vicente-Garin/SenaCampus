import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import { useSubjects } from '../../context/SubjectsContext';

export default function AsignaturasScreen() {
  const router = useRouter();
  const { subjects, addSubject } = useSubjects();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRoom, setNewRoom] = useState('');

  const handleAddSubject = () => {
    if (!newTitle.trim()) return;
    addSubject({ title: newTitle, room: newRoom });
    setNewTitle('');
    setNewRoom('');
    setModalVisible(false);
  };

  const renderSubjectItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: item.color },
        pressed && styles.pressed,
      ]}
      onPress={() =>
        router.push({
          pathname: '/asignatura/[id]',
          params: { id: item.id },
        })
      }
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardMeta}>{item.room}</Text>
      <Text style={styles.cardBadge}>
        {(item.sessions || []).length} clases guardadas · Toca para revisar apuntes
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hola, Vicente</Text>
            <Text style={styles.subgreeting}>Revisa tus clases guardadas o inicia una nueva</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => router.push('/ajustes')}
          >
            <Text style={styles.iconText}>⚙️</Text>
          </Pressable>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Mis Asignaturas ({subjects.length})</Text>
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Asignatura</Text>
          </Pressable>
        </View>

        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={renderSubjectItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Pressable
              style={({ pressed }) => [styles.liveBtn, pressed && styles.pressed]}
              onPress={() => router.push('/(tabs)/traducir')}
            >
              <Text style={styles.liveBtnText}>+ Grabar Nueva Clase en Vivo</Text>
            </Pressable>
          }
        />

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nueva Asignatura</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre (ej: Sistemas Operativos)"
                placeholderTextColor={COLORS.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Sala (ej: Laboratorio 3)"
                placeholderTextColor={COLORS.textMuted}
                value={newRoom}
                onChangeText={setNewRoom}
              />
              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleAddSubject}>
                  <Text style={styles.saveText}>Crear</Text>
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
  container: { flex: 1, paddingHorizontal: SIZES.padding, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: TYPOGRAPHY.h1, fontWeight: 'bold', color: COLORS.textDark },
  subgreeting: { fontSize: TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 4 },
  iconBtn: {
    width: SIZES.touchMin,
    height: SIZES.touchMin,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: TYPOGRAPHY.h3, fontWeight: 'bold', color: COLORS.textDark },
  addBtn: {
    minHeight: SIZES.touchMin,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
  card: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: SIZES.radius,
    marginBottom: 14,
    borderLeftWidth: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  pressed: { opacity: 0.85 },
  cardTitle: { fontSize: TYPOGRAPHY.h3, fontWeight: 'bold', color: COLORS.textDark },
  cardMeta: { fontSize: TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 4 },
  cardBadge: { fontSize: TYPOGRAPHY.caption, color: COLORS.secondary, fontWeight: '600', marginTop: 8 },
  liveBtn: {
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.light,
  },
  liveBtnText: { color: COLORS.surface, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 22 },
  modalTitle: { fontSize: TYPOGRAPHY.h2, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 16 },
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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelBtn: { minHeight: SIZES.touchMin, justifyContent: 'center', paddingHorizontal: 16 },
  cancelText: { fontSize: TYPOGRAPHY.body, color: COLORS.textSecondary, fontWeight: '600' },
  saveBtn: {
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  saveText: { fontSize: TYPOGRAPHY.body, color: COLORS.surface, fontWeight: 'bold' },
});
