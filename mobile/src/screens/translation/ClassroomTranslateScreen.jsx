import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import SignViewer from '../../components/SignViewer';

export default function ClassroomTranslateScreen() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subjectTitle}>Tecnologías Web y Móviles</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{isRecording ? '? Escuchando · es-CL' : '? Pausado'}</Text>
        </View>
      </View>

      <View style={styles.viewerContainer}>
        <SignViewer />
      </View>

      <View style={styles.transcriptionBox}>
        <Text style={styles.transcriptionText}>
          ...mañana hay prueba sobre arquitectura de servicios.
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.pauseButton} 
          onPress={() => setIsRecording(!isRecording)}
        >
          <Text style={styles.pauseText}>{isRecording ? 'Pausar' : 'Reanudar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding, paddingTop: 50 },
  header: { marginBottom: 16 },
  subjectTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6, borderWidth: 1, borderColor: COLORS.border },
  statusText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  viewerContainer: { height: 260, backgroundColor: COLORS.cardPeach, borderRadius: SIZES.radius, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  transcriptionBox: { backgroundColor: COLORS.surface, padding: 16, borderRadius: SIZES.radius, marginVertical: 16, minHeight: 90, borderWidth: 1, borderColor: COLORS.border },
  transcriptionText: { fontSize: 15, color: COLORS.textDark, fontStyle: 'italic' },
  controls: { marginTop: 'auto', marginBottom: 20 },
  pauseButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  pauseText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' }
});
