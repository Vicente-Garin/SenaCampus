# SeñaCampus — Avance de Base de Datos NoSQL (Trabajo 3)

**Asignatura:** Bases de Datos Avanzadas · **Autor:** Vicente Martín Garín Pereda · Ingeniería Civil en Informática, Universidad de Los Lagos
**Motor:** MongoDB 9 (local, en Docker) · **Base:** `senacampus_db` · **Autenticación:** Firebase Authentication (solo login)

SeñaCampus es una app móvil (React Native + Expo) que escucha al docente y muestra la clase en Lengua de Señas Chilena (LSCh) y con subtítulos, organizada por asignatura. Este avance define y pone a funcionar la base de datos del **caso de uso principal**: el estudiante registra sus asignaturas, traduce una clase en vivo, la guarda y después revisa su transcripción.

> Todo lo que se ejecuta en la base está en [`database/`](../database): `schema/` (validación), `seed/` (datos de prueba) y `queries/` (consultas, agregaciones e índices).

---

## 1. Motor elegido y justificación

Se usa **MongoDB** como base principal y **Firebase Authentication** solo para iniciar sesión.

**Por qué MongoDB para SeñaCampus:**

1. **Los datos de una clase son un documento.** Una clase traducida es una fecha, una duración y una **lista variable de fragmentos** (lo que dijo el docente, la hora y las glosas LSCh de cada frase). Una clase puede tener 3 fragmentos o 200. En MongoDB todo eso cabe en un solo documento de `clases`, y la pantalla **Transcripción** (`clase/[id]`) lo lee con **una sola consulta por `_id`**, sin joins.
2. **Las consultas más frecuentes son por dueño y por fecha.** Las pantallas piden "mis asignaturas" y "las clases de esta asignatura, de la más nueva a la más antigua". Eso se resuelve con índices compuestos (`{asignaturaId: 1, fecha: -1}`), y el `explain()` de la sección 5 lo demuestra.
3. **El diccionario LSCh no tiene forma fija.** Cada glosa tiene un número distinto de sinónimos (`variantes`), y algunas tienen una animación Lottie mientras otras solo se deletrean. Un arreglo indexado (índice *multikey*) permite buscar una palabra entre los 2.098 términos y sus sinónimos con una consulta.
4. **Coincide con la arquitectura aprobada.** La propuesta (Idea 2) define Node.js + Express + MongoDB en Docker. El backend ya traduce texto a glosas con esta base (`POST /api/v1/traductor/parse`), y en el Avance N°2 la app leerá y escribirá a través de esa misma API.

**Comparación con una base relacional (punto concreto):** en SQL, la transcripción de una clase necesitaría tres tablas: `clase`, `fragmento` y `fragmento_glosa` (una fila por cada glosa de cada frase). Abrir la pantalla Transcripción de una clase de 80 minutos obligaría a hacer **2 JOIN y a reconstruir cientos de filas** para armar algo que la app muestra como un bloque. En MongoDB es **un `findOne`** que devuelve el documento tal como lo dibuja la pantalla. Además, agregar un campo nuevo al fragmento (por ejemplo, la `confianza` que entrega Speech-to-Text) no requiere `ALTER TABLE` ni migraciones.

**Por qué Firebase solo para el login:** Firebase Authentication entrega el inicio de sesión seguro (tokens, recuperación de contraseña) sin programarlo. Al ingresar, Firebase entrega un `uid`, que se guarda en `usuarios.firebaseUid` para unir esa cuenta con los datos de MongoDB. Firestore **no** se usa como base de datos, así que todos los datos de la app viven en un solo motor.

**Uso sin señal:** en una sala con mala conexión la app guarda la clase en el teléfono y la envía al terminar. Como el documento de `clases` se arma completo en el cliente (fragmentos incluidos), basta **un `insertOne`** para sincronizarlo, sin varias inserciones relacionadas que puedan quedar a medias.

---

## 2. Modelo de datos

Cuatro colecciones. Las tres primeras forman el caso de uso principal y `glosas` es el diccionario que usa el traductor.

| Colección | Qué guarda | Pantallas que la usan | Documentos de prueba |
|---|---|---|---|
| `usuarios` | Perfil del estudiante y sus ajustes de accesibilidad | Acceso, Ajustes, saludo de Asignaturas | 11 |
| `asignaturas` | Ramos del estudiante (sala, profesor, horario, color) | Asignaturas, Nueva asignatura, Detalle, Traducir (elegir ramo) | 16 |
| `clases` | Cada clase traducida con su transcripción embebida | Traducir (guardar), Detalle (historial), Transcripción, Resumen | 32 |
| `glosas` | Diccionario LSCh: término, sinónimos y recurso visual | Traducir (motor de glosas del backend) | 2.098 |

**Colección de un módulo futuro (solo descrita):** `dialogos` para el **Modo Diálogo**, con `{ usuarioId, iniciadoEn: Date, mensajes: [{ lado: 'yo'|'otra', texto, enviadoEn: Date }] }`. Los mensajes irían embebidos porque una conversación de pasillo es corta y se lee completa. Hoy esa pantalla funciona solo en el teléfono.

### Diagrama de colecciones y relaciones

```mermaid
erDiagram
    USUARIOS ||--o{ ASIGNATURAS : "usuarioId (referencia)"
    USUARIOS ||--o{ CLASES : "usuarioId (referencia)"
    ASIGNATURAS ||--o{ CLASES : "asignaturaId (referencia) + copia de nombre/color"
    CLASES }o--o{ GLOSAS : "fragmentos.glosas[] = glosa_id"

    USUARIOS {
        ObjectId _id
        string firebaseUid "único"
        string correo "único, @alumnos.ulagos.cl"
        string nombre
        string apellido
        string rol "estudiante | docente"
        string sede
        object ajustes "EMBEBIDO"
        date creadoEn
        date ultimoAcceso
    }
    ASIGNATURAS {
        ObjectId _id
        ObjectId usuarioId
        string nombre
        string sala
        string profesor
        object horario "EMBEBIDO: dias[], inicio, fin"
        string color "#RRGGBB"
        date creadaEn
    }
    CLASES {
        ObjectId _id
        ObjectId asignaturaId
        ObjectId usuarioId
        object asignatura "copia: nombre, color"
        date fecha
        int duracionSegundos
        int palabras
        string estado "en_curso | finalizada"
        array fragmentos "EMBEBIDO: marcaTiempo, texto, claves, glosas"
        array deletreadas
    }
    GLOSAS {
        ObjectId _id
        string glosa_id "único, GL_..."
        string termino
        array variantes
        string categoria
        string tipo_recurso "lottie | gif | dactilologia"
        string archivo_asset
    }
```

### Documento de ejemplo por colección

Se muestran en *Extended JSON* para que se vean los tipos: `$oid` es un ObjectId y `$date` es una **fecha real (BSON Date), no texto**.

**`usuarios`**
```json
{
  "_id": { "$oid": "1820d6eb8b0a39434c36f463" },
  "firebaseUid": "lfNoB1Nj7BL0qh47wpxWhG5qHzOB",
  "nombre": "Vicente",
  "apellido": "Garín",
  "correo": "vicente.garin@alumnos.ulagos.cl",
  "rol": "estudiante",
  "carrera": "Ingeniería Civil en Informática",
  "sede": "Chiloé",
  "ajustes": { "textoGrande": false, "subtitulos": true, "vibracion": true, "velocidadSenas": 1 },
  "creadoEn": { "$date": "2026-10-29T21:40:00.000Z" },
  "ultimoAcceso": { "$date": "2026-11-25T18:12:47.923Z" }
}
```

**`asignaturas`**
```json
{
  "_id": { "$oid": "1793a64172f61b997f781e9e" },
  "usuarioId": { "$oid": "1820d6eb8b0a39434c36f463" },
  "nombre": "Tecnologías Web y Móviles",
  "sala": "B-204",
  "profesor": "Prof. Andrés Morales",
  "horario": { "dias": ["lunes", "miercoles"], "inicio": "10:15", "fin": "11:35" },
  "color": "#FAD9CF",
  "creadaEn": { "$date": "2026-10-29T22:00:00.000Z" }
}
```

**`clases`** (se muestra 1 de sus 3 fragmentos)
```json
{
  "_id": { "$oid": "a40786265cf13a177d5c273d" },
  "asignaturaId": { "$oid": "1793a64172f61b997f781e9e" },
  "usuarioId": { "$oid": "1820d6eb8b0a39434c36f463" },
  "asignatura": { "nombre": "Tecnologías Web y Móviles", "color": "#FAD9CF" },
  "fecha": { "$date": "2026-11-18T13:15:00.000Z" },
  "duracionSegundos": 4800,
  "palabras": 43,
  "estado": "finalizada",
  "fragmentos": [
    {
      "marcaTiempo": { "$date": "2026-11-18T13:35:00.000Z" },
      "texto": "Hoy vamos a ver navegación con Expo Router. Cada archivo dentro de la carpeta app se convierte en una pantalla.",
      "claves": ["Expo Router"],
      "glosas": ["GL_HOY", "GL_VAMOS", "GL_VER", "GL_NAVEGACION", "GL_EXPO", "GL_ROUTER", "GL_CADA", "GL_ARCHIVO", "GL_DENTRO", "GL_CARPETA", "GL_APP", "GL_CONVIERTE", "GL_PANTALLA"]
    }
  ],
  "deletreadas": ["vamos", "navegacion", "expo", "router", "..."]
}
```

**`glosas`**
```json
{
  "_id": { "$oid": "6b0724dc11cc1074b5425270" },
  "glosa_id": "GL_PRUEBA",
  "termino": "prueba",
  "variantes": ["examen", "certamen", "test"],
  "categoria": "academico",
  "tipo_recurso": "lottie",
  "archivo_asset": "assets/signs/common/prueba.json"
}
```

---

## 3. Decisiones de modelado

La regla usada fue: **embeber lo que una pantalla lee siempre junto y que tiene un tamaño acotado; referenciar lo que crece sin límite o se consulta por separado.**

| Dato | Decisión | Por qué (según cómo lo lee la pantalla) |
|---|---|---|
| `usuarios.ajustes` | **Embebido** | La pantalla Ajustes lee y guarda los cuatro valores juntos. Son pocos campos fijos y solo existen para su usuario. Se actualiza con un `$set` sobre `ajustes.*`. |
| `asignaturas.horario` | **Embebido** | Solo tiene sentido dentro de su asignatura y se muestra en su tarjeta. |
| `asignaturas.usuarioId` | **Referencia** | Un usuario tiene varias asignaturas que se crean y editan por separado (pantalla Nueva asignatura). Embeberlas en el usuario lo haría crecer con cada ramo. |
| `clases.asignaturaId` | **Referencia** | Una asignatura acumula una clase por semana durante todo el semestre, así que crece sin límite. Si las clases estuvieran embebidas, la lista de Asignaturas cargaría todas las transcripciones de cada ramo. Por eso el Detalle pide el historial aparte, sin los fragmentos. |
| `clases.asignatura {nombre, color}` | **Copia (referencia extendida)** | Las pantallas Resumen y Transcripción muestran el nombre y el color del ramo. Con la copia no necesitan un `$lookup`. Si se renombra la asignatura, se actualizan sus clases con un `updateMany` (algo poco frecuente). |
| `clases.fragmentos` | **Embebido** | La pantalla Transcripción lee la clase completa de una vez y los fragmentos no se consultan solos. Tamaño: una clase de 90 min tiene unas 11.000 palabras (≈ 80 KB), muy por debajo del límite de 16 MB por documento. |
| `clases.fragmentos.glosas` | **Referencia por código** (`glosa_id`) | El diccionario es compartido por todos y cambia (se agregan animaciones). En la clase solo se guarda el código; el visor busca el recurso en `glosas` cuando reproduce. |
| `clases.deletreadas` | **Embebido** (arreglo de texto) | El Resumen muestra qué palabras se deletrearon en esa clase. La agregación de la sección 4 las cuenta para decidir qué señas grabar primero. |

**Por qué no es un modelo relacional copiado:** no hay tablas de unión (`fragmento_glosa`, `asignatura_horario`, `usuario_ajustes`). Esos datos viven dentro del documento que los usa. Solo se referencia lo que crece sin límite.

---

## 4. Esquema, validación y consultas

### 4.1 Validación en la base (`$jsonSchema`)

Los validadores están en [`database/schema/esquemas.js`](../database/schema/esquemas.js) y se aplican con [`crear-colecciones.js`](../database/schema/crear-colecciones.js) usando `validationLevel: "strict"` y `validationAction: "error"`. Así, **MongoDB rechaza** cualquier documento inválido, venga de la app, de la API o de la consola. Cada colección define:

- **Campos obligatorios** (`required`) y `additionalProperties: false`, para que no entren campos inventados.
- **Tipos BSON**: `objectId` para las referencias, `date` para fechas, `int` para duración y palabras, y `bool` para los interruptores.
- **Valores permitidos**: `rol` (`estudiante | docente`), `sede`, `estado` (`en_curso | finalizada`), `velocidadSenas` (0.75, 1, 1.5, igual que la pantalla Ajustes), `categoria` y `tipo_recurso` de las glosas, y los días del horario.
- **Formatos (`pattern`)**: correo institucional `@alumnos.ulagos.cl` o `@ulagos.cl`, color `#RRGGBB`, hora `HH:MM` y código de glosa `GL_...`.

**Prueba de rechazo** ([`prueba-validacion.js`](../database/schema/prueba-validacion.js)): se intentan insertar cuatro documentos inválidos y MongoDB rechaza los cuatro con `code 121: Document failed validation`.

| Intento | Regla que falla |
|---|---|
| Usuario con `camila.rojas@gmail.com` | `pattern` del correo institucional |
| Usuario con velocidad de señas `2` | `enum` de `ajustes.velocidadSenas` |
| Asignatura sin `nombre` | `required` |
| Clase con `fecha: "Clase del 18 de noviembre"` (texto) | `bsonType: "date"` |

![Prueba de validación: inserciones rechazadas](img/bd/01-validacion-rechazo.png)

### 4.2 Consultas por pantalla

Todas están en [`database/queries/consultas.js`](../database/queries/consultas.js). Cada función es la consulta que la API Express ejecutará en el Avance N°2. Al correr el script se hace un recorrido completo (leer → crear → actualizar → eliminar) que deja la base como estaba.

| # | Pantalla de la app | Operación | Consulta |
|---|---|---|---|
| 1 | **Acceso** (`app/index.jsx`) | Leer | `usuarios.findOne({ correo })`, solo con los campos necesarios. En el Avance N°2 será por `firebaseUid`. |
| 2 | **Acceso** | Actualizar | `usuarios.updateOne({ _id }, { $currentDate: { ultimoAcceso: true } })` |
| 3 | **Asignaturas** (`(tabs)/index.jsx`) | Leer + **agregación `$lookup`** | `$match` por usuario → `$lookup` a `clases` con `$group` (contador y última fecha) → `$project` → `$sort { nombre: 1 }` |
| 4 | **Nueva asignatura** (`nueva-asignatura.jsx`) | Crear | `asignaturas.insertOne({...})` (validado por `$jsonSchema`) |
| 5 | **Detalle de asignatura** (`asignatura/[id].jsx`) | Actualizar (Editar) | `asignaturas.findOneAndUpdate({ _id, usuarioId }, { $set: { sala } })` |
| 6 | **Detalle de asignatura** | Leer por id + historial | `asignaturas.findOne({ _id })` y `clases.find({ asignaturaId }).sort({ fecha: -1 })` **sin** `fragmentos` |
| 7 | **Traducir** (`(tabs)/traducir.jsx`) | Leer (filtro `$or` + `$in`) | `glosas.find({ $or: [{ termino: { $in: tokens } }, { variantes: { $in: tokens } }] }).sort({ termino: 1 })` |
| 8 | **Traducir** → "Sí, terminar y guardar" | Crear | `clases.insertOne({...})` con los fragmentos embebidos |
| 9 | **Resumen de sesión** (`resumen.jsx`) | Leer por id | `clases.findOne({ _id }, { projection: duración, palabras, deletreadas })` |
| 10 | **Transcripción** (`clase/[id].jsx`) | Leer por id | `clases.findOne({ _id })`: clase completa, sin joins |
| 11 | **Ajustes** (`ajustes.jsx`) | Actualizar | `usuarios.findOneAndUpdate({ _id }, { $set: { "ajustes.textoGrande": true, "ajustes.velocidadSenas": 0.75 } })` |
| 12 | **Detalle de asignatura** (encabezado) | **Agregación `$match` + `$group`** | Clases, minutos y palabras traducidas por asignatura, `$sort { minutosTraducidos: -1 }` |
| 13 | **Resumen** (palabras deletreadas) | **Agregación `$unwind` + `$group`** | Términos sin seña más repetidos (`$sort` + `$limit`) |
| 14 | **Transcripción** → Eliminar | Eliminar | `clases.deleteOne({ _id, usuarioId })` |
| 15 | **Detalle de asignatura** → Eliminar | Eliminar en cascada | `clases.deleteMany({ asignaturaId })` + `asignaturas.deleteOne({ _id, usuarioId })` |

**Pantalla Diálogo (`(tabs)/dialogo.jsx`):** en este avance no consulta la base. Es una conversación breve de pasillo que hoy vive solo en el teléfono y no forma parte del caso de uso principal (traducir y guardar clases). Su colección futura, `dialogos`, está descrita en la sección 2.

En las consultas de escritura, el filtro incluye `usuarioId` para que un estudiante no pueda modificar ni borrar datos de otro.

**Capturas del resultado** (salida de `npm run consultas`):

![P1 Acceso (leer y registrar acceso) y P2 Asignaturas](img/bd/02-consulta-acceso-asignaturas.png)
![P2 Asignaturas: $lookup con contador de clases](img/bd/03-consulta-asignaturas-lookup.png)
![P4 Detalle de asignatura: lectura por id](img/bd/04-consulta-detalle-asignatura.png)
![P4 Detalle de asignatura: historial ordenado por fecha](img/bd/05-consulta-detalle-historial.png)
![P7 Transcripción: clase completa por id](img/bd/06-consulta-transcripcion.png)
![P7 Transcripción: fragmentos embebidos](img/bd/07-consulta-transcripcion-fragmentos.png)
![P3 Nueva asignatura (crear) y Editar (actualizar)](img/bd/08-consulta-crear-editar-asignatura.png)
![P5 Traducir: glosas del diccionario y guardar clase](img/bd/09-consulta-traducir-glosas.png)
![P6 Resumen de sesión y P8 Ajustes](img/bd/10-consulta-resumen-ajustes.png)
![Agregación $match + $group: estadísticas por asignatura](img/bd/11a-agregacion-estadisticas.png)
![Agregación $unwind + $group: términos más deletreados](img/bd/11b-agregacion-deletreados.png)
![Agregación $unwind + $group: términos más deletreados (continuación)](img/bd/11c-agregacion-deletreados-fin.png)
![P7 y P4: eliminar clase y asignatura en cascada](img/bd/11d-consulta-eliminar.png)
**Consola de MongoDB (mongosh en el contenedor Docker):** las 4 colecciones con su cantidad de documentos y una clase con `fecha` de tipo `ISODate` y sus fragmentos embebidos.

![Consola mongosh: colecciones y conteo de documentos](img/bd/16a-consola-colecciones.png)
![Consola mongosh: documento de clases con fragmentos embebidos](img/bd/16b-consola-documento-clase.png)

---

## 5. Índices

Se crean con [`database/queries/indices.js`](../database/queries/indices.js). Para cada índice, el script borra el índice si ya existía, mide la consulta con `explain("executionStats")`, crea el índice y la vuelve a medir.

| Colección | Índice | Tipo | Consulta que acelera (pantalla) | `explain()` antes | `explain()` después |
|---|---|---|---|---|---|
| `usuarios` | `correo_unico` `{correo: 1}` | Único | Buscar perfil por correo (Acceso). Además impide correos repetidos. | COLLSCAN, 11 docs | IXSCAN, 1 doc |
| `usuarios` | `firebaseUid_unico` `{firebaseUid: 1}` | Único | Buscar perfil por el UID de Firebase (Acceso, Avance N°2) | COLLSCAN, 11 docs | IXSCAN, 1 doc |
| `asignaturas` | `usuario_nombre` `{usuarioId: 1, nombre: 1}` | Compuesto | Mis asignaturas ordenadas por nombre (Asignaturas) | SORT + COLLSCAN, 16 docs | IXSCAN, 4 docs, sin SORT |
| `clases` | `asignatura_fecha` `{asignaturaId: 1, fecha: -1}` | Compuesto | Historial de la asignatura, de la más nueva a la más antigua (Detalle). También lo usa el `$lookup`. | SORT + COLLSCAN, 32 docs | IXSCAN, 6 docs, sin SORT |
| `clases` | `usuario_fecha` `{usuarioId: 1, fecha: -1}` | Compuesto | `$match` de las agregaciones por usuario | SORT + COLLSCAN, 32 docs | IXSCAN, 16 docs |
| `glosas` | `termino_1` `{termino: 1}` | Simple | Buscar palabras en el diccionario (Traducir) | COLLSCAN, **2.098 docs** | IXSCAN, **4 docs** |
| `glosas` | `variantes_1` `{variantes: 1}` | Multikey | Sinónimos en el `$or` del traductor (Traducir) | COLLSCAN, 2.098 docs | OR de 2 IXSCAN, 4 docs |
| `glosas` | `glosa_id_1` `{glosa_id: 1}` | Único | Buscar la glosa por código (visor de señas, seed idempotente) | COLLSCAN, 2.098 docs | IXSCAN, 1 doc |

El efecto más claro está en `glosas`: sin índice, traducir una frase **revisa los 2.098 términos**; con índice revisa solo los que coinciden. En una clase real esa búsqueda se repite por cada frase del docente. Con los pocos datos de prueba los tiempos son de 0–1 ms, por eso la evidencia está en **documentos revisados** y en el **tipo de plan** (COLLSCAN → IXSCAN, y desaparece la etapa SORT).

Los índices de `glosas` usan los mismos nombres que crea Mongoose en el backend (`termino_1`, `glosa_id_1`), para que el servidor no intente crearlos de nuevo con otro nombre.

![explain() antes y después: usuarios.correo](img/bd/12-indices-usuarios-correo.png)
![explain() antes y después: firebaseUid, asignaturas y clases](img/bd/13-indices-usuarios-asignaturas-clases.png)
**Salida de `npm run indices` para `clases.usuario_fecha` y los índices del diccionario (`glosas`):**

```text
Índice "usuario_fecha" en clases {"usuarioId":1,"fecha":-1}
│ ANTES   │ SORT → COLLSCAN                                       │ docsRevisados 32   │ claves 0  │ devueltos 16 │
│ DESPUÉS │ FETCH → IXSCAN(usuario_fecha)                         │ docsRevisados 16   │ claves 16 │ devueltos 16 │

Índice "termino_1" en glosas {"termino":1}
│ ANTES   │ COLLSCAN                                              │ docsRevisados 2098 │ claves 0  │ devueltos 4  │
│ DESPUÉS │ FETCH → IXSCAN(termino_1)                             │ docsRevisados 4    │ claves 10 │ devueltos 4  │

Índice "variantes_1" en glosas {"variantes":1}
│ ANTES   │ SUBPLAN → COLLSCAN                                    │ docsRevisados 2098 │ claves 0  │ devueltos 4  │
│ DESPUÉS │ SUBPLAN → FETCH → OR → IXSCAN(termino_1) → IXSCAN(variantes_1) │ docsRevisados 4 │ claves 16 │ devueltos 4 │
```

La salida completa de `npm run todo` (esquemas, seed, índices y consultas) está en [evidencias/salida-npm-run-todo.txt](evidencias/salida-npm-run-todo.txt).

![explain() antes y después: glosas.glosa_id e índices finales](img/bd/15-indices-glosa-id-y-finales.png)

---

## 6. Cómo ejecutarlo

**Requisitos:** Docker Desktop y Node.js 18 o superior.

1. **Variables de entorno.** En la raíz del repositorio, copia `.env.example` como `.env` y completa el usuario, la contraseña y `MONGO_URI` (el `.env` real está en `.gitignore`).
   ```powershell
   Copy-Item .env.example .env
   ```
2. **Levantar MongoDB** (usa las variables del `.env`):
   ```powershell
   docker compose up -d
   ```
3. **Instalar las dependencias de los scripts:**
   ```powershell
   cd database
   npm install
   ```
4. **Crear las colecciones con su validación:**
   ```powershell
   npm run schema
   ```
5. **Probar que la validación rechaza datos inválidos:**
   ```powershell
   npm run schema:prueba
   ```
6. **Cargar los datos de prueba.** Se puede repetir: no duplica datos porque cada documento tiene un `_id` fijo y se guarda con `replaceOne` + `upsert`.
   ```powershell
   npm run seed
   ```
7. **Crear los índices y ver `explain()` antes y después:**
   ```powershell
   npm run indices
   ```
8. **Ejecutar las consultas de cada pantalla:**
   ```powershell
   npm run consultas
   ```

Los pasos 4, 6, 7 y 8 se pueden correr juntos con `npm run todo`. Para ver los datos en MongoDB Compass, conéctate con la misma `MONGO_URI` del `.env`.

---

## 7. Uso de IA generativa

**Herramientas:** Claude (Anthropic), en el chat de claude.ai y en Claude Code (asistente dentro del repositorio).

**Prompts principales:**
1. "Revisa mi proyecto SeñaCampus y dime qué me falta para la rúbrica del Trabajo 3 de Bases de Datos NoSQL" (adjuntando la rúbrica y la corrección de la Idea 2).
2. "¿Necesito usar Firebase y MongoDB?" → se decidió usar MongoDB como base principal y Firebase solo para Authentication.
3. "Propón las colecciones según mis pantallas, decide qué embeber y qué referenciar, y crea los esquemas `$jsonSchema`, el seed idempotente, las consultas por pantalla y los índices con `explain()`".

**Qué se revisó y corrigió de lo que propuso o encontró la IA:**

| Problema | Corrección |
|---|---|
| `docker-compose.yml` y `seedDictionary.js` tenían la contraseña de MongoDB escrita en el código (penalización de la rúbrica). | Las credenciales pasaron a `.env` (ignorado por Git) y se agregaron `.env.example` sin valores. Además se **cambió la contraseña** de MongoDB: la que aparece en commits antiguos del historial ya no es válida. |
| En la app (Avance N°1) la fecha de una clase era texto (`"Clase del 18 de noviembre"`) y la duración también (`"1 h 20 min"`). | En la base son `fecha: Date` y `duracionSegundos: int`. La app formateará el texto al mostrarlo. |
| La colección del diccionario se llamaba `glosses` (nombre automático de Mongoose en inglés). | Se renombró a `glosas` en `Gloss.js`, igual que el resto del modelo. |
| El diccionario LSCh estaba escrito dentro del script del backend. | Se movió a `database/seed/datos/glosas.js` como única fuente, usada por el seed y por el backend. |
| La primera versión de la demo de consultas dejó una asignatura de prueba duplicada al cortarse a medias. | El script ahora limpia los restos de una ejecución anterior antes de empezar. |
| Los nombres de índice propuestos para `glosas` chocaban con los que crea Mongoose al iniciar el servidor. | Se usaron los nombres por defecto (`termino_1`, `glosa_id_1`). |
| Al revisar las capturas, el `explain()` "antes" del índice `termino_1` salía con IXSCAN: Mongoose había creado un índice compuesto `{termino, variantes}` que se adelantaba a la medición. | Se reemplazó por `{variantes: 1}` en `Gloss.js` (el compuesto era redundante) y `indices.js` borra el antiguo antes de medir. Ahora el "antes" sale como COLLSCAN sobre 2.098 documentos. |
| **Decisión propia:** se evaluó usar Firebase (Firestore) y MongoDB como dos bases de datos, ya que el docente lo permitía. La IA advirtió que duplicaba el trabajo (reglas, índices y seed en ambos motores) y complicaba el modelo. | Elegí **MongoDB como única base de datos** (todo lo que exige la rúbrica) y **Firebase solo para el inicio de sesión** (Authentication), que no es una base de datos y se usará en el Avance N°2. Por eso `usuarios` guarda el `firebaseUid`. |

**Evidencia de las conversaciones con la IA:**

![Prompt inicial: revisar el proyecto y continuar](img/bd/17c-ia-prompt-inicial.png)
![Prompt con la rúbrica y la corrección de la Idea 2](img/bd/17d-ia-prompt-rubrica.png)
![Evaluación de usar Firebase y MongoDB](img/bd/17a-ia-decision-firebase-mongodb.png)
![Decisión: MongoDB como base y Firebase solo para el login](img/bd/17b-ia-decision-opcion-a.png)

Todo el código generado se ejecutó y verificó contra la base local: creación de colecciones, rechazo de inserciones inválidas, seed repetido sin duplicar, consultas y `explain()`.
