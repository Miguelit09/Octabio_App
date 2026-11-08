# Estándares de codificación — Octabio App (v1.0)

Guía viva de convenciones del prototipo **Octabio** (Vite + TypeScript + Tailwind CSS + DOM + `localStorage`). Sirve como referencia del equipo y como evidencia técnica de estándares de codificación.

**Alcance:** solo el stack de v1.0. Backend real, tests automatizados, ESLint/Prettier y frameworks UI (React, etc.) quedan fuera; ver [Fuera de alcance](#14-fuera-de-alcance--futuro).

**Formato de cada convención:** regla → ejemplo → justificación.

---

## 1. Stack y herramientas que respaldan estas reglas

| Tecnología | Rol en el proyecto | Qué impone o favorece |
| --- | --- | --- |
| **Vite** | Bundler y dev server | Módulos ES, árbol `src/`, CSS importado desde TS |
| **TypeScript ~5.8** (`strict`) | Tipado estático | Nombres tipados, `import type`, sin `any` implícito |
| **Tailwind CSS v4** | Estilos | Tokens en `@theme`, utilidades en markup |
| **DOM nativo + `el()`** | UI sin framework | Componentes como funciones que retornan `HTMLElement` |
| **Hash router** | Navegación SPA | Rutas `#/...`, params en path |
| **`localStorage`** | Persistencia del prototipo | Una sola clave de app; mutaciones centralizadas |

**Enforcer oficial en v1.0:** `tsc` (`npm run build` ejecuta `tsc && vite build`) con `strict`, `noUnusedLocals`, `noUnusedParameters` y `verbatimModuleSyntax`.

---

## 2. Idioma del código y del producto

**Regla:** identificadores técnicos en **inglés**; valores de dominio, copy de UI y rutas visibles al usuario en **español**. Comentarios y esta guía en **español**.

**Ejemplo:**

```ts
export type Role = "estudiante" | "docente" | "admin";

export function renderCatalog(root: HTMLElement, query: Record<string, string>): void {
  // ...
}
```

Ruta de usuario: `#/app/catalogo` (español) · función: `renderCatalog` (inglés).

**Justificación:** TypeScript y el ecosistema npm se leen mejor en inglés; el producto pedagógico Octabio se presenta en español. Separar ambos evita mezclar `renderCatalogo` con `Course` a medias.

---

## 3. Organización de carpetas (recomendado)

**Regla:** ubicar código nuevo según la responsabilidad de cada carpeta. El mapa es **recomendado**, no un gate obligatorio: si una pieza no encaja, documentar el porqué en el PR/commit.

```
src/
├── main.ts              # Arranque, registro de rutas, gate de auth
├── vite-env.d.ts
├── styles/
│   └── main.css         # Tailwind + tokens @theme + clases de componente
├── lib/                 # Utilidades puras / DOM de bajo nivel (sin UI de negocio)
├── router/              # Hash router genérico
├── state/
│   ├── types.ts         # Tipos e interfaces de dominio
│   └── store.ts         # Estado, persistencia, API de mutación
├── data/
│   └── seed.ts          # Datos iniciales de demostración
├── components/          # UI reutilizable (botones, shell, formularios…)
│   └── domain/          # Piezas ligadas a entidades (course-card, group-card)
└── pages/
    ├── auth/
    ├── student/
    ├── teacher/
    └── admin/           # Pantallas por rol; exportan renderXxx
```

**Justificación:** En una SPA Vite sin framework, esta separación evita que las páginas escriban a `localStorage`, que el store pinte HTML o que los tipos de dominio se dupliquen en cada vista.

---

## 4. Nomenclatura de archivos

**Regla:**

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Archivos y carpetas | `kebab-case` | `course-card.ts`, `demo-hint.ts` |
| Entry / barrels | `index.ts` o nombre de rol del módulo | `pages/student/index.ts`, `main.ts` |
| Estilos globales | Un CSS principal | `styles/main.css` |

**Justificación:** Coherente con URLs y con el estilo habitual en proyectos Vite; evita colisiones con `PascalCase` reservado a tipos en TypeScript.

---

## 5. Nomenclatura en TypeScript

**Regla:**

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Variables y funciones | `camelCase` | `courseProgress`, `requireAuth` |
| Tipos, interfaces | `PascalCase` | `ContentItem`, `AppState` |
| Constantes de módulo | `UPPER_SNAKE` o `camelCase` estable | `STORAGE_KEY`, `DEMO_PASSWORD` |
| Props/opciones de UI | objeto `opts` tipado en línea o tipo dedicado | `button(opts: { … })` |
| Uniones de dominio | literales en español cuando el valor es de negocio | `"video" \| "pdf" \| …`, `Role` |
| Renderizadores de página | `render` + nombre en inglés | `renderAdminCourses` |
| Guards de rol | `require` + rol | `requireStudent`, `requireAdmin` |

**Ejemplo:**

```ts
export interface Course {
  id: string;
  title: string;
  categoryId: string;
  active: boolean;
}

export function courseCard(opts: {
  course: Course;
  progress?: number;
}): HTMLElement { /* … */ }
```

**Justificación:** Sigue las convenciones de TypeScript/JavaScript y deja los tipos visibles al leer el código (`Course` vs `course`).

---

## 6. Indentación, formato y estilo de sintaxis

**Regla:**

- Indentación: **2 espacios** (no tabs).
- Comillas: **dobles** (`"`) en TypeScript.
- Punto y coma: **sí**, al final de sentencias.
- Ancho: líneas legibles; preferir romper argumentos de funciones largas.
- No dejar variables/parámetros sin usar (`tsc` lo rechaza).

**Ejemplo:**

```ts
export function navigate(to: string): void {
  const hash = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : `/${to}`}`;
  location.hash = hash;
}
```

**Justificación:** Uniformidad sin Prettier instalado; el equipo se apoya en el estilo ya presente en `src/` y en el compilador TypeScript.

---

## 7. Módulos, imports y exports

**Regla:**

- Preferir **named exports** (no `export default`).
- Usar `import type { … }` para tipos (`verbatimModuleSyntax`).
- Imports **relativos** (`../state/store`); no hay path aliases en v1.0.
- Agrupar pantallas de un rol en un barrel `pages/<rol>/index.ts` cuando exporten varios `renderXxx`.

**Ejemplo:**

```ts
import type { Role } from "./state/types";
import { homeForRole, store } from "./state/store";
import { renderLogin } from "./pages/auth";
```

**Justificación:** Named exports mejoran el autocompletado y los renames; `import type` deja claro qué se borra en compile-time.

---

## 8. Comentarios y documentación en código

**Regla:**

- No comentar lo obvio (`// incrementa i`).
- Comentar el **porqué**: límites del prototipo, auth simulada, decisiones no evidentes.
- JSDoc breve en APIs públicas del store o helpers reutilizables cuando el nombre no baste.
- Comentarios en **español**, alineados a esta guía.

**Ejemplo (aceptable):**

```ts
// Auth solo en cliente: no hay backend ni hash de contraseña en v1.0.
```

**Ejemplo (evitar):**

```ts
// Obtiene la sesión
const session = store.getSession();
```

**Justificación:** En un prototipo educativo, el “porqué” (simulaciones, demos) importa más que narrar el “qué”.

---

## 9. Tipos de dominio y estado

**Regla:**

- Definir entidades en `src/state/types.ts`.
- Toda lectura/escritura de datos de app pasa por `store` en `src/state/store.ts`.
- **Prohibido** llamar `localStorage` desde `pages/` o `components/`.
- Datos iniciales solo en `src/data/seed.ts`.
- Clave de persistencia con prefijo de producto: `octabio-demo-v1`.

**Ejemplo:**

```ts
const STORAGE_KEY = "octabio-demo-v1";

function persist(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
```

**Justificación:** Centralizar persistencia evita estados divergentes y facilita migrar después a un API real sin reescribir cada página.

---

## 10. Identificadores de entidades

**Regla:**

- IDs como `string`, nunca el índice de un array como identidad.
- En seed: ids legibles y estables (`u-est`, `cat-ciencia`, …).
- En altas en runtime: prefijo + fragmento único (`uid("course")` → `course-a1b2c3d4`).

**Justificación:** Facilita depurar el prototipo y relacionar datos entre cursos, grupos e inscripciones.

---

## 11. UI, DOM y páginas

**Regla:**

- Construir nodos con `el()` (`src/lib/dom.ts`) o helpers de `components/*`.
- No inyectar HTML de usuario con `innerHTML` sin escapar (`escapeHtml` cuando haga falta).
- Cada pantalla exporta `renderXxx(root: HTMLElement, …): void` y deja el root limpio (`clear(root)` o equivalente).
- Eventos: `addEventListener` en el elemento creado; no handlers globales innecesarios.

**Ejemplo:**

```ts
export function button(opts: {
  variant?: ButtonVariant;
  label?: string;
  onClick?: () => void;
}): HTMLButtonElement {
  const btn = el("button", { type: "button", className: "btn-primary" }, [
    opts.label ?? "",
  ]) as HTMLButtonElement;
  if (opts.onClick) btn.addEventListener("click", opts.onClick);
  return btn;
}
```

**Justificación:** Sin React/Vue, esta convención es el “componente”; reduce XSS en un demo con datos editables y mantiene las páginas composables.

---

## 12. Estilos (Tailwind + tokens)

**Regla:**

- Tokens de diseño (color, tipografía) en `@theme` dentro de `src/styles/main.css`.
- Preferir **utilidades Tailwind** en el markup generado.
- Clases semánticas (`btn-primary`, `btn-ghost`, …) solo para patrones reutilizables definidos en CSS.
- No introducir CSS Modules ni BEM paralelo en v1.0.

**Ejemplo:**

```css
@theme {
  --color-primary: #002567;
  --color-on-primary: #ffffff;
}
```

```ts
el("div", { className: "flex flex-col gap-4 p-4 bg-surface" }, [/* … */]);
```

**Justificación:** Tailwind v4 + `@theme` concentra la marca Octabio; las clases `btn-*` evitan repetir cadenas largas de utilidades en cada botón.

---

## 13. Validación, errores y sesión

**Regla:**

- Validar en cliente lo mínimo: campos requeridos, sesión activa, rol permitido.
- Feedback al usuario con los mecanismos existentes (toast, mensajes en pantalla, redirección a login).
- Guards de ruta en `main.ts` / `require*` por rol antes de renderizar paneles.
- No asumir API de servidor ni códigos HTTP en v1.0.

**Justificación:** El prototipo prioriza flujos navegables; documentar el límite evita fingir una capa de errores de backend que no existe.

---

## 14. Accesibilidad (checklist ligero)

**Regla:**

- Inputs con `label` asociado (o `aria-label` cuando el diseño lo impida).
- Acciones clicables como `<button>` (o enlace real `<a href="#...">`), no `div` con click.
- `type="button"` | `"submit"` explícito en botones.
- Contraste y color a través de tokens del tema (no grises arbitrarios ilegibles).

**Justificación:** Sin suite a11y automatizada, estas reglas dan una base razonable para un producto educativo usado en aula.

---

## 15. Rutas (hash router)

**Regla:**

- Registrar rutas con `route(pattern, handler)` en `main.ts`.
- Paths en español orientados al usuario (`/app/catalogo`, `/doc/grupos`, `/admin/cursos`).
- Params con `:id` en el pattern; query vía `match.query`.
- Navegación con `navigate` o `location.hash`, no recargas completas.

**Justificación:** El hash router de Vite SPA no necesita servidor de fallback; las URLs en español refuerzan la política de producto.

---

## 16. Conventional Commits

**Regla:** mensajes de commit con prefijo Conventional Commits:

```
<type>(scope opcional): descripción breve en español o inglés
```

**Types habituales:**

| Type | Uso |
| --- | --- |
| `feat` | Nueva capacidad visible |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `refactor` | Cambio interno sin feature ni fix |
| `style` | Formato / clases CSS sin lógica |
| `chore` | Tooling, deps, tareas de mantenimiento |

**Ejemplos:**

```
feat(student): mostrar progreso por curso en el aula
fix(store): persistir enrollments tras completar contenido
docs: agregar estándares de codificación
```

**Regla adicional:** no commitear secretos reales, `.env` con credenciales, ni dumps de `localStorage` de producción (este repo es demo local).

**Justificación:** Conventional Commits facilitan el historial para evidencia, changelogs y revisión entre aprendices.

---

## 17. Fuera de alcance / futuro

No forman parte del estándar exigible de v1.0 (mencionarlos evita inventar reglas):

- ESLint / Prettier / EditorConfig
- Tests unitarios o E2E
- Backend, JWT, hashing de contraseñas, correo real
- Path aliases (`@/…`)
- Framework UI (React/Vue) — hay notas en `docs/contributing/` orientadas a React que **no** aplican al código actual de `src/`
- Gamificación, evaluaciones y simulador Kit (ver guía de RF)

Cuando se adopten, este documento debe actualizarse en un commit `docs:`.

---

## 18. Checklist de autoevaluación (evidencia)

Marca cada ítem al preparar la evidencia o un PR:

- [ ] Archivos nuevos en `kebab-case`; símbolos TS con camelCase / PascalCase según sección 5
- [ ] Texto de UI y roles de dominio en español; nombres de funciones/tipos en inglés
- [ ] Código nuevo ubicado de forma coherente con el mapa de carpetas (o justificado si no)
- [ ] Tipos de dominio en `state/types.ts`; mutaciones solo vía `store`
- [ ] Sin `localStorage` directo fuera de `store.ts`
- [ ] UI construida con `el()` / components; sin `innerHTML` inseguro
- [ ] Estilos con tokens/utilidades Tailwind; clases semánticas solo si son reutilizables
- [ ] Rutas registradas en el router; guards de rol donde corresponde
- [ ] Comentarios solo cuando aportan el *porqué*
- [ ] `npm run build` (`tsc`) pasa sin errores
- [ ] Commit con Conventional Commits; sin secretos

---

## Referencias del repositorio

- `tsconfig.json` — reglas del compilador
- `package.json` — scripts `dev` / `build` / `preview`
- `src/state/types.ts`, `src/state/store.ts`, `src/data/seed.ts`
- `src/lib/dom.ts`, `src/styles/main.css`
- `Guide-To-Meeting-FR-v1.0.md` — alcance funcional de v1.0
`)