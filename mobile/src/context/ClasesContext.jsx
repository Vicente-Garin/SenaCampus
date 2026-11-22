import React, { createContext, useContext, useState } from 'react';
import { CLASES_POR_ASIGNATURA, TRANSCRIPCIONES } from '../data/mockData';

// Estado compartido de las clases guardadas.
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
  const [clasesPorAsignatura, setClasesPorAsignatura] = useState(CLASES_POR_ASIGNATURA);
  const [transcripciones, setTranscripciones] = useState(TRANSCRIPCIONES);

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
    return id;
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
    <ClasesContext.Provider value={{ clasesPorAsignatura, transcripciones, guardarClase, buscarClase }}>
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
