import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

export default function DialogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversar</Text>
      <View style={styles.viewerBox}>
        <Text style={styles.placeholderText}>Visor de señas (Interlocutor)</Text>
      </View>
      <View style={styles.chatArea}>
        <Text style={styles.chatPlaceholder}>Burbujas: lo que dice la otra persona y lo que escribes tú.</Text>
      </View>
      <TextInput 
        style={styles.input} 
        placeholder="Escribe tu mensaje aquí..." 
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 12 },
  viewerBox: { height: 160, backgroundColor: COLORS.cardPeach, borderRadius: SIZES.radius, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: COLORS.textMuted, fontSize: 14 },
  chatArea: { flex: 1, backgroundColor: COLORS.surface, marginVertical: 14, borderRadius: SIZES.radius, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  chatPlaceholder: { color: COLORS.textMuted, fontSize: 13 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.textDark }
});
