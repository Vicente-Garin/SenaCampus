import React, { createContext, useContext, useState } from 'react';
import { ASIGNATURAS, CLASES_POR_ASIGNATURA, TRANSCRIPCIONES } from '../data/mockData';

// Estado compartido de las asignaturas y de las clases guardadas.
// Vive en el layout raíz (src/app/_layout.jsx), así que todas las pantallas leen
// los mismos datos: lo que se guarda en Traducir aparece en el Detalle de la asignatura.

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const ClasesContext = createContext(null);

// 75 segundos -> "1 min"; 4.900 segundos -> "1 h 22 min"
function formatearDuracion(segundos) {
  const minutos = Math.max(1, Math.round(segundos / 60));
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return horas > 0 ? `${horas} h ${resto} min` : `${resto} min`;
}

export function ClasesProvider({ children }) {
  // Valores iniciales: los datos de ejemplo de mockData.js
  const [asignaturas, setAsignaturas] = useState(ASIGNATURAS);
  const [clasesPorAsignatura, setClasesPorAsignatura] = useState(CLASES_POR_ASIGNATURA);
  const [transcripciones, setTranscripciones] = useState(TRANSCRIPCIONES);
  // Última asignatura que se abrió en Traducir: la usa el botón "Retomar…" de Asignaturas.
  // Empieza en la de la última clase de ejemplo (Tecnologías Web y Móviles).
  const [ultimaAsignaturaId, setUltimaAsignaturaId] = useState(ASIGNATURAS[0]?.id ?? null);

  /**
   * Guarda una clase nueva y devuelve su id.
   * - asignaturaId: a qué asignatura pertenece (ej. 'twm')
   * - fragmentos: [{ hora, texto, claves }] con lo que se tradujo
   * - segundos: cuánto duró la sesión
   */
  const guardarClase = ({ asignaturaId, fragmentos, segundos, deletreadas = [] }) => {
    const ahora = new Date();
    const id = `c-${ahora.getTime()}`;
    const palabras = fragmentos.reduce(
      (total, f) => total + f.texto.split(/\s+/).filter(Boolean).length,
      0
    );
    const nueva = {
      id,
      asignaturaId,
      fecha: `Clase del ${ahora.getDate()} de ${MESES[ahora.getMonth()]}`,
      duracion: formatearDuracion(segundos),
      palabras,
      deletreadas,
    };

    // Se crea un objeto NUEVO (no se modifica el anterior): así React detecta el cambio
    // y vuelve a dibujar todas las pantallas que usan estos datos.
    setClasesPorAsignatura((prev) => ({
      ...prev,
      [asignaturaId]: [nueva, ...(prev[asignaturaId] || [])],
    }));
    setTranscripciones((prev) => ({ ...prev, [id]: fragmentos }));
    setUltimaAsignaturaId(asignaturaId);
    return id;
  };

  /**
   * Crea una asignatura nueva (desde la pantalla Nueva asignatura) y devuelve su id.
   * Solo el nombre es obligatorio; lo demás queda "Por definir" si viene vacío.
   */
  const agregarAsignatura = ({ nombre, sala, profesor, horario }) => {
    const id = `a-${Date.now()}`;
    const nueva = {
      id,
      nombre: nombre.trim(),
      sala: sala.trim() || 'Por definir',
      profesor: profesor.trim() || 'Profesor/a por definir',
      horario: horario.trim() || 'Horario por definir',
    };
    setAsignaturas((prev) => [...prev, nueva]);
    setClasesPorAsignatura((prev) => ({ ...prev, [id]: [] })); // empieza sin clases
    return id;
  };

  /**
   * Elimina una clase guardada y su transcripción (pantalla Transcripción → Eliminar).
   * Igual que al guardar, se crean objetos nuevos para que React redibuje el historial.
   */
  const eliminarClase = (id) => {
    setClasesPorAsignatura((prev) => {
      const siguiente = {};
      for (const [asignaturaId, lista] of Object.entries(prev)) {
        siguiente[asignaturaId] = lista.filter((c) => c.id !== id);
      }
      return siguiente;
    });
    setTranscripciones((prev) => {
      const { [id]: _eliminada, ...resto } = prev;
      return resto;
    });
  };

  // Busca una clase por su id en todas las asignaturas
  const buscarClase = (id) => {
    for (const lista of Object.values(clasesPorAsignatura)) {
      const clase = lista.find((c) => c.id === id);
      if (clase) return clase;
    }
    return null;
  };

  return (
    <ClasesContext.Provider
      value={{
        asignaturas, agregarAsignatura, clasesPorAsignatura, transcripciones,
        guardarClase, eliminarClase, buscarClase,
        ultimaAsignaturaId, setUltimaAsignaturaId,
      }}
    >
      {children}
    </ClasesContext.Provider>
  );
}

// Hook para usar el contexto desde cualquier pantalla: const { guardarClase } = useClases();
export function useClases() {
  const contexto = useContext(ClasesContext);
  if (!contexto) throw new Error('useClases debe usarse dentro de ClasesProvider');
  return contexto;
}
