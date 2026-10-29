# SeñaCampus 🤟🎓
> **Traductor de Lengua Oral a Lengua de Señas Chilena (LSCh) en Tiempo Real para Contextos Académicos**
> *Universidad de Los Lagos — Departamento de Ciencias de la Ingeniería (Sede Chiloé)*
> **Carrera:** Ingeniería Civil en Informática | **Asignatura:** Tecnologías Web y Móviles
> **Autor:** Vicente Martín Garín Pereda — Octubre 2026

---

## 📌 Descripción del Proyecto
**SeñaCampus** es una solución móvil diseñada para derribar las barreras de accesibilidad y comunicación que enfrentan los estudiantes sordos en entornos de educación superior. El sistema captura la voz del docente o emisor durante una cátedra, procesa y normaliza el discurso oral eliminando palabras vacías (*stopwords*) de acuerdo a las pautas de la LSCh, y renderiza dinámicamente una secuencia ordenada de animaciones vectoriales (Lottie) o deletreo manual (*dactilología*) como tolerancia a fallos garantizada.

---

## 🏛️ Arquitectura del Sistema (Monorepo)

`	ext
SenaCampus/
├── docker-compose.yml       # Orquestación de MongoDB persistente
├── .gitignore               # Exclusiones de seguridad (.env, node_modules)
├── README.md                # Documentación del proyecto
├── server/                  # Backend: Node.js, Express, Mongoose
│   ├── scripts/             # Scripts de siembra (seedDictionary.js)
│   └── src/
│       ├── config/          # Conexión asíncrona a la base de datos (db.js)
│       ├── controllers/     # Lógica del traductor y ventana deslizante
│       ├── models/          # Esquemas Mongoose (Gloss.js, Session.js)
│       ├── routes/          # Rutas REST (/api/v1/traductor)
│       ├── utils/           # Normalizador y filtro de stopwords (textParser.js)
│       └── server.js        # Punto de entrada de la API Express
└── mobile/                  # Frontend: React Native con Expo SDK
    ├── assets/              # Tipografías (Nunito) y señas (Lottie/Alphabet)
    ├── app.json             # Manifiesto de Expo
    ├── package.json         # Dependencias móviles
    ├── App.js               # Punto de entrada y montaje de interfaz
    └── src/
        ├── components/      # Visor gestual (SignViewer.jsx)
        ├── constants/       # Tokens de diseño y colores Figma (theme.js)
        ├── navigation/      # Enrutamiento de navegación (Tabs/Stack)
        ├── screens/         # Vistas funcionales (auth, translation, dialog)
        └── services/        # Cliente HTTP de traducción (api.js)
🚀 Estado Actual y Módulos Implementados
1. Infraestructura y Base de Datos
Orquestación en Contenedores: Servicio de base de datos MongoDB local desplegado y aislado mediante Docker Compose con volúmenes persistentes.

Corpus Oficial LSCh (2.098 Términos): Base de datos poblada a partir de los Tomos I y II del Diccionario Bilingüe Lengua de Señas Chilena - Español (MINEDUC/UMCE), discriminando señas núcleo con recurso visual directo y señas con derivación dactilológica.

2. Motor Semántico de Traducción (Backend)
Normalización UTF-8 & Stopwords: Algoritmo en textParser.js que elimina puntuaciones, normaliza caracteres acentuados y remueve palabras funcionales del español que no se señan en la gramática LSCh (el, la, de, en, hay, etc.).

Ventana Deslizante (N-Gramas): El controlador analiza combinaciones de múltiples palabras antes de términos individuales, reconociendo locuciones compuestas como "sala de clases".

Endpoint REST Funcional: POST /api/v1/traductor/parse responde con la secuencia estructurada de glosas y la descomposición dactilológica por arreglos de caracteres.

3. Cliente Móvil (Frontend Expo)
Design Tokens: Centralización de paleta cromática (Coral #D14426, Menta #4ECDC4, Durazno, Crema) y tipografía Nunito según especificaciones en Figma.

Componente SignViewer: Visor interactivo con gestión de colas FIFO, renderizado condicional de animaciones, transiciones letra a letra para dactilología y controles de velocidad (1x, 1.5x) y pausa.

🛠️ Stack Tecnológico
Frontend Móvil: React Native, Expo, React Native Screens & Safe Area Context.

Backend API: Node.js, Express.js, CORS, Dotenv.

Base de Datos & ORM: MongoDB, Mongoose ODM.

Infraestructura: Docker, Docker Compose, Git / GitHub.

Diseño & Recursos: Figma, Lottie, Diccionario Oficial LSCh (MINEDUC/UMCE).

⚙️ Guía de Ejecución Local
Prerrequisitos
Node.js (v18+)

Docker Desktop

Expo Go instalado en dispositivo móvil (Android / iOS)

1. Iniciar Base de Datos y Backend
Bash
docker-compose up -d
cd server
npm install
npm run dev
2. Iniciar Aplicación Móvil
Bash
cd mobile
npm install
npx expo start
