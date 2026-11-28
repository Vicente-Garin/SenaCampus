/**
 * PANTALLA · NUEVO CONTACTO · ruta "/nuevo-contacto"
 * - Nombre (obligatorio) y tipo de contacto (chips).
 * - Guardar -> agregarContacto() en el Context -> abre su conversación.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { BarraSuperior } from '../components/BarraSuperior';
import { CampoTexto } from '../components/CampoTexto';
import { Chip } from '../components/Chip';
import { Boton } from '../components/Boton';
import { Pantalla, BandaEncabezado, RotuloSeccion, PanelAcciones } from '../components/Secciones';
import { useConversaciones, TIPOS_CONTACTO } from '../context/ConversacionesContext';

export default function NuevoContactoScreen() {
  const router = useRouter();
  const { agregarContacto } = useConversaciones();

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(TIPOS_CONTACTO[0]);
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  const errorNombre = intentoGuardar && !nombre.trim() ? 'Escribe el nombre del contacto.' : '';

  const guardar = () => {
    setIntentoGuardar(true);
    if (!nombre.trim()) return;
    const id = agregarContacto({ nombre, tipo });
    // Reemplaza esta pantalla por la conversación del contacto recién creado
    router.replace(`/contacto/${id}`);
  };

  return (
    <Pantalla>
      <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.contenedor}>
          <BandaEncabezado style={styles.banda}>
            <BarraSuperior textoVolver="Diálogo" />
            <Text style={styles.titulo}>Nuevo contacto</Text>
            <Text style={styles.cuerpo}>
              Para las personas con las que conversas seguido. Su conversación queda guardada.
            </Text>
          </BandaEncabezado>

          <ScrollView
            contentContainerStyle={styles.formulario}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <RotuloSeccion texto="DATOS DEL CONTACTO" />
            <CampoTexto
              etiqueta="Nombre"
              valor={nombre}
              alCambiar={setNombre}
              placeholder="Ej.: Prof. Andrés Morales"
              error={errorNombre}
              autoCapitalize="words"
            />

            <Text style={styles.etiqueta}>¿Quién es?</Text>
            <View style={styles.tipos}>
              {TIPOS_CONTACTO.map((t) => (
                <Chip
                  key={t}
                  texto={t}
                  estado={t === tipo ? 'activo' : 'normal'}
                  onPress={() => setTipo(t)}
                />
              ))}
            </View>
          </ScrollView>

          <PanelAcciones>
            <Boton etiqueta="Guardar contacto" tipo="primario" Icono={Check} onPress={guardar} />
          </PanelAcciones>
        </View>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flexUno: { flex: 1 },
  contenedor: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margenPantalla,
    paddingBottom: 14,
    gap: 14,
  },
  banda: { paddingTop: 0 },
  formulario: { gap: 16, paddingBottom: 16 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  cuerpo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  etiqueta: { ...TIPOGRAFIA.etiqueta, color: COLORES.tinta },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
