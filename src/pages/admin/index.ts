import { shell, topBar } from "../../components/shell";
import { showToast } from "../../components/toast";
import { emptyState, field, pageTitle } from "../../components/ui";
import { clear, contentTypeLabel, el } from "../../lib/dom";
import { navigate } from "../../router";
import { store } from "../../state/store";
import type { ContentType, Role } from "../../state/types";

function requireAdmin() {
  const session = store.getSession();
  if (!session || session.role !== "admin") {
    if (!session) navigate("#/login");
    else if (session.role === "estudiante") navigate("#/app/inicio");
    else navigate("#/doc/inicio");
    return null;
  }
  return session;
}

export function renderAdminDashboard(root: HTMLElement): void {
  clear(root);
  if (!requireAdmin()) return;
  const { data } = store.getState();

  const stats = [
    { label: "Cursos", value: String(data.courses.length) },
    { label: "Usuarios", value: String(data.users.length) },
    { label: "Categorías", value: String(data.categories.length) },
    { label: "Inscripciones", value: String(data.enrollments.length) },
  ];

  const grid = el(
    "div",
    { className: "grid grid-cols-2 gap-3" },
    stats.map((s) =>
      el("div", { className: "card-surface" }, [
        el("p", { className: "label-caps" }, [s.label]),
        el("p", { className: "mt-2 text-3xl font-extrabold text-navy" }, [s.value]),
      ]),
    ),
  );

  const links = el("div", { className: "mt-6 flex flex-col gap-3" }, [
    linkBtn("Gestionar cursos", "#/admin/cursos"),
    linkBtn("Gestionar usuarios", "#/admin/usuarios"),
    linkBtn("Categorías STEAM", "#/admin/categorias"),
    linkBtn("Reportes", "#/admin/reportes"),
  ]);

  root.append(
    shell({
      role: "admin",
      activeHref: "#/admin",
      children: [pageTitle("Panel admin", "Gestión de la plataforma Octabio."), grid, links],
    }),
  );
}

function linkBtn(label: string, href: string): HTMLElement {
  const btn = el("button", { type: "button", className: "btn-secondary" }, [label]);
  btn.addEventListener("click", () => navigate(href));
  return btn;
}

export function renderAdminCourses(root: HTMLElement): void {
  clear(root);
  if (!requireAdmin()) return;
  const courses = store.getState().data.courses;

  const create = el("button", { type: "button", className: "btn-primary mb-4" }, [
    "Crear curso",
  ]);
  create.addEventListener("click", () => navigate("#/admin/cursos/nuevo"));

  const children: HTMLElement[] = [pageTitle("Lista de cursos"), create];

  if (courses.length === 0) {
    children.push(
      emptyState({
        title: "No hay cursos",
        body: "Crea el primer curso para poblar el catálogo.",
        actionLabel: "Crear curso",
        onAction: () => navigate("#/admin/cursos/nuevo"),
      }),
    );
  } else {
    const list = el("div", { className: "flex flex-col gap-3" });
    for (const c of courses) {
      const cat = store.getState().data.categories.find((x) => x.id === c.categoryId);
      const row = el("div", { className: "card-white" }, [
        el("div", { className: "flex items-start justify-between gap-2" }, [
          el("div", {}, [
            el("h3", { className: "font-bold text-navy" }, [c.title]),
            el("p", { className: "text-sm text-on-surface-variant" }, [
              `${cat?.name ?? "STEAM"} · ${c.active ? "Activo" : "Inactivo"}`,
            ]),
          ]),
        ]),
        el("div", { className: "mt-3 flex flex-wrap gap-2" }, [
          actionChip("Editar", () => navigate(`#/admin/cursos/${c.id}`)),
          actionChip("Contenido", () => navigate(`#/admin/contenido/${c.id}`)),
          actionChip("Eliminar", () => {
            store.deleteCourse(c.id);
            showToast("Curso eliminado.", "success");
            renderAdminCourses(root);
          }, true),
        ]),
      ]);
      list.append(row);
    }
    children.push(list);
  }

  root.append(shell({ role: "admin", activeHref: "#/admin/cursos", children }));
}

function actionChip(label: string, onClick: () => void, danger = false): HTMLElement {
  const btn = el("button", {
    type: "button",
    className: `rounded-lg border px-3 py-1.5 text-sm font-semibold ${
      danger
        ? "border-error text-error"
        : "border-primary-container text-primary-container"
    }`,
  }, [label]);
  btn.addEventListener("click", onClick);
  return btn;
}

export function renderAdminCourseForm(root: HTMLElement, courseId?: string): void {
  clear(root);
  if (!requireAdmin()) return;

  const { data } = store.getState();
  const existing = courseId ? data.courses.find((c) => c.id === courseId) : undefined;
  const teachers = data.users.filter((u) => u.role === "docente" && u.active);

  const form = el("form", { className: "flex flex-col gap-4" });
  form.append(
    field({ id: "title", label: "Título", value: existing?.title ?? "" }),
    field({
      id: "description",
      label: "Descripción",
      value: existing?.description ?? "",
    }),
    field({
      id: "coverLabel",
      label: "Etiqueta de portada",
      value: existing?.coverLabel ?? "",
    }),
  );

  const catSelect = el("select", {
    id: "categoryId",
    className: "field-input",
  }) as HTMLSelectElement;
  for (const c of data.categories) {
    const opt = el("option", { value: c.id }, [c.name]) as HTMLOptionElement;
    if (existing?.categoryId === c.id) opt.selected = true;
    catSelect.append(opt);
  }

  const teacherSelect = el("select", {
    id: "teacherId",
    className: "field-input",
  }) as HTMLSelectElement;
  for (const t of teachers) {
    const opt = el("option", { value: t.id }, [t.name]) as HTMLOptionElement;
    if (existing?.teacherId === t.id) opt.selected = true;
    teacherSelect.append(opt);
  }

  const activeInput = el("input", {
    type: "checkbox",
    id: "active",
  }) as HTMLInputElement;
  activeInput.checked = existing?.active !== false;
  const active = el("label", {
    className: "flex items-center gap-2 text-sm font-medium",
  }, [activeInput, "Curso activo en catálogo"]);

  form.append(
    el("div", {}, [
      el("label", { className: "label-caps mb-2 block", for: "categoryId" }, ["Categoría"]),
      catSelect,
    ]),
    el("div", {}, [
      el("label", { className: "label-caps mb-2 block", for: "teacherId" }, ["Docente"]),
      teacherSelect,
    ]),
    active,
  );

  const submit = el("button", { type: "submit", className: "btn-primary" }, [
    existing ? "Guardar cambios" : "Crear curso",
  ]);
  form.append(submit);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = (form.querySelector("#title") as HTMLInputElement).value.trim();
    const description = (form.querySelector("#description") as HTMLInputElement).value.trim();
    const coverLabel = (form.querySelector("#coverLabel") as HTMLInputElement).value.trim();
    if (!title || !description) {
      showToast("Título y descripción son obligatorios.", "error");
      return;
    }
    store.saveCourse({
      id: existing?.id,
      title,
      description,
      coverLabel: coverLabel || title.slice(0, 12),
      categoryId: catSelect.value,
      teacherId: teacherSelect.value || teachers[0]?.id || "u-doc",
      active: (form.querySelector("#active") as HTMLInputElement).checked,
    });
    showToast(existing ? "Curso actualizado." : "Curso creado.", "success");
    navigate("#/admin/cursos");
  });

  root.append(
    shell({
      role: "admin",
      activeHref: "#/admin/cursos",
      top: topBar({
        title: existing ? "Editar curso" : "Crear curso",
        backHref: "#/admin/cursos",
      }),
      children: [form],
    }),
  );
}

export function renderAdminContent(root: HTMLElement, courseId: string): void {
  clear(root);
  if (!requireAdmin()) return;

  const course = store.getState().data.courses.find((c) => c.id === courseId);
  if (!course) {
    navigate("#/admin/cursos");
    return;
  }

  const contents = store
    .getState()
    .data.contents.filter((c) => c.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  const form = el("form", { className: "card-surface mb-4 flex flex-col gap-3" });
  form.append(
    el("p", { className: "font-bold text-navy" }, ["Agregar contenido"]),
    field({ id: "title", label: "Título" }),
    field({ id: "description", label: "Descripción" }),
  );
  const typeSelect = el("select", { id: "type", className: "field-input" }) as HTMLSelectElement;
  for (const t of ["video", "pdf", "image", "richtext", "steam"] as ContentType[]) {
    typeSelect.append(el("option", { value: t }, [contentTypeLabel(t)]));
  }
  form.append(
    el("div", {}, [
      el("label", { className: "label-caps mb-2 block", for: "type" }, ["Tipo"]),
      typeSelect,
    ]),
  );
  const addBtn = el("button", { type: "submit", className: "btn-primary" }, ["Agregar"]);
  form.append(addBtn);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = (form.querySelector("#title") as HTMLInputElement).value.trim();
    const description = (form.querySelector("#description") as HTMLInputElement).value.trim();
    if (!title) {
      showToast("El título es obligatorio.", "error");
      return;
    }
    store.addContent({
      courseId,
      title,
      description: description || "Sin descripción",
      type: typeSelect.value as ContentType,
    });
    showToast("Contenido agregado.", "success");
    renderAdminContent(root, courseId);
  });

  const list = el("div", { className: "flex flex-col gap-3" });
  for (const item of contents) {
    list.append(
      el("div", { className: "card-white flex items-start justify-between gap-3" }, [
        el("div", {}, [
          el("p", { className: "label-caps" }, [contentTypeLabel(item.type)]),
          el("h3", { className: "font-bold text-navy" }, [item.title]),
        ]),
        actionChip("Quitar", () => {
          store.removeContent(item.id);
          showToast("Contenido eliminado.", "info");
          renderAdminContent(root, courseId);
        }, true),
      ]),
    );
  }

  root.append(
    shell({
      role: "admin",
      activeHref: "#/admin/cursos",
      top: topBar({ title: "Contenido del curso", backHref: "#/admin/cursos" }),
      children: [
        pageTitle(course.title, "Gestionar materiales"),
        form,
        contents.length === 0
          ? emptyState({
              title: "Aula vacía",
              body: "Agrega el primer contenido con el formulario de arriba.",
            })
          : list,
      ],
    }),
  );
}

export function renderAdminUsers(root: HTMLElement): void {
  clear(root);
  if (!requireAdmin()) return;
  const users = store.getState().data.users;

  const create = el("button", { type: "button", className: "btn-primary mb-4" }, [
    "Crear usuario",
  ]);
  create.addEventListener("click", () => navigate("#/admin/usuarios/nuevo"));

  const list = el("div", { className: "flex flex-col gap-3" });
  for (const u of users) {
    list.append(
      el("div", { className: "card-white" }, [
        el("h3", { className: "font-bold text-navy" }, [u.name]),
        el("p", { className: "text-sm text-on-surface-variant" }, [
          `${u.email} · ${u.role} · ${u.active ? "Activo" : "Inactivo"}`,
        ]),
        el("div", { className: "mt-3 flex flex-wrap gap-2" }, [
          actionChip("Editar", () => navigate(`#/admin/usuarios/${u.id}`)),
          actionChip(u.active ? "Desactivar" : "Activar", () => {
            store.saveUser({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              active: !u.active,
            });
            showToast(u.active ? "Usuario desactivado." : "Usuario activado.", "success");
            renderAdminUsers(root);
          }),
          actionChip("Eliminar", () => {
            store.deleteUser(u.id);
            showToast("Usuario eliminado.", "info");
            renderAdminUsers(root);
          }, true),
        ]),
      ]),
    );
  }

  root.append(
    shell({
      role: "admin",
      activeHref: "#/admin/usuarios",
      children: [pageTitle("Lista de usuarios"), create, list],
    }),
  );
}

export function renderAdminUserForm(root: HTMLElement, userId?: string): void {
  clear(root);
  if (!requireAdmin()) return;

  const existing =
    userId && userId !== "nuevo"
      ? store.getState().data.users.find((u) => u.id === userId)
      : undefined;

  const form = el("form", { className: "flex flex-col gap-4" });
  form.append(
    field({ id: "name", label: "Nombre", value: existing?.name ?? "" }),
    field({ id: "email", label: "Correo", type: "email", value: existing?.email ?? "" }),
  );

  if (!existing) {
    form.append(field({ id: "password", label: "Contraseña inicial", type: "password", value: "octabio" }));
  }

  const roleSelect = el("select", { id: "role", className: "field-input" }) as HTMLSelectElement;
  for (const r of ["estudiante", "docente", "admin"] as Role[]) {
    const opt = el("option", { value: r }, [r]) as HTMLOptionElement;
    if ((existing?.role ?? "estudiante") === r) opt.selected = true;
    roleSelect.append(opt);
  }
  form.append(
    el("div", {}, [
      el("label", { className: "label-caps mb-2 block", for: "role" }, ["Rol"]),
      roleSelect,
    ]),
    el("label", { className: "flex items-center gap-2 text-sm font-medium" }, [
      (() => {
        const input = el("input", {
          type: "checkbox",
          id: "active",
        }) as HTMLInputElement;
        input.checked = existing?.active !== false;
        return input;
      })(),
      "Cuenta activa",
    ]),
  );

  const submit = el("button", { type: "submit", className: "btn-primary" }, [
    existing ? "Guardar" : "Crear usuario",
  ]);
  form.append(submit);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
    const email = (form.querySelector("#email") as HTMLInputElement).value.trim();
    const password = (form.querySelector("#password") as HTMLInputElement | null)?.value;
    const result = store.saveUser({
      id: existing?.id,
      name,
      email,
      role: roleSelect.value as Role,
      active: (form.querySelector("#active") as HTMLInputElement).checked,
      password: password || undefined,
    });
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    showToast(existing ? "Usuario actualizado." : "Usuario creado.", "success");
    navigate("#/admin/usuarios");
  });

  root.append(
    shell({
      role: "admin",
      activeHref: "#/admin/usuarios",
      top: topBar({
        title: existing ? "Editar usuario" : "Crear usuario",
        backHref: "#/admin/usuarios",
      }),
      children: [form],
    }),
  );
}

export function renderAdminCategories(root: HTMLElement): void {
  clear(root);
  if (!requireAdmin()) return;

  const cats = store.getState().data.categories;
  const form = el("form", { className: "card-surface mb-4 flex flex-col gap-3" });
  form.append(
    el("p", { className: "font-bold text-navy" }, ["Nueva categoría"]),
    field({ id: "name", label: "Nombre" }),
    field({ id: "description", label: "Descripción" }),
  );
  const add = el("button", { type: "submit", className: "btn-primary" }, ["Agregar"]);
  form.append(add);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
    const description = (form.querySelector("#description") as HTMLInputElement).value.trim();
    if (!name) {
      showToast("El nombre es obligatorio.", "error");
      return;
    }
    store.saveCategory({ name, description: description || "Sin descripción" });
    showToast("Categoría creada.", "success");
    renderAdminCategories(root);
  });

  const list = el("div", { className: "flex flex-col gap-3" });
  for (const c of cats) {
    list.append(
      el("div", { className: "card-white" }, [
        el("h3", { className: "font-bold text-navy" }, [c.name]),
        el("p", { className: "text-sm text-on-surface-variant" }, [c.description]),
        el("div", { className: "mt-3" }, [
          actionChip("Eliminar", () => {
            store.deleteCategory(c.id);
            showToast("Categoría eliminada.", "info");
            renderAdminCategories(root);
          }, true),
        ]),
      ]),
    );
  }

  root.append(
    shell({
      role: "admin",
      activeHref: "#/admin/categorias",
      children: [pageTitle("Categorías"), form, list],
    }),
  );
}

export function renderAdminReports(root: HTMLElement): void {
  clear(root);
  if (!requireAdmin()) return;
  const { data } = store.getState();

  const courseRows = data.courses.map((c) => {
    const enrollCount = data.enrollments.filter((e) => e.courseId === c.id).length;
    return el("div", { className: "card-white" }, [
      el("h3", { className: "font-bold text-navy" }, [c.title]),
      el("p", { className: "text-sm text-on-surface-variant" }, [
        `${enrollCount} inscripciones · ${c.active ? "Activo" : "Inactivo"}`,
      ]),
    ]);
  });

  const exportCsv = el("button", { type: "button", className: "btn-primary" }, [
    "Exportar CSV (simulado)",
  ]);
  exportCsv.addEventListener("click", () =>
    showToast("Exportación CSV simulada.", "success"),
  );
  const exportPdf = el("button", { type: "button", className: "btn-secondary" }, [
    "Exportar PDF (simulado)",
  ]);
  exportPdf.addEventListener("click", () =>
    showToast("Exportación PDF simulada.", "success"),
  );

  root.append(
    shell({
      role: "admin",
      activeHref: "#/admin/reportes",
      children: [
        pageTitle("Reportes", "Vista previa de cursos e inscripciones."),
        el("div", { className: "mb-4 flex flex-col gap-3" }, [exportCsv, exportPdf]),
        el("p", { className: "label-caps mb-2" }, ["Preview cursos"]),
        el("div", { className: "flex flex-col gap-3" }, courseRows),
      ],
    }),
  );
}
