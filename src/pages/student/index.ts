import { button } from "../../components/buttons";
import { listRow, surfaceCard } from "../../components/cards";
import { courseCard } from "../../components/domain/course-card";
import { progressLabeled } from "../../components/progress";
import { shell, topBar } from "../../components/shell";
import { showToast } from "../../components/toast";
import { emptyState, pageTitle } from "../../components/ui";
import { clear, contentTypeLabel, el } from "../../lib/dom";
import { navigate } from "../../router";
import { store } from "../../state/store";
import type { ContentItem, Course } from "../../state/types";

function requireStudent(): ReturnType<typeof store.getSession> {
  const session = store.getSession();
  if (!session || session.role !== "estudiante") {
    navigate(session ? homeFallback(session.role) : "#/login");
    return null;
  }
  return session;
}

function homeFallback(role: string): string {
  if (role === "docente") return "#/doc/inicio";
  if (role === "admin") return "#/admin";
  return "#/login";
}

function categoryName(id: string): string {
  return store.getState().data.categories.find((c) => c.id === id)?.name ?? "STEAM";
}

export function renderStudentHome(root: HTMLElement): void {
  clear(root);
  const session = requireStudent();
  if (!session) return;

  const { data } = store.getState();
  const enrolled = data.enrollments
    .filter((e) => e.userId === session.id)
    .map((e) => data.courses.find((c) => c.id === e.courseId))
    .filter((c): c is Course => Boolean(c && c.active));

  const children: HTMLElement[] = [
    pageTitle(`Hola, ${session.name.split(" ")[0]}`, "Continúa tu aprendizaje STEAM."),
  ];

  if (enrolled.length === 0) {
    children.push(
      emptyState({
        title: "Aún no tienes cursos",
        body: "Explora el catálogo e inscríbete en tu primer curso.",
        actionLabel: "Ir al catálogo",
        onAction: () => navigate("#/app/catalogo"),
      }),
    );
  } else {
    const continueCourse = enrolled[0];
    const pct = store.courseProgress(session.id, continueCourse.id);
    const cont = el("div", { className: "mb-6" }, [
      el("p", { className: "label-caps mb-2" }, ["Continuar"]),
      courseCard({
        course: continueCourse,
        percent: pct,
        onClick: () => navigate(`#/app/aula/${continueCourse.id}`),
      }),
    ]);
    children.push(cont);

    children.push(el("p", { className: "label-caps mb-2" }, ["Mis cursos"]));
    const list = el("div", { className: "flex flex-col gap-3" });
    for (const course of enrolled) {
      list.append(
        courseCard({
          course,
          percent: store.courseProgress(session.id, course.id),
          onClick: () => navigate(`#/app/aula/${course.id}`),
        }),
      );
    }
    children.push(list);
  }

  root.append(shell({ role: "estudiante", activeHref: "#/app/inicio", children }));
}

export function renderCatalog(root: HTMLElement, query: Record<string, string>): void {
  clear(root);
  const session = requireStudent();
  if (!session) return;

  const { data } = store.getState();
  const q = (query.q ?? "").trim().toLowerCase();
  const cat = query.cat ?? "todas";

  let courses = data.courses.filter((c) => c.active);
  if (cat !== "todas") courses = courses.filter((c) => c.categoryId === cat);
  if (q) {
    courses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
    );
  }

  const search = el("input", {
    type: "search",
    className: "field-input mb-3",
    placeholder: "Buscar cursos…",
    value: query.q ?? "",
  }) as HTMLInputElement;

  const chips = el("div", { className: "mb-4 flex flex-wrap gap-2" });
  const allCats = [{ id: "todas", name: "Todas" }, ...data.categories];
  for (const c of allCats) {
    const active = cat === c.id || (c.id === "todas" && cat === "todas");
    const chip = el(
      "button",
      {
        type: "button",
        className: `rounded-full border px-3 py-1.5 text-sm font-semibold ${
          active
            ? "border-primary-container bg-primary-container text-on-primary"
            : "border-card-border bg-card text-on-surface-variant"
        }`,
      },
      [c.name],
    );
    chip.addEventListener("click", () => {
      const params = new URLSearchParams();
      if (search.value) params.set("q", search.value);
      if (c.id !== "todas") params.set("cat", c.id);
      const qs = params.toString();
      navigate(`#/app/catalogo${qs ? `?${qs}` : ""}`);
    });
    chips.append(chip);
  }

  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams();
      if (search.value.trim()) params.set("q", search.value.trim());
      if (cat !== "todas") params.set("cat", cat);
      const qs = params.toString();
      navigate(`#/app/catalogo${qs ? `?${qs}` : ""}`);
    }
  });

  const children: HTMLElement[] = [
    pageTitle("Catálogo", "Cursos STEAM activos."),
    search,
    chips,
  ];

  if (courses.length === 0) {
    children.push(
      emptyState({
        title: "Sin resultados",
        body: "Prueba otra búsqueda o categoría.",
        actionLabel: "Limpiar filtros",
        onAction: () => navigate("#/app/catalogo"),
      }),
    );
  } else {
    const list = el("div", { className: "flex flex-col gap-3" });
    for (const course of courses) {
      list.append(
        courseCard({
          course,
          onClick: () => navigate(`#/app/curso/${course.id}`),
        }),
      );
    }
    children.push(list);
  }

  root.append(shell({ role: "estudiante", activeHref: "#/app/catalogo", children }));
}

export function renderCourseDetail(root: HTMLElement, courseId: string): void {
  clear(root);
  const session = requireStudent();
  if (!session) return;

  const course = store.getState().data.courses.find((c) => c.id === courseId);
  if (!course) {
    navigate("#/app/catalogo");
    return;
  }

  const enrolled = store.isEnrolled(session.id, courseId);
  const contents = store
    .getState()
    .data.contents.filter((c) => c.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  const actions = el("div", { className: "mt-6 flex flex-col gap-3" });
  if (enrolled) {
    actions.append(
      button({
        variant: "primary",
        label: "Ir al aula",
        onClick: () => navigate(`#/app/aula/${courseId}`),
      }),
    );
  } else {
    actions.append(
      button({
        variant: "primary",
        label: "Inscribirme",
        onClick: () => {
          const result = store.enroll(courseId);
          if (!result.ok) {
            showToast(result.error, "error");
            return;
          }
          showToast("Inscripción confirmada.", "success");
          navigate(`#/app/aula/${courseId}`);
        },
      }),
    );
  }

  root.append(
    shell({
      role: "estudiante",
      activeHref: "#/app/catalogo",
      top: topBar({ title: "Detalle del curso", backHref: "#/app/catalogo" }),
      children: [
        surfaceCard({
          className: "mb-4",
          children: [
            el("p", { className: "label-caps text-primary-container" }, [
              categoryName(course.categoryId),
            ]),
            el("h2", { className: "mt-2 text-2xl font-bold text-navy" }, [course.title]),
            el("p", { className: "mt-2 text-on-surface-variant" }, [course.description]),
          ],
        }),
        el("p", { className: "label-caps mb-2" }, ["Temario"]),
        el(
          "ul",
          { className: "flex flex-col gap-2" },
          contents.map((c) =>
            el("li", { className: "card-white text-sm" }, [
              el("span", { className: "font-semibold text-navy" }, [c.title]),
              el("span", { className: "mt-1 block text-on-surface-variant" }, [
                contentTypeLabel(c.type),
              ]),
            ]),
          ),
        ),
        actions,
      ],
    }),
  );
}

export function renderClassroom(root: HTMLElement, courseId: string): void {
  clear(root);
  const session = requireStudent();
  if (!session) return;

  const course = store.getState().data.courses.find((c) => c.id === courseId);
  if (!course) {
    navigate("#/app/inicio");
    return;
  }
  if (!store.isEnrolled(session.id, courseId)) {
    navigate(`#/app/curso/${courseId}`);
    return;
  }

  const contents = store
    .getState()
    .data.contents.filter((c) => c.courseId === courseId)
    .sort((a, b) => a.order - b.order);
  const enrollment = store
    .getState()
    .data.enrollments.find((e) => e.userId === session.id && e.courseId === courseId);
  const pct = store.courseProgress(session.id, courseId);

  const children: HTMLElement[] = [
    pageTitle(course.title, "Aula del curso"),
    el("div", { className: "mb-4" }, [
      progressLabeled({ label: "Avance global", percent: pct, success: pct === 100 }),
    ]),
  ];

  if (contents.length === 0) {
    children.push(
      emptyState({
        title: "Sin contenido aún",
        body: "El administrador todavía no ha publicado materiales en este curso.",
      }),
    );
  } else {
    const list = el("div", { className: "flex flex-col gap-3" });
    for (const item of contents) {
      const done = enrollment?.completedContentIds.includes(item.id);
      list.append(
        listRow({
          eyebrow: contentTypeLabel(item.type),
          title: item.title,
          subtitle: item.description,
          borderSuccess: Boolean(done),
          trailing: el("span", {
            className: `shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
              done ? "bg-success-container text-success" : "bg-surface-high text-on-surface-variant"
            }`,
          }, [done ? "Hecho" : "Pendiente"]),
          onClick: () => navigate(`#/app/contenido/${courseId}/${item.id}`),
        }),
      );
    }
    children.push(list);
  }

  root.append(
    shell({
      role: "estudiante",
      activeHref: "#/app/inicio",
      top: topBar({ title: "Aula", backHref: "#/app/inicio" }),
      children,
    }),
  );
}

function viewerPlaceholder(item: ContentItem): HTMLElement {
  if (item.type === "video") {
    return el("div", {
      className:
        "flex aspect-video items-center justify-center rounded-xl bg-navy text-on-primary",
    }, [
      el("div", { className: "text-center" }, [
        el("p", { className: "text-3xl" }, ["▶"]),
        el("p", { className: "mt-2 text-sm opacity-80" }, [
          item.durationLabel ? `Video · ${item.durationLabel}` : "Video (placeholder)",
        ]),
      ]),
    ]);
  }
  if (item.type === "pdf") {
    return el("div", {
      className: "rounded-xl border-2 border-dashed border-outline-variant bg-surface-lowest p-8 text-center",
    }, [
      el("p", { className: "text-lg font-bold text-navy" }, ["Documento PDF"]),
      el("p", { className: "mt-2 text-sm text-on-surface-variant" }, [
        "Vista previa simulada del material.",
      ]),
    ]);
  }
  if (item.type === "image") {
    return el("div", {
      className:
        "flex aspect-[4/3] items-center justify-center rounded-xl bg-secondary-container text-primary-container",
    }, [
      el("p", { className: "font-semibold" }, ["Imagen · placeholder"]),
    ]);
  }
  if (item.type === "richtext") {
    return el("div", { className: "card-white whitespace-pre-wrap leading-relaxed" }, [
      item.body ?? item.description,
    ]);
  }
  return surfaceCard({
    children: [
      el("p", { className: "font-bold text-navy" }, ["Recurso STEAM"]),
      el("p", { className: "mt-2 text-sm text-on-surface-variant" }, [
        "Actividad externa simulada. En producción abriría un enlace o laboratorio.",
      ]),
      button({ variant: "secondary", label: "Abrir recurso (simulado)", className: "mt-4" }),
    ],
  });
}

export function renderContentViewer(
  root: HTMLElement,
  courseId: string,
  contentId: string,
): void {
  clear(root);
  const session = requireStudent();
  if (!session) return;

  const item = store.getState().data.contents.find((c) => c.id === contentId);
  const course = store.getState().data.courses.find((c) => c.id === courseId);

  if (!item || !course || item.courseId !== courseId) {
    navigate("#/app/inicio");
    return;
  }

  if (!store.isEnrolled(session.id, courseId)) {
    root.append(
      shell({
        role: "estudiante",
        activeHref: "#/app/catalogo",
        top: topBar({ title: "Acceso denegado", backHref: "#/app/catalogo" }),
        children: [
          emptyState({
            title: "No tienes acceso a este contenido",
            body: "Debes estar inscrito en el curso para ver el material.",
            actionLabel: "Ver curso e inscribirme",
            onAction: () => navigate(`#/app/curso/${courseId}`),
          }),
        ],
      }),
    );
    return;
  }

  const complete = button({
    variant: "primary",
    label: "Marcar como completado",
    className: "mt-6",
    onClick: () => {
      const result = store.completeContent(courseId, contentId);
      if (!result.ok) {
        showToast(result.error, "error");
        return;
      }
      showToast("Progreso actualizado.", "success");
      navigate(`#/app/aula/${courseId}`);
    },
  });

  root.append(
    shell({
      role: "estudiante",
      activeHref: "#/app/inicio",
      top: topBar({ title: contentTypeLabel(item.type), backHref: `#/app/aula/${courseId}` }),
      children: [
        el("h2", { className: "mb-2 text-xl font-bold text-navy" }, [item.title]),
        el("p", { className: "mb-4 text-on-surface-variant" }, [item.description]),
        viewerPlaceholder(item),
        complete,
      ],
    }),
  );
}

export function renderProgress(root: HTMLElement): void {
  clear(root);
  const session = requireStudent();
  if (!session) return;

  const { data } = store.getState();
  const enrolled = data.enrollments.filter((e) => e.userId === session.id);

  const children: HTMLElement[] = [
    pageTitle("Mi progreso", "Avance por curso inscrito."),
  ];

  if (enrolled.length === 0) {
    children.push(
      emptyState({
        title: "Sin progreso todavía",
        body: "Cuando te inscribas verás aquí tus barras de avance.",
        actionLabel: "Explorar catálogo",
        onAction: () => navigate("#/app/catalogo"),
      }),
    );
  } else {
    const list = el("div", { className: "flex flex-col gap-3" });
    for (const e of enrolled) {
      const course = data.courses.find((c) => c.id === e.courseId);
      if (!course) continue;
      const pct = store.courseProgress(session.id, course.id);
      list.append(
        el("div", { className: "card-white" }, [
          el("h3", { className: "font-bold text-navy" }, [course.title]),
          el("div", { className: "mt-3" }, [
            progressLabeled({
              label: "Completado",
              percent: pct,
              success: pct === 100,
            }),
          ]),
        ]),
      );
    }
    children.push(list);
  }

  root.append(shell({ role: "estudiante", activeHref: "#/app/progreso", children }));
}
