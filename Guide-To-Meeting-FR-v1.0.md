# Guía de cumplimiento — Requerimientos funcionales (v1.0)

Cómo la **versión 1.0** de Octabio (prototipo navegable: Vite + TypeScript, estado en `localStorage`) cubre los 15 requerimientos funcionales.

**Alcance de esta versión:** happy paths de Auth, Estudiante, Docente y Admin. No hay backend, autenticación real ni envío de correo. Ver `README.md`, `MAPA-NAVEGACION.md` y `PENDING.md`.

---

## Leyenda

| Estado | Significado |
| --- | --- |
| **Cumple** | El flujo principal del RF está navegable y persistido en el prototipo |
| **Parcial** | Hay base funcional o de dominio, pero faltan piezas clave del RF |
| **No cumple** | No existe modelo, pantallas ni flujo para ese RF en v1.0 |

---

## Resumen ejecutivo

| RF | Título corto | Estado v1.0 |
| --- | --- | --- |
| RF-01 | Registro y autenticación de estudiantes | **Cumple** (prototipo local) |
| RF-02 | Cuentas docentes (contenidos, actividades, monitoreo) | **Parcial** |
| RF-03 | Acceso a grupos por código o enlace | **No cumple** |
| RF-04 | Admin crea / edita / publica contenidos | **Cumple** (prototipo) |
| RF-05 | Contenidos por módulos, niveles y objetivos STEAM | **Parcial** |
| RF-06 | Avance automático (logros, puntuaciones, niveles) | **Parcial** |
| RF-07 | Docente ve progreso de estudiantes | **Cumple** (prototipo) |
| RF-08 | Admin diseña gamificación (misiones, puntos, recompensas) | **No cumple** |
| RF-09 | Estudiante juega misiones / puntos / niveles | **No cumple** |
| RF-10 | Admin crea evaluaciones (diagnóstica, seguimiento, final) | **No cumple** |
| RF-11 | Evaluaciones interactivas | **No cumple** |
| RF-12 | Retroalimentación automática paso a paso | **No cumple** |
| RF-13 | Simulaciones del Kit Octabio | **No cumple** |
| RF-14 | Aprendizaje autónomo sin supervisión docente | **Cumple** |
| RF-15 | Administrar / ordenar / activar módulos STEAM | **Parcial** |

**Conteo:** 4 cumplen · 5 parciales · 6 no cumplen.

---

## Detalle por requerimiento

### RF-01 — Registro y autenticación básica de estudiantes

**Estado: Cumple (prototipo local)**

El estudiante puede crear cuenta, iniciar sesión y guardar progreso asociado a su usuario.

| Qué cubre v1.0 | Dónde |
| --- | --- |
| Registro de estudiante (nombre, correo, contraseña) | `#/registro` → `store.register` |
| Login con redirección al panel del rol | `#/login` → `store.login` |
| Sesión persistida | `localStorage` (`octabio-demo-v1`) |
| Progreso ligado al usuario | `Enrollment` + `completedContentIds` |
| Cambio de contraseña (sesión activa) | `#/perfil/contrasena` |

**Limitaciones:** auth solo en cliente; recuperación de contraseña simulada; sin backend ni correo real.

---

### RF-02 — Docentes crean cuentas para administrar contenidos, actividades y monitorear

**Estado: Parcial**

| Aspecto del RF | En v1.0 |
| --- | --- |
| Cuenta con rol docente e inicio de sesión | Sí (seed / alta por admin) |
| Autoregistro del docente | No — solo admin crea usuarios con rol `docente` |
| Administrar contenidos y actividades | No — lo hace el **admin** (`#/admin/cursos`, `#/admin/contenido/:id`) |
| Monitorear estudiantes | Sí — grupos, detalle de grupo y ficha de estudiante |

**Conclusión:** el monitoreo docente está listo; la creación de cuenta docente y la autoría de contenidos/actividades por el docente no.

---

### RF-03 — Registro o ingreso a grupos mediante códigos o enlaces

**Estado: No cumple**

| Qué pide el RF | Qué hay hoy |
| --- | --- |
| Código o enlace de acceso a un grupo | No existe |
| Evitar alta manual uno a uno por el docente | El estudiante se **inscribe solo** desde el catálogo; los **grupos** vienen del seed y no hay UI de invitaciones |

Rutas relacionadas que **no** sustituyen este RF: `#/app/catalogo`, `#/app/curso/:id` (inscripción libre a curso, no a grupo por código).

---

### RF-04 — Administradores crean, editan y publican contenidos educativos

**Estado: Cumple (prototipo)**

| Capacidad | Ruta / API |
| --- | --- |
| Crear y editar cursos | `#/admin/cursos/nuevo`, `#/admin/cursos/:id` → `store.saveCourse` |
| Publicar / ocultar (activo) | Checkbox «Curso activo en catálogo» |
| Alta y baja de materiales | `#/admin/contenido/:courseId` → `addContent` / `removeContent` |
| Tipos de contenido | `video`, `pdf`, `image`, `richtext`, `steam` |
| Categorías STEAM | `#/admin/categorias` |

**Limitaciones:** visores con media placeholder; sin hosting real de video/PDF; deep links STEAM simulados.

---

### RF-05 — Visualización estructurada por módulos, niveles y objetivos STEAM

**Estado: Parcial**

| Concepto del RF | Modelo v1.0 |
| --- | --- |
| Objetivos / ejes STEAM | **Categorías** (Ciencia, Tecnología, Ingeniería, Arte, Matemáticas) |
| Unidad de aprendizaje | **Curso** en catálogo y aula |
| Secuencia de materiales | **Contenidos** ordenados (`order`) en el Aula |
| Módulos / niveles / objetivos como entidades | No modelados |

Flujo estudiante: Catálogo → Detalle → Aula → Visor (`#/app/catalogo` … `#/app/contenido/...`).

---

### RF-06 — Registro automático de avance (logros, puntuaciones, progreso por nivel)

**Estado: Parcial**

| Elemento | v1.0 |
| --- | --- |
| Avance automático al completar contenido | Sí — `store.completeContent` |
| Porcentaje por curso | Sí — `store.courseProgress` · `#/app/progreso` |
| Logros / badges | No |
| Puntuaciones | No |
| Progreso por nivel | No (no hay niveles) |

---

### RF-07 — Docentes visualizan el progreso de sus estudiantes

**Estado: Cumple (prototipo)**

| Pantalla | Qué muestra |
| --- | --- |
| `#/doc/inicio`, `#/doc/grupos` | Grupos del docente |
| `#/doc/grupo/:id` | Lista de estudiantes con % de avance en el curso del grupo |
| `#/doc/estudiante/:id` | Ficha con progreso por cursos inscritos |

Datos de demostración en `src/data/seed.ts` (grupos e inscripciones).

---

### RF-08 — Administradores diseñan misiones, retos, puntos, recompensas y gamificación

**Estado: No cumple**

No hay entidades ni pantallas de misión, reto, puntos o recompensas. El admin gestiona cursos y contenidos; algún título seed («Reto: calculadora simple») es solo copy, no un sistema gamificado.

---

### RF-09 — Estudiantes realizan misiones, acumulan puntos y desbloquean niveles

**Estado: No cumple**

El estudiante completa contenidos y ve progreso porcentual. No hay puntos, recompensas ni desbloqueo de niveles.

---

### RF-10 — Administradores crean evaluaciones diagnósticas, de seguimiento y finales

**Estado: No cumple**

No existe tipo «evaluación», ni asociación a contenidos con fase diagnóstica / seguimiento / final.

---

### RF-11 — Evaluaciones interactivas según temas del programa

**Estado: No cumple**

El visor muestra placeholders (video, PDF, texto, recurso STEAM simulado). No hay cuestionarios ni ítems interactivos calificables.

---

### RF-12 — Retroalimentación automática (correcto / incorrecto + explicación paso a paso)

**Estado: No cumple**

Sin motor de respuestas ni feedback pedagógico automático. El texto enriquecido puede mostrar pasos estáticos, pero no evalúa al estudiante.

---

### RF-13 — Simulaciones del Kit Octabio (sin hardware)

**Estado: No cumple**

El tipo `steam` es un **placeholder** («Abrir recurso simulado»). No hay simulador del kit, ni modelo de sensores/motores/programación del hardware Octabio.

---

### RF-14 — Avance autónomo sin supervisión docente

**Estado: Cumple**

| Capacidad | Evidencia |
| --- | --- |
| Inscripción libre a cursos activos | Catálogo / detalle → `store.enroll` |
| Consumo de contenidos sin gate del docente | Aula + Visor |
| Progreso individual | `Enrollment` por `userId` |
| El docente observa, no bloquea el avance | Solo lectura de progreso en panel docente |

Alineado con el glosario: inscripción habilita Aula, Visor y Progreso de forma individual.

---

### RF-15 — Administrar, ordenar, activar o desactivar módulos STEAM

**Estado: Parcial**

En v1.0 el «módulo» operativo es el **Curso**.

| Capacidad del RF | v1.0 |
| --- | --- |
| Activar / desactivar | Sí — `Course.active` (catálogo solo muestra activos) |
| Crear / editar / eliminar cursos | Sí — panel admin |
| Ordenar contenidos al agregar | Parcial — `order` secuencial al crear; **sin UI de reordenar** |
| Activar / desactivar contenidos sueltos | No — solo alta/baja |
| Módulo como entidad distinta del curso | No |

También: gestión de categorías STEAM y usuarios (activar/desactivar cuentas).

---

## Mapa RF → conceptos del sistema

| Concepto v1.0 | RFs que toca |
| --- | --- |
| Rol + Usuario + sesión | RF-01, RF-02 |
| Curso + Categoría STEAM + Contenido | RF-04, RF-05, RF-15 |
| Inscripción + Progreso | RF-01, RF-06, RF-07, RF-14 |
| Grupo (cohorte docente) | RF-02, RF-07 — **no** RF-03 |
| Gamificación / evaluaciones / simulador | RF-08 … RF-13 — fuera de v1.0 |

---

## Lectura para planificación

Bloques naturales hacia una v2+ según huecos de esta guía:

1. **Acceso a grupos** — códigos / enlaces (RF-03) sobre el modelo `Group` ya existente.
2. **Estructura pedagógica** — módulos, niveles u objetivos explícitos (cierra RF-05 y RF-15).
3. **Progreso enriquecido** — logros y puntuaciones (completa RF-06).
4. **Gamificación** — misiones, puntos, recompensas, desbloqueos (RF-08, RF-09).
5. **Evaluaciones + feedback** — tipos diagnóstica/seguimiento/final, UI interactiva y explicación (RF-10 … RF-12).
6. **Simulador Kit Octabio** — RF-13.
7. **Rol docente autor** — si el RF-02 debe incluir creación de contenidos/actividades por el docente (hoy solo admin).
8. **Backend real** — autentica y persiste fuera de `localStorage` lo ya cubierto en prototipo.