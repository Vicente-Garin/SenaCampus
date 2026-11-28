/**
 * CONTEXT · Sesión del estudiante (Firebase Authentication + perfil en MongoDB)
 * estado:
 *  - 'cargando'   → la app está revisando si había una sesión guardada en el teléfono
 *  - 'sinSesion'  → mostrar Acceso
 *  - 'sinPerfil'  → la cuenta de Firebase existe pero falta el perfil en SeñaCampus (Crear cuenta)
 *  - 'listo'      → perfil cargado, se entra a la app
 * Si el servidor no responde (sin internet), con una sesión válida se entra igual en modo
 * "sin conexión" con el nombre guardado en Firebase.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, firebaseConfigurado, mensajeFirebase } from '../services/firebase';
import { obtenerPerfil, crearPerfil } from '../services/api';

export const DOMINIOS = ['@alumnos.ulagos.cl', '@ulagos.cl'];
export const SEDES = ['Osorno', 'Puerto Montt', 'Chiloé', 'Santiago'];

export const correoInstitucional = (correo) =>
  DOMINIOS.some((d) => correo.trim().toLowerCase().endsWith(d));

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [estado, setEstado] = useState(firebaseConfigurado ? 'cargando' : 'sinSesion');
  const [cuenta, setCuenta] = useState(null); // usuario de Firebase
  const [perfil, setPerfil] = useState(null); // documento de MongoDB
  const [sinConexion, setSinConexion] = useState(false);
  // Mientras se crea una cuenta, el aviso de Firebase no debe buscar un perfil que aún no existe
  const registrandoRef = useRef(false);

  // Carga el perfil del servidor para la cuenta actual
  const cargarPerfil = useCallback(async (usuarioFirebase) => {
    try {
      const datos = await obtenerPerfil();
      setPerfil(datos);
      setSinConexion(false);
      setEstado('listo');
    } catch (error) {
      if (error.estado === 404) {
        setEstado('sinPerfil');
      } else if (error.estado === 401) {
        await signOut(auth);
      } else {
        // Sin servidor: se entra con lo que sabe Firebase
        const nombre = usuarioFirebase.displayName?.split(' ')[0] || usuarioFirebase.email?.split('@')[0] || '';
        setPerfil({ nombre, correo: usuarioFirebase.email });
        setSinConexion(true);
        setEstado('listo');
      }
    }
  }, []);

  // Firebase avisa al abrir la app (sesión guardada) y cada vez que se entra o se sale
  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (usuarioFirebase) => {
      setCuenta(usuarioFirebase);
      if (!usuarioFirebase) {
        setPerfil(null);
        setEstado('sinSesion');
        return;
      }
      if (registrandoRef.current) return;
      setEstado('cargando');
      cargarPerfil(usuarioFirebase);
    });
  }, [cargarPerfil]);

  const exigirFirebase = () => {
    if (!auth) throw new Error('Falta la configuración de Firebase en mobile/.env.');
  };

  const iniciarSesion = useCallback(async (correo, clave) => {
    exigirFirebase();
    try {
      await signInWithEmailAndPassword(auth, correo.trim().toLowerCase(), clave);
    } catch (error) {
      throw new Error(mensajeFirebase(error));
    }
  }, []);

  // Crea la cuenta en Firebase y luego el perfil en MongoDB
  const registrar = useCallback(async ({ nombre, apellido, sede, correo, clave }) => {
    exigirFirebase();
    let usuarioFirebase = auth.currentUser;
    registrandoRef.current = true;
    try {
      if (!usuarioFirebase) {
        const credencial = await createUserWithEmailAndPassword(auth, correo.trim().toLowerCase(), clave);
        usuarioFirebase = credencial.user;
      }
      await updateProfile(usuarioFirebase, { displayName: `${nombre.trim()} ${apellido.trim()}` }).catch(() => {});
    } catch (error) {
      registrandoRef.current = false;
      throw new Error(mensajeFirebase(error));
    }
    try {
      const datos = await crearPerfil({ nombre: nombre.trim(), apellido: apellido.trim(), sede });
      setPerfil(datos);
      setSinConexion(false);
      setEstado('listo');
    } catch (error) {
      // La cuenta de Firebase quedó creada: al reintentar solo falta el perfil
      setEstado('sinPerfil');
      const campos = error.campos ? Object.values(error.campos).join(' ') : '';
      throw new Error(campos || error.message);
    } finally {
      registrandoRef.current = false;
    }
  }, []);

  const recuperarClave = useCallback(async (correo) => {
    exigirFirebase();
    try {
      await sendPasswordResetEmail(auth, correo.trim().toLowerCase());
    } catch (error) {
      throw new Error(mensajeFirebase(error));
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    if (auth) await signOut(auth);
  }, []);

  return (
    <SesionContext.Provider
      value={{ estado, cuenta, perfil, sinConexion, iniciarSesion, registrar, recuperarClave, cerrarSesion, firebaseConfigurado }}
    >
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error('useSesion debe usarse dentro de SesionProvider');
  return ctx;
}
