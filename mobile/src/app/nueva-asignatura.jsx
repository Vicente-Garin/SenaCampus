import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { BarraSuperior } from '../components/BarraSuperior';
import { CampoTexto } from '../components/CampoTexto';
import { Boton } from '../components/Boton';
import { useClases } from '../context/ClasesContext';

// Pantalla 17 · Nueva asignatura (se abre con "+ Agregar" en Asignaturas)
export default function NuevaAsignaturaScreen() {
  const router = useRouter();
  const { agregarAsignatura } = useClases();

  // Un estado por campo: cada TextInput es controlado
  const [nombre, setNombre] = useState('');
  const [sala, setSala] = useState('');
  const [profesor, setProfesor] = useState('');
  const [horario, setHorario] = useState('');
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  // Validación: el nombre es obligatorio (prevención de errores)
  const errorNombre = intentoGuardar && !nombre.trim() ? 'Escribe el nombre de la asignatura.' : '';

  const guardar = () => {
    setIntentoGuardar(true);
    if (!nombre.trim()) return;
    const id = agregarAsignatura({ nombre, sala, profesor, horario });
    // Reemplaza esta pantalla por el detalle de la asignatura recién creada
    router.replace(`/asignatura/${id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flexUno}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contenedor}>
          <BarraSuperior textoVolver="Asignaturas" />

          <ScrollView
            contentContainerStyle={styles.formulario}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.titulo}>Nueva asignatura</Text>
            <Text style={styles.cuerpo}>
              Agrégala para traducir sus clases y guardar su historial.
            </Text>

            <CampoTexto
              etiqueta="Nombre de la asignatura"
              valor={nombre}
              alCambiar={setNombre}
              placeholder="Ej.: Cálculo II"
              error={errorNombre}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
            <CampoTexto
              etiqueta="Sala"
              valor={sala}
              alCambiar={setSala}
              placeholder="Ej.: B-204"
              autoCapitalize="characters"
            />
            <CampoTexto
              etiqueta="Profesor/a"
              valor={profesor}
              alCambiar={setProfesor}
              placeholder="Ej.: Prof. Andrés Morales"
              autoCapitalize="words"
            />
            <CampoTexto
              etiqueta="Horario"
              valor={horario}
              alCambiar={setHorario}
              placeholder="Ej.: Lunes y miércoles, 10:15"
              ayuda="Opcional. Puedes completarlo después."
            />
          </ScrollView>

          <View style={styles.accionInferior}>
            <Boton etiqueta="Guardar asignatura" tipo="primario" Icono={Check} onPress={guardar} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORES.crema },
  flexUno: { flex: 1 },
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingBottom: 14,
  },
  formulario: { gap: 16, paddingBottom: 16 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  cuerpo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave, marginTop: -8 },
  accionInferior: { paddingTop: 8 },
});
