/**
 * HOOK · Leer en voz alta
 * Lee los mensajes del estudiante para que la persona oyente los escuche sin mirar la pantalla.
 *
 * 1. VOZ NATURAL (nube): el servidor genera el audio con ElevenLabs y la app lo reproduce
 *    con expo-audio. Suena casi humana. La clave queda en el servidor, nunca en la app.
 * 2. RESPALDO (teléfono): si no hay internet, el servidor no responde o no tiene clave,
 *    se usa expo-speech con la mejor voz en español instalada en el teléfono.
 *
 * - hablando: true mientras se lee (el micrófono espera para no transcribir su propia voz).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { pedirVozNube } from '../services/api';

// Los módulos nativos solo existen en la app instalada (no en Expo Go)
let Speech = null;
try {
  Speech = require('expo-speech');
} catch {
  Speech = null;
}
let Audio = null;
try {
  Audio = require('expo-audio');
} catch {
  Audio = null;
}

const PREFERENCIA_IDIOMAS = ['es-CL', 'es-419', 'es-US', 'es-MX', 'es-ES'];
const MAXIMO_LECTURA_MS = 30000; // seguro por si el reproductor no avisa que terminó

export function useLeerEnVoz() {
  const [hablando, setHablando] = useState(false);
  const idiomaRef = useRef('es-CL');
  const vozRef = useRef(null); // voz del teléfono elegida (respaldo)
  const reproductorRef = useRef(null);
  const nubeDisponibleRef = useRef(!!Audio); // se apaga si el servidor dice que no tiene clave
  const turnoRef = useRef(0); // cada lectura nueva invalida las anteriores que aún esperan respuesta
  const seguroRef = useRef(null);

  const terminar = useCallback(() => {
    clearTimeout(seguroRef.current);
    setHablando(false);
  }, []);

  useEffect(() => {
    // Reproductor para la voz de la nube
    let suscripcion = null;
    if (Audio) {
      try {
        Audio.setAudioModeAsync?.({ playsInSilentMode: true }).catch(() => {});
        const reproductor = Audio.createAudioPlayer(null);
        suscripcion = reproductor.addListener('playbackStatusUpdate', (estado) => {
          if (estado.didJustFinish) terminar();
        });
        reproductorRef.current = reproductor;
      } catch {
        nubeDisponibleRef.current = false;
      }
    }

    // Respaldo: la mejor voz en español del teléfono
    Speech?.getAvailableVoicesAsync?.()
      .then((voces) => {
        const enEspanol = voces
          .map((v) => ({ ...v, idioma: v.language?.replace('_', '-') }))
          .filter((v) => v.idioma?.toLowerCase().startsWith('es'));
        if (!enEspanol.length) return;

        const puntaje = (v) => {
          const rango = PREFERENCIA_IDIOMAS.findIndex((i) => i.toLowerCase() === v.idioma.toLowerCase());
          const nombre = `${v.identifier} ${v.name}`.toLowerCase();
          return (rango === -1 ? PREFERENCIA_IDIOMAS.length : rango) * 10
            + (v.quality === 'Enhanced' ? 0 : 4)
            + (nombre.includes('network') ? 2 : 0); // las de red necesitan internet
        };
        const mejor = [...enEspanol].sort((a, b) => puntaje(a) - puntaje(b))[0];
        idiomaRef.current = mejor.idioma;
        vozRef.current = mejor.identifier;
      })
      .catch(() => {});

    return () => {
      clearTimeout(seguroRef.current);
      Speech?.stop();
      suscripcion?.remove();
      reproductorRef.current?.remove();
      reproductorRef.current = null;
    };
  }, [terminar]);

  const leerEnTelefono = useCallback((texto) => {
    if (!Speech) {
      terminar();
      return;
    }
    Speech.speak(texto, {
      language: idiomaRef.current,
      ...(vozRef.current ? { voice: vozRef.current } : {}),
      rate: 0.95, // un poco más lento que lo normal: se entiende mejor en un pasillo con ruido
      pitch: 1.0,
      onStart: () => setHablando(true),
      onDone: terminar,
      onStopped: terminar,
      onError: terminar,
    });
  }, [terminar]);

  const leer = useCallback(async (texto) => {
    if (!texto) return;
    const turno = ++turnoRef.current;
    // Si estaba leyendo otro mensaje, lo corta
    Speech?.stop();
    reproductorRef.current?.pause();
    setHablando(true);
    clearTimeout(seguroRef.current);
    seguroRef.current = setTimeout(terminar, MAXIMO_LECTURA_MS);

    if (nubeDisponibleRef.current && reproductorRef.current) {
      try {
        const url = await pedirVozNube(texto);
        if (turno !== turnoRef.current) return; // llegó tarde: ya se pidió otra lectura
        reproductorRef.current.replace({ uri: url });
        reproductorRef.current.play();
        return;
      } catch (error) {
        // 503 = el servidor no tiene clave de ElevenLabs: no se vuelve a intentar en esta sesión
        if (error.estado === 503) nubeDisponibleRef.current = false;
        if (turno !== turnoRef.current) return;
      }
    }
    leerEnTelefono(texto);
  }, [leerEnTelefono, terminar]);

  const callar = useCallback(() => {
    turnoRef.current += 1;
    Speech?.stop();
    reproductorRef.current?.pause();
    terminar();
  }, [terminar]);

  return { disponible: !!Speech || !!Audio, hablando, leer, callar };
}
