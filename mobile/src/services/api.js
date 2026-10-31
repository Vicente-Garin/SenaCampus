import { Platform } from 'react-native';

const LOCAL_IP = '192.168.1.13';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  default: `http://${LOCAL_IP}:5000/api/v1`
});

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

    return await response.json();
  } catch (error) {
    console.error('Error al conectar con la API de traducción:', error.message);
    throw error;
  }
};