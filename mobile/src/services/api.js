import { Platform } from 'react-native';

// En Android Emulator se usa 10.0.2.2; en dispositivo físico o iOS tu IP local de red
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1'
});

/**
 * Envía el texto oral transcrito al motor semántico del backend.
 * @param {string} texto - Frase a traducir a glosas LSCh.
 * @param {string} contexto - Contexto temático ('academico', 'general').
 */
export const parseTranscript = async (texto, contexto = 'academico') => {
  try {
    const response = await fetch(`${BASE_URL}/traductor/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ texto, contexto })
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al conectar con la API de traducción:', error.message);
    throw error;
  }
};