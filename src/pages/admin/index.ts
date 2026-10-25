import { actionChip, button } from "../../components/buttons";
import { listRow } from "../../components/cards";
import { checkboxField, field, selectField } from "../../components/forms";
import { shell, topBar } from "../../components/shell";
import { showToast } from "../../components/toast";
import { emptyState, pageTitle } from "../../components/ui";
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
    button({
      variant: "secondary",
      label: "Gestionar cursos",
      onClick: () => navigate("#/admin/cursos"),
    }),
    button({
      variant: "secondary",
      label: "Gestionar usuarios",
      onClick: () => navigate("#/admin/usuarios"),
    }),
    button({
      variant: "secondary",
      label: "Categorías STEAM",
      onClick: () => navigate("#/admin/categorias"),
    }),
    button({
      variant: "secondary",
      label: "Reportes",
      onClick: () => navigate("#/admin/reportes"),
    }),
  ]);

  root.append(
    shell({
      role: "admin",
      activeHref: "#/admin",
      children: [pageTitle("Panel admin", "Gestión de la plataforma Octabio."), grid, links],
    }),
  );
}

export function renderAdminCourses(root: HTMLElement): void {
  clear(root);
  if (!requireAdmin()) return;
  const courses = store.getState().data.courses;

  const create = button({
    variant: "primary",
    label: "Crear curso",
    className: "mb-4",
    onClick: () => navigate("#/admin/cursos/nuevo"),
  });

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
      list.append(
        listRow({
          title: c.title,
          subtitle: `${cat?.name ?? "STEAM"} · ${c.active ? "Activo" : "Inactivo"}`,
          actions: [
            actionChip({ label: "Editar", onClick: () => navigate(`#/admin/cursos/${c.id}`) }),
            actionChip({
              label: "Contenido",
              onClick: () => navigate(`#/admin/contenido/${c.id}`),
            }),
            actionChip({
              label: "Eliminar",
              danger: true,
              onClick: () => {
                store.deleteCourse(c.id);
                showToast("Curso eliminado.", "success");
                renderAdminCourses(root);
              },
            }),
          ],
        }),
      );
    }
    children.push(list);
  }

  root.append(shell({ role: "admin", activeHref: "#/admin/cursos", children }));
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
    selectField({
      id: "categoryId",
      label: "Categoría",
      value: existing?.categoryId,
      options: data.categories.map((c) => ({ value: c.id, label: c.name })),
    }),
    selectField({
      id: "teacherId",
      label: "Docente",
      value: existing?.teacherId,
      options: teachers.map((t) => ({ value: t.id, label: t.name })),
    }),
    checkboxField({
      id: "active",
      label: "Curso activo en catálogo",
      checked: existing?.active !== false,
    }),
    button({
      variant: "primary",
      type: "submit",
      label: existing ? "Guardar cambios" : "Crear curso",
    }),
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = (form.querySelector("#title") as HTMLInputElement).value.trim();
    const description = (form.querySelector("#description") as HTMLInputElement).value.trim();
    const coverLabel = (form.querySelector("#coverLabel") as HTMLInputElement).value.trim();
    const categoryId = (form.querySelector("#categoryId") as HTMLSelectElement).value;
    const teacherId = (form.querySelector("#teacherId") as HTMLSelectElement).value;
    if (!title || !description) {
      showToast("Título y descripción son obligatorios.", "error");
      return;
    }
    store.saveCourse({
      id: existing?.id,
      title,
      description,
      coverLabel: coverLabel || title.slice(0, 12),
      categoryId,
      teacherId: teacherId || teachers[0]?.id || "u-doc",
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

  const typeOptions = (["video", "pdf", "image", "richtext", "steam"] as ContentType[]).map(
    (t) => ({ value: t, label: contentTypeLabel(t) }),
  );

  const form = el("form", { className: "card-surface mb-4 flex flex-col gap-3" });
  form.append(
    el("p", { className: "font-bold text-navy" }, ["Agregar contenido"]),
    field({ id: "title", label: "Título" }),
    field({ id: "description", label: "Descripción" }),
    selectField({ id: "type", label: "Tipo", options: typeOptions }),
    button({ variant: "primary", type: "submit", label: "Agregar" }),
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = (form.querySelector("#title") as HTMLInputElement).value.trim();
    const description = (form.querySelector("#description") as HTMLInputElement).value.trim();
    const type = (form.querySelector("#type") as HTMLSelectElement).value as ContentType;
    if (!title) {
      showToast("El título es obligatorio.", "error");
      return;
    }
    store.addContent({
      courseId,
      title,
      description: description || "Sin descripción",
      type,
    });
    showToast("Contenido agregado.", "success");
    renderAdminContent(root, courseId);
  });

  const list = el("div", { className: "flex flex-col gap-3" });
  for (const item of contents) {
    list.append(
      listRow({
        eyebrow: contentTypeLabel(item.type),
        title: item.title,
        trailing: actionChip({
          label: "Quitar",
          danger: true,
          onClick: () => {
            store.removeContent(item.id);
            showToast("Contenido eliminado.", "info");
            renderAdminContent(root, courseId);
          },
        }),
      }),
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

  const create = button({
    variant: "primary",
    label: "Crear usuario",
    className: "mb-4",
    onClick: () => navigate("#/admin/usuarios/nuevo"),
  });

  const list = el("div", { className: "flex flex-col gap-3" });
  for (const u of users) {
    list.append(
      listRow({
        title: u.name,
        subtitle: `${u.email} · ${u.role} · ${u.active ? "Activo" : "Inactivo"}`,
        actions: [
          actionChip({ label: "Editar", onClick: () => navigate(`#/admin/usuarios/${u.id}`) }),
          actionChip({
            label: u.active ? "Desactivar" : "Activar",
            onClick: () => {
              store.saveUser({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                active: !u.active,
              });
              showToast(u.active ? "Usuario desactivado." : "Usuario activado.", "success");
              renderAdminUsers(root);
            },
          }),
          actionChip({
            label: "Eliminar",
            danger: true,
            onClick: () => {
              store.deleteUser(u.id);
              showToast("Usuario eliminado.", "info");
              renderAdminUsers(root);
            },
          }),
        ],
      }),
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
    form.append(
      field({ id: "password", label: "Contraseña inicial", type: "password", value: "octabio" }),
    );
  }

  form.append(
    selectField({
      id: "role",
      label: "Rol",
      value: existing?.role ?? "estudiante",
      options: (["estudiante", "docente", "admin"] as Role[]).map((r) => ({
        value: r,
        label: r,
      })),
    }),
    checkboxField({
      id: "active",
      label: "Cuenta activa",
      checked: existing?.active !== false,
    }),
    button({
      variant: "primary",
      type: "submit",
      label: existing ? "Guardar" : "Crear usuario",
    }),
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
    const email = (form.querySelector("#email") as HTMLInputElement).value.trim();
    const password = (form.querySelector("#password") as HTMLInputElement | null)?.value;
    const role = (form.querySelector("#role") as HTMLSelectElement).value as Role;
    const result = store.saveUser({
      id: existing?.id,
      name,
      email,
      role,
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
    button({ variant: "primary", type: "submit", label: "Agregar" }),
  );
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
      listRow({
        title: c.name,
        subtitle: c.description,
        actions: actionChip({
          label: "Eliminar",
          danger: true,
          onClick: () => {
            store.deleteCategory(c.id);
            showToast("Categoría eliminada.", "info");
            renderAdminCategories(root);
          },
        }),
      }),
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
    return listRow({
      title: c.title,
      subtitle: `${enrollCount} inscripciones · ${c.active ? "Activo" : "Inactivo"}`,
    });
  });

  const exportCsv = button({
    variant: "primary",
    label: "Exportar CSV (simulado)",
    onClick: () => showToast("Exportación CSV simulada.", "success"),
  });
  const exportPdf = button({
    variant: "secondary",
    label: "Exportar PDF (simulado)",
    onClick: () => showToast("Exportación PDF simulada.", "success"),
  });

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
