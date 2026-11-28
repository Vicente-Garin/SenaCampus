/**
 * HOOK · ¿Está abierto el teclado?
 * Lo usan las pantallas de conversación para compactar el encabezado mientras se escribe.
 */
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export function useTecladoAbierto() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const mostrar = Keyboard.addListener('keyboardDidShow', () => setAbierto(true));
    const ocultar = Keyboard.addListener('keyboardDidHide', () => setAbierto(false));
    return () => {
      mostrar.remove();
      ocultar.remove();
    };
  }, []);

  return abierto;
}
