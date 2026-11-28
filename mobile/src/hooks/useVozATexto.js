/**
 * HOOK · Voz a texto en español de Chile (expo-speech-recognition)
 *
 * Escucha el micrófono de forma continua y entrega:
 * - textoParcial: lo que el docente está diciendo en este momento (se actualiza en vivo).
 * - onFraseFinal(texto, confianza): se llama cada vez que el reconocedor cierra una frase.
 *
 * Detalles que resuelve para que funcione durante una clase completa:
 * - Android corta el reconocimiento tras un silencio: si el usuario no pausó, se reinicia solo.
 * - Errores pasajeros (silencio, ocupado, sin red) reintentan con espera creciente.
 * - Si "es-CL" no está disponible en el teléfono, prueba "es-419" y luego "es-ES".
 * - En Expo Go el módulo nativo no existe: disponible = false y la pantalla usa la simulación.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

// El módulo nativo solo existe en la app instalada (development build o APK), no en Expo Go.
let Voz = null;
try {
  Voz = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch {
  Voz = null;
}

const IDIOMAS = ['es-CL', 'es-419', 'es-ES'];

// Palabras frecuentes en clases que ayudan al reconocedor a no confundirlas
const VOCABULARIO_ACADEMICO = [
  'prueba', 'certamen', 'evaluación', 'ayudantía', 'laboratorio', 'biblioteca', 'asignatura',
  'profesor', 'profesora', 'alumno', 'estudiante', 'tarea', 'informe', 'proyecto', 'semestre',
  'base de datos', 'MongoDB', 'Expo', 'React Native', 'endpoint', 'API',
];

// Errores que no son del usuario: se espera un momento y se vuelve a escuchar
const ERRORES_PASAJEROS = ['no-speech', 'speech-timeout', 'nomatch', 'busy', 'too-many-requests', 'client', 'unknown', 'network', 'interrupted'];
// Errores que requieren que el usuario haga algo: se deja de escuchar y se avisa
const MENSAJES_ERROR = {
  'not-allowed': 'SeñaCampus no tiene permiso para usar el micrófono. Actívalo en los ajustes del teléfono.',
  'service-not-allowed': 'El reconocimiento de voz está desactivado en este teléfono. Instala o activa la app de Google.',
  'audio-capture': 'No se pudo usar el micrófono. Revisa que otra app no lo esté ocupando.',
  'language-not-supported': 'Tu teléfono no reconoce español. Descarga el idioma español en los ajustes de voz de Google.',
  network: 'Sin conexión: el reconocimiento de voz necesita internet. Reintentando…',
};

export function useVozATexto({ onFraseFinal } = {}) {
  const disponible = !!Voz && (Voz.isRecognitionAvailable?.() ?? true);

  const [estado, setEstado] = useState(disponible ? 'inactivo' : 'no-disponible');
  const [textoParcial, setTextoParcial] = useState('');
  const [error, setError] = useState(null);
  const [volumen, setVolumen] = useState(0); // 0 a 1, para animar el indicador del micrófono

  // useRef: datos que cambian sin redibujar la pantalla
  const quiereEscucharRef = useRef(false); // el usuario quiere que siga escuchando
  const idiomaRef = useRef(0); // índice en IDIOMAS
  const reintentosRef = useRef(0); // para esperar más tras errores seguidos
  const temporizadorRef = useRef(null);
  const esperandoFinRef = useRef(null); // resuelve la promesa de detener()
  const onFraseFinalRef = useRef(onFraseFinal);
  onFraseFinalRef.current = onFraseFinal;

  const arrancar = useCallback(() => {
    if (!Voz || !quiereEscucharRef.current) return;
    setEstado('iniciando');
    Voz.start({
      lang: IDIOMAS[idiomaRef.current],
      interimResults: true, // texto en vivo mientras habla
      continuous: true, // no se detiene al terminar una frase
      maxAlternatives: 1,
      addsPunctuation: true,
      requiresOnDeviceRecognition: false,
      contextualStrings: VOCABULARIO_ACADEMICO,
      volumeChangeEventOptions: { enabled: true, intervalMillis: 250 },
    });
  }, []);

  const programarReinicio = useCallback(() => {
    clearTimeout(temporizadorRef.current);
    // 300 ms, 600 ms, 1,2 s… hasta 5 s entre reintentos seguidos
    const espera = Math.min(300 * 2 ** reintentosRef.current, 5000);
    reintentosRef.current += 1;
    temporizadorRef.current = setTimeout(arrancar, espera);
  }, [arrancar]);

  // Eventos del reconocedor nativo
  useEffect(() => {
    if (!Voz) return undefined;
    const subs = [
      Voz.addListener('start', () => {
        setEstado('escuchando');
        setError(null);
      }),
      Voz.addListener('result', (evento) => {
        const mejor = evento.results?.[0];
        const texto = (mejor?.transcript || '').trim();
        if (!texto) return;
        reintentosRef.current = 0; // está funcionando bien
        if (evento.isFinal) {
          setTextoParcial('');
          onFraseFinalRef.current?.(texto, mejor.confidence);
        } else {
          setTextoParcial(texto);
        }
      }),
      Voz.addListener('volumechange', ({ value }) => {
        // value va de -2 a 10; bajo 0 es silencio
        setVolumen(Math.max(0, Math.min(1, value / 10)));
      }),
      Voz.addListener('error', (evento) => {
        if (evento.error === 'aborted') return;
        if (evento.error === 'language-not-supported' && idiomaRef.current < IDIOMAS.length - 1) {
          idiomaRef.current += 1; // prueba con el siguiente español
          return;
        }
        if (ERRORES_PASAJEROS.includes(evento.error)) {
          if (evento.error === 'network') setError({ codigo: 'network', mensaje: MENSAJES_ERROR.network });
          return; // el evento "end" llega después y reinicia
        }
        quiereEscucharRef.current = false;
        setError({ codigo: evento.error, mensaje: MENSAJES_ERROR[evento.error] || `Error del reconocimiento de voz (${evento.error}).` });
        setEstado('error');
      }),
      Voz.addListener('end', () => {
        setVolumen(0);
        if (esperandoFinRef.current) {
          esperandoFinRef.current();
          esperandoFinRef.current = null;
        }
        if (quiereEscucharRef.current) {
          programarReinicio(); // Android cortó por silencio: vuelve a escuchar
        } else {
          setEstado((anterior) => (anterior === 'error' ? 'error' : 'pausado'));
        }
      }),
    ];
    return () => subs.forEach((s) => s.remove());
  }, [programarReinicio]);

  // Pide permiso del micrófono (la primera vez muestra el diálogo del sistema) y empieza
  const iniciar = useCallback(async () => {
    if (!Voz) return false;
    const permiso = await Voz.requestPermissionsAsync();
    if (!permiso.granted) {
      setError({ codigo: 'not-allowed', mensaje: MENSAJES_ERROR['not-allowed'] });
      setEstado('error');
      return false;
    }
    setError(null);
    reintentosRef.current = 0;
    quiereEscucharRef.current = true;
    arrancar();
    return true;
  }, [arrancar]);

  // Pausa: deja de escuchar pero entrega lo último que se alcanzó a reconocer
  const pausar = useCallback(() => {
    quiereEscucharRef.current = false;
    clearTimeout(temporizadorRef.current);
    setTextoParcial('');
    Voz?.stop();
  }, []);

  // Terminar la clase: espera (máximo 1,5 s) a que llegue la última frase antes de guardar
  const detener = useCallback(() => {
    quiereEscucharRef.current = false;
    clearTimeout(temporizadorRef.current);
    if (!Voz) return Promise.resolve();
    return new Promise((resolver) => {
      const limite = setTimeout(resolver, 1500);
      esperandoFinRef.current = () => {
        clearTimeout(limite);
        resolver();
      };
      Voz.stop();
    });
  }, []);

  // Al salir de la pantalla se corta el micrófono
  useEffect(() => () => {
    quiereEscucharRef.current = false;
    clearTimeout(temporizadorRef.current);
    Voz?.abort();
  }, []);

  return {
    disponible,
    estado, // 'no-disponible' | 'inactivo' | 'iniciando' | 'escuchando' | 'pausado' | 'error'
    escuchando: estado === 'escuchando' || estado === 'iniciando',
    textoParcial,
    error,
    volumen,
    idioma: IDIOMAS[idiomaRef.current],
    iniciar,
    pausar,
    detener,
  };
}
