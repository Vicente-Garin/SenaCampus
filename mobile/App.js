import React from 'react';
import { StyleSheet, SafeAreaView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SignViewer from './src/components/SignViewer';
import { COLORS, SPACING } from './src/constants/theme';

export default function App() {
  const sampleSequence = [
    {
      id: 'GL_PRUEBA',
      termino: 'prueba',
      categoria: 'academico',
      tipo: 'lottie',
      asset: 'assets/signs/common/prueba.json',
      deletreo: null
    },
    {
      id: 'GL_MATEMATICA',
      termino: 'matematica',
      categoria: 'general',
      tipo: 'dactilologia',
      asset: null,
      deletreo: ['M', 'A', 'T', 'E', 'M', 'A', 'T', 'I', 'C', 'A']
    },
    {
      id: 'GL_SALA_DE_CLASES',
      termino: 'sala de clases',
      categoria: 'lugares',
      tipo: 'lottie',
      asset: 'assets/signs/common/sala.json',
      deletreo: null
    }
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.appTitle}>SeñaCampus</Text>
        <Text style={styles.subtitle}>Visor de Traducción en Vivo</Text>
      </View>
      <View style={styles.content}>
        <SignViewer sequence={sampleSequence} isTranslating={false} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.crema
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.coral
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textoSecundario,
    marginTop: 2
  },
  content: {
    flex: 1,
    padding: SPACING.md
  }
});
