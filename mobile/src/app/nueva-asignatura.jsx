/**
 * PANTALLA 17 · NUEVA ASIGNATURA · ruta "/nueva-asignatura"
 * - Formulario con TextInput controlados (componente CampoTexto).
 * - Horario sin escribir a mano: días con chips y horas solo con números (1015 → 10:15).
 * - Validación: el nombre es obligatorio (prevención de errores).
 * - Guardar -> agregarAsignatura() en el Context -> abre su detalle.
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
import { useClases } from '../context/ClasesContext';

const DIAS = [
  { corto: 'Lun', largo: 'lunes' },
  { corto: 'Mar', largo: 'martes' },
  { corto: 'Mié', largo: 'miércoles' },
  { corto: 'Jue', largo: 'jueves' },
  { corto: 'Vie', largo: 'viernes' },
  { corto: 'Sáb', largo: 'sábado' },
];

// Solo deja números y pone los dos puntos solo: "1015" → "10:15"
function formatearHora(texto) {
  const digitos = texto.replace(/\D/g, '').slice(0, 4);
  return digitos.length <= 2 ? digitos : `${digitos.slice(0, 2)}:${digitos.slice(2)}`;
}

const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/;

// ['lunes', 'miércoles'] → "Lunes y miércoles"
function unirDias(dias) {
  if (!dias.length) return '';
  const texto = dias.length === 1 ? dias[0] : `${dias.slice(0, -1).join(', ')} y ${dias[dias.length - 1]}`;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Pantalla 17 · Nueva asignatura (se abre con "+ Agregar" en Asignaturas)
export default function NuevaAsignaturaScreen() {
  const router = useRouter();
  const { agregarAsignatura } = useClases();

  // Un estado por campo: cada TextInput es controlado
  const [nombre, setNombre] = useState('');
  const [sala, setSala] = useState('');
  const [profesor, setProfesor] = useState('');
  const [dias, setDias] = useState([]); // índices de DIAS elegidos
  const [inicio, setInicio] = useState('');
  const [termino, setTermino] = useState('');
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  // Validación: el nombre es obligatorio (prevención de errores)
  const errorNombre = intentoGuardar && !nombre.trim() ? 'Escribe el nombre de la asignatura.' : '';

  // Las horas son opcionales, pero si se escriben deben ser válidas (00:00 a 23:59)
  const errorInicio = intentoGuardar && inicio && !HORA_VALIDA.test(inicio) ? 'Hora no válida. Ej.: 10:15' : '';
  const errorTermino = intentoGuardar && termino
    ? !HORA_VALIDA.test(termino)
      ? 'Hora no válida. Ej.: 11:45'
      : HORA_VALIDA.test(inicio) && termino <= inicio
        ? 'Debe ser después del inicio.'
        : ''
    : '';

  const alternarDia = (i) =>
    setDias((prev) => (prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort((a, b) => a - b)));

  // Arma el texto que se muestra en la app: "Lunes y miércoles, 10:15 – 11:45"
  const armarHorario = () => {
    const textoDias = unirDias(dias.map((i) => DIAS[i].largo));
    const textoHoras = inicio && termino ? `${inicio} – ${termino}` : inicio;
    return [textoDias, textoHoras].filter(Boolean).join(', ');
  };

  const guardar = () => {
    setIntentoGuardar(true);
    const horasMalas = (inicio && !HORA_VALIDA.test(inicio))
      || (termino && (!HORA_VALIDA.test(termino) || (HORA_VALIDA.test(inicio) && termino <= inicio)));
    if (!nombre.trim() || horasMalas) return;
    const id = agregarAsignatura({ nombre, sala, profesor, horario: armarHorario() });
    // Reemplaza esta pantalla por el detalle de la asignatura recién creada
    router.replace(`/asignatura/${id}`);
  };

  return (
    <Pantalla>
      <KeyboardAvoidingView
        style={styles.flexUno}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contenedor}>
          {/* 1. Encabezado */}
          <BandaEncabezado style={styles.banda}>
            <BarraSuperior textoVolver="Asignaturas" />
            <Text style={styles.titulo}>Nueva asignatura</Text>
            <Text style={styles.cuerpo}>
              Agrégala para traducir sus clases y guardar su historial.
            </Text>
          </BandaEncabezado>

          {/* 2. Formulario */}
          <ScrollView
            contentContainerStyle={styles.formulario}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <RotuloSeccion texto="DATOS DE LA ASIGNATURA" />

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

            {/* Horario: días con un toque y horas solo con números */}
            <View style={styles.grupo}>
              <Text style={styles.etiqueta}>Días de clase</Text>
              <View style={styles.filaDias}>
                {DIAS.map((d, i) => (
                  <Chip
                    key={d.corto}
                    texto={d.corto}
                    estado={dias.includes(i) ? 'activo' : 'normal'}
                    onPress={() => alternarDia(i)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.filaHoras}>
              <View style={styles.flexUno}>
                <CampoTexto
                  etiqueta="Desde"
                  valor={inicio}
                  alCambiar={(t) => setInicio(formatearHora(t))}
                  placeholder="10:15"
                  keyboardType="number-pad"
                  maxLength={5}
                  error={errorInicio}
                />
              </View>
              <View style={styles.flexUno}>
                <CampoTexto
                  etiqueta="Hasta"
                  valor={termino}
                  alCambiar={(t) => setTermino(formatearHora(t))}
                  placeholder="11:45"
                  keyboardType="number-pad"
                  maxLength={5}
                  error={errorTermino}
                />
              </View>
            </View>
            <Text style={styles.ayuda}>
              {armarHorario() ? `Se verá así: ${armarHorario()}` : 'Opcional. Escribe solo números: 1015 queda 10:15.'}
            </Text>
          </ScrollView>

          {/* 3. Acción */}
          <PanelAcciones>
            <Boton etiqueta="Guardar asignatura" tipo="primario" Icono={Check} onPress={guardar} />
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
  banda: { paddingTop: 0 }, // la barra superior ya da el aire de arriba
  formulario: { gap: 16, paddingBottom: 16 },
  titulo: { ...TIPOGRAFIA.tituloPantalla, color: COLORES.tinta },
  cuerpo: { ...TIPOGRAFIA.cuerpo, color: COLORES.tintaSuave },
  grupo: { gap: 8 },
  etiqueta: { ...TIPOGRAFIA.etiqueta, color: COLORES.tinta },
  filaDias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filaHoras: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  ayuda: { ...TIPOGRAFIA.secundario, color: COLORES.tintaSuave, marginTop: -6 },
});
