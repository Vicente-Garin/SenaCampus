/**
 * CONTEXT · Contactos y conversaciones guardadas (Diálogo → Contactos)
 * Para las personas con las que el estudiante habla seguido (un profesor, un compañero,
 * la secretaria de la carrera): cada contacto tiene su propia conversación, que se puede retomar.
 * - Por ahora vive en memoria (igual que las clases). Al conectar la API se guardará en MongoDB,
 *   en la colección `dialogos` (con el contacto { nombre, tipo }).
 */
import React, { createContext, useCallback, useContext, useState } from 'react';

export const TIPOS_CONTACTO = ['Profesor/a', 'Compañero/a', 'Funcionario/a', 'Familia', 'Otro'];

// Datos de ejemplo para que la lista no aparezca vacía en la demostración
const CONTACTOS_INICIALES = [
  { id: 'k-andres', nombre: 'Prof. Andrés Morales', tipo: 'Profesor/a' },
  { id: 'k-camila', nombre: 'Camila', tipo: 'Compañero/a' },
];

const MENSAJES_INICIALES = {
  'k-andres': [
    { id: 'e1', lado: 'yo', autor: 'Tú', mensaje: 'Profesor, ¿la entrega del avance es el martes?' },
    { id: 'e2', lado: 'otra', autor: 'Prof. Andrés Morales', mensaje: 'Sí, el martes 9 hasta las once y cincuenta y nueve.' },
  ],
  'k-camila': [],
};

const ConversacionesContext = createContext(null);

export function ConversacionesProvider({ children }) {
  const [contactos, setContactos] = useState(CONTACTOS_INICIALES);
  const [mensajesPorContacto, setMensajesPorContacto] = useState(MENSAJES_INICIALES);

  // Agrega un contacto y devuelve su id (para abrir su conversación de inmediato)
  const agregarContacto = useCallback(({ nombre, tipo }) => {
    const id = `k-${Date.now()}`;
    setContactos((prev) => [{ id, nombre: nombre.trim(), tipo }, ...prev]);
    setMensajesPorContacto((prev) => ({ ...prev, [id]: [] }));
    return id;
  }, []);

  // Borra el contacto y su conversación
  const eliminarContacto = useCallback((id) => {
    setContactos((prev) => prev.filter((c) => c.id !== id));
    setMensajesPorContacto((prev) => {
      const { [id]: _borrado, ...resto } = prev;
      return resto;
    });
  }, []);

  // Igual que un setState: recibe la lista nueva o una función (prev) => nueva lista
  const setMensajesDe = useCallback((id, cambio) => {
    setMensajesPorContacto((prev) => {
      const actuales = prev[id] || [];
      const nuevos = typeof cambio === 'function' ? cambio(actuales) : cambio;
      return { ...prev, [id]: nuevos };
    });
  }, []);

  const buscarContacto = useCallback((id) => contactos.find((c) => c.id === id), [contactos]);

  return (
    <ConversacionesContext.Provider
      value={{ contactos, mensajesPorContacto, agregarContacto, eliminarContacto, setMensajesDe, buscarContacto }}
    >
      {children}
    </ConversacionesContext.Provider>
  );
}

export function useConversaciones() {
  const ctx = useContext(ConversacionesContext);
  if (!ctx) throw new Error('useConversaciones debe usarse dentro de ConversacionesProvider');
  return ctx;
}
