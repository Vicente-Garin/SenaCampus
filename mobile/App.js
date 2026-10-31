import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ScrollView
} from "react-native";
import { StatusBar } from "expo-status-bar";
import SignViewer from "./src/components/SignViewer";
import { parseTranscript } from "./src/services/api";
import { COLORS, SPACING, SHADOWS } from "./src/constants/theme";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [sequence, setSequence] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Alert.alert("Atención", "Por favor ingresa una frase para traducir.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const data = await parseTranscript(inputText.trim(), "academico");
      setSequence(data.glosas || []);
    } catch (error) {
      Alert.alert(
        "Error de conexión",
        "No se pudo conectar con el servidor. Revisa que el backend esté corriendo en el puerto 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brandTitle}>SeñaCampus 🤟</Text>
            <Text style={styles.tagline}>Traductor Académico LSCh en Tiempo Real</Text>
          </View>

          <View style={styles.viewerWrapper}>
            <SignViewer sequence={sequence} isTranslating={loading} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Entrada de cátedra / diálogo:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Mañana hay prueba en la sala de clases..."
              placeholderTextColor={COLORS.textoSecundario}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={200}
            />

            <TouchableOpacity
              style={[styles.translateButton, loading && styles.disabledButton]}
              onPress={handleTranslate}
              disabled={loading}
            >
              <Text style={styles.translateButtonText}>
                {loading ? "Traduciendo a glosas..." : "Traducir a LSCh"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.crema
  },
  scrollContent: {
    padding: SPACING.md,
    flexGrow: 1,
    justifyContent: "space-between"
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.coral
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textoSecundario,
    marginTop: 2
  },
  viewerWrapper: {
    marginVertical: SPACING.md
  },
  inputContainer: {
    backgroundColor: COLORS.superficie,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borde,
    ...SHADOWS.card,
    marginBottom: SPACING.lg
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textoPrincipal,
    marginBottom: SPACING.sm
  },
  textInput: {
    backgroundColor: COLORS.crema,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.textoPrincipal,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: COLORS.borde
  },
  translateButton: {
    backgroundColor: COLORS.coral,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md
  },
  disabledButton: {
    opacity: 0.6
  },
  translateButtonText: {
    color: COLORS.blanco,
    fontSize: 15,
    fontWeight: "bold"
  }
});
