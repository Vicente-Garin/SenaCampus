import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { COLORES } from '../constants/colores';
import { TIPOGRAFIA } from '../constants/tipografia';
import { MEDIDAS } from '../constants/medidas';
import { Boton } from './Boton';

// Modal de prevención de errores (heurística de Nielsen) antes de finalizar la clase
export function VentanaConfirmacion({
  visible,
  titulo,
  mensaje,
  textoConfirmar,
  textoCancelar,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.velo}>
        <View style={styles.caja}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          <View style={styles.acciones}>
            <Boton etiqueta={textoConfirmar} tipo="primario" onPress={onConfirmar} />
            <Boton etiqueta={textoCancelar} tipo="texto" onPress={onCancelar} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  velo: {
    flex: 1,
    backgroundColor: COLORES.velo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MEDIDAS.margenPantalla,
  },
  caja: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radios.modal,
    padding: 24,
    shadowColor: COLORES.tinta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  titulo: {
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.tinta,
    marginBottom: 8,
  },
  mensaje: {
    ...TIPOGRAFIA.cuerpo,
    color: COLORES.tintaSuave,
    marginBottom: 20,
  },
  acciones: {
    gap: 8,
  },
});
