# API de SeñaCampus (Avance N°2)

Backend en **Node.js + Express 5** sobre **MongoDB** (Atlas en la nube o Docker en local). Las consultas son las mismas del Trabajo 3 ([`database/queries/consultas.js`](../database/queries/consultas.js)), y la validación la hace MongoDB con `$jsonSchema`.

**URL base local:** `http://localhost:5000/api`

## Identificación del usuario

Todas las rutas de `/api/v1/usuarios`, `/api/v1/asignaturas` y `/api/v1/clases` necesitan saber quién es el estudiante:

| Modo | Cómo se identifica | Cuándo |
|---|---|---|
| **Firebase** (Fase 2) | Encabezado `Authorization: Bearer <idToken de Firebase>` | App publicada |
| **Desarrollo** (`AUTH_MODO=desarrollo` en `server/.env`) | Encabezado `X-Usuario-Correo: vicente.garin@alumnos.ulagos.cl` | Pruebas locales y Postman, mientras se configura Firebase |

Cada consulta filtra por el usuario identificado, así que un estudiante nunca ve, edita ni borra datos de otro.

## Formato de las respuestas

```json
{ "ok": true, "data": { } }
{ "ok": false, "error": "Revisa los datos ingresados.", "campos": { "nombre": "El nombre es obligatorio (entre 3 y 80 caracteres)." } }
```

`campos` trae un mensaje por cada campo inválido, para mostrarlo debajo del campo en los formularios de la app.

| Código | Cuándo |
|---|---|
| 200 / 201 | Todo bien / recurso creado |
| 400 | Datos inválidos (incluye los rechazos de `$jsonSchema`) o id con formato incorrecto |
| 401 | No se pudo identificar al usuario |
| 404 | El recurso no existe o es de otro usuario |
| 409 | Registro duplicado |
| 500 | Error interno |

## Rutas por pantalla

| Pantalla de la app | Método y ruta | Cuerpo / parámetros |
|---|---|---|
| — | `GET /api/health` | Comprobar que el servidor responde |
| **Traducir** (motor de glosas) | `POST /api/v1/traductor/parse` | `{ "texto": "Mañana hay prueba", "contexto": "academico" }` (público) |
| **Acceso** | `GET /api/v1/usuarios/me` | Perfil y ajustes; registra el último acceso |
| **Ajustes** | `PATCH /api/v1/usuarios/me/ajustes` | `{ "textoGrande": true, "velocidadSenas": 0.75 }` (solo los que cambian) |
| **Asignaturas** | `GET /api/v1/asignaturas` | Lista con `clasesGuardadas` y `ultimaClase` (`$lookup`) |
| **Nueva asignatura** | `POST /api/v1/asignaturas` | `{ "nombre", "sala", "profesor", "horario": { "dias": ["lunes"], "inicio": "10:15", "fin": "11:35" }, "color": "#FAD9CF" }` |
| **Detalle de asignatura** | `GET /api/v1/asignaturas/:id` | Asignatura + historial de clases (más nueva primero) |
| **Detalle** → Editar | `PATCH /api/v1/asignaturas/:id` | Campos a cambiar. Si cambia nombre o color, se actualiza en sus clases |
| **Detalle** → Eliminar | `DELETE /api/v1/asignaturas/:id` | Borra la asignatura y sus clases |
| **Detalle** (encabezado) | `GET /api/v1/asignaturas/estadisticas` | Clases, minutos y palabras por asignatura (`$group`) |
| **Traducir** → Guardar | `POST /api/v1/clases` | `{ "asignaturaId", "fecha", "duracionSegundos", "fragmentos": [{ "marcaTiempo", "texto", "claves", "glosas" }], "deletreadas" }` |
| **Resumen de sesión** | `GET /api/v1/clases/:id?vista=resumen` | Duración, palabras y deletreadas |
| **Transcripción** | `GET /api/v1/clases/:id` | Clase completa con sus fragmentos |
| **Transcripción** → Eliminar | `DELETE /api/v1/clases/:id` | |
| **Resumen** (palabras sin seña) | `GET /api/v1/clases/deletreadas?limite=10` | Términos más deletreados (`$unwind` + `$group`) |

Las fechas viajan como texto ISO (`"2026-11-18T13:15:00.000Z"`) y la API las guarda como `Date`. `palabras` lo calcula el servidor a partir de los fragmentos.

## Cómo probarla

1. En `server/.env` (ver [`server/.env.example`](../server/.env.example)): `MONGO_URI` y `AUTH_MODO=desarrollo`.
2. `cd server` → `npm install` → `npm run dev`
3. En otra terminal: `npm run probar` (recorre todas las pantallas: 23 pruebas, crea datos de prueba y los borra al final).
