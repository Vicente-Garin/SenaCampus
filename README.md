# SeñaCampus — Asistente Móvil de Interpretación Académica en Tiempo Real

Aplicación móvil desarrollada en **React Native con Expo (SDK 58)** para apoyar la inclusión de estudiantes sordos o hipoacúsicos en aulas universitarias, traduciendo en tiempo real la explicación del docente a glosas y señas de **Lengua de Señas Chilena (LSCh)** junto con subtítulos estructurados por asignatura.

> **Proyecto Académico:** Avance N°1 — Diseño UI/UX y Frontend Móvil  
> **Asignatura:** Tecnologías Web y Móviles (6º semestre) — Ingeniería Civil en Informática, Universidad de Los Lagos  
> **Autor:** Vicente Martín Garín Pereda

---

## Documentación y Entregables del Avance N°1

* **Bitácora de Diseño y Frontend:** [docs/bitacora.md](./docs/bitacora.md)
* **Prototipo Interactivo en Figma:** [Abrir Prototipo en Figma](https://www.figma.com/design/bCv8y8gXMaHy6oLUagS4PI/se%C3%B1aCampus?node-id=3-362&t=3c6s7hihCM2XMi2I-1)

---

## Stack Tecnológico

* **Framework Móvil:** React Native + Expo SDK 58
* **Enrutamiento:** Expo Router (`src/app/` con layouts anidados, pestañas y rutas dinámicas `[id]` y `[sessionId]`)
* **Gestión de Estado:** React Context API (`SubjectsContext`) + Hooks (`useState`, `useEffect`)
* **Componentes Nativos y Accesibilidad:** `FlatList`, `Pressable` (áreas táctiles >= 48 dp), `SafeAreaView`, `useSafeAreaInsets`, `TextInput` controlado, tokens de contraste WCAG AA (`src/constants/theme.js`)

---

## Estructura del Proyecto Móvil (`mobile/`)

    mobile/
    ├── app.json
    ├── package.json
    └── src/
        ├── app/
        │   ├── _layout.jsx              # Stack principal y proveedor de contexto
        │   ├── index.jsx                # Acceso institucional
        │   ├── ajustes.jsx              # Configuración de accesibilidad
        │   ├── asignatura/[id].jsx      # Clases guardadas por asignatura
        │   ├── sesion/[sessionId].jsx   # Lectura organizada de clase guardada
        │   └── (tabs)/
        │       ├── _layout.jsx          # Navegación inferior por pestañas
        │       ├── index.jsx            # Listado y creación de asignaturas
        │       ├── traducir.jsx         # Cátedra en vivo (Voz docente -> LSCh)
        │       └── dialogo.jsx          # Comunicación rápida estudiante <-> docente
        ├── components/
        │   └── ScreenHeader.jsx         # Cabecera reutilizable con botón Volver
        ├── constants/
        │   └── theme.js                 # Paleta WCAG AA, tipografía y espaciados
        ├── context/
        │   └── SubjectsContext.jsx      # Estado global de asignaturas y sesiones
        └── data/
            └── mockData.js              # Datos realistas del dominio universitario

---

## Requisitos y Ejecución Local

### Requisitos Previos
* **Node.js:** v18 o superior (recomendado v20 LTS)
* **Expo Go:** Instalado en dispositivo físico Android o iOS (compatible con SDK 58/57)

### Pasos para Ejecutar
1. **Clonar el repositorio:**
   `git clone https://github.com/Vicente-Garin/SenaCampus.git && cd SenaCampus/mobile`
2. **Instalar dependencias:**
   `npm install`
3. **Iniciar el servidor de desarrollo Expo:**
   `npx expo start -c`
4. **Abrir en el teléfono:** Escanea el código QR generado en la terminal utilizando la aplicación **Expo Go**.


