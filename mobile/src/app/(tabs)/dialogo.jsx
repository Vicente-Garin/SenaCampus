import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import { QUICK_PHRASES } from '../../data/mockData';
import ScreenHeader from '../../components/ScreenHeader';

export default function DialogoScreen() {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'system', text: 'Toca una frase rápida o escribe tu pregunta para mostrarla al docente.' },
  ]);
  const [draft, setDraft] = useState('');

  const sendMessage = (textToSend) => {
    const clean = textToSend.trim();
    if (!clean) return;
    setMessages((prev) => [
      { id: String(Date.now()), sender: 'student', text: clean },
      ...prev,
    ]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader
          title="Diálogo en Aula"
          subtitle="Respuesta rápida del estudiante"
        />

        <View style={{ height: 52, marginBottom: 10 }}>
          <FlatList
            horizontal
            data={QUICK_PHRASES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable style={styles.quickPill} onPress={() => sendMessage(item)}>
                <Text style={styles.quickPillText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>

        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.sender === 'student' ? styles.studentBubble : styles.systemBubble]}>
              <Text style={[styles.bubbleText, item.sender === 'student' && styles.studentText]}>
                {item.text}
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Escribe tu consulta al profesor..."
            placeholderTextColor={COLORS.textMuted}
          />
          <Pressable style={styles.sendBtn} onPress={() => sendMessage(draft)}>
            <Text style={styles.sendBtnText}>Enviar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SIZES.padding, paddingTop: 8, paddingBottom: 12 },
  quickPill: {
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginRight: 10,
  },
  quickPillText: { fontSize: TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.primary },
  bubble: { padding: 16, borderRadius: 16, marginBottom: 10, maxWidth: '88%' },
  systemBubble: { backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.border },
  studentBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', ...SHADOWS.light },
  bubbleText: { fontSize: TYPOGRAPHY.body, color: COLORS.textDark, lineHeight: 22 },
  studentText: { color: COLORS.surface, fontWeight: '600' },
  composer: { flexDirection: 'row', gap: 10, paddingTop: 6 },
  input: {
    flex: 1,
    minHeight: SIZES.touchMin,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textDark,
  },
  sendBtn: {
    minHeight: SIZES.touchMin,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sendBtnText: { color: COLORS.surface, fontSize: TYPOGRAPHY.body, fontWeight: 'bold' },
});
