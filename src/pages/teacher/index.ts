import { listRow } from "../../components/cards";
import { groupCard } from "../../components/domain/group-card";
import { progressBar, progressLabeled } from "../../components/progress";
import { shell, topBar } from "../../components/shell";
import { emptyState, pageTitle } from "../../components/ui";
import { clear, el } from "../../lib/dom";
import { navigate } from "../../router";
import { store } from "../../state/store";

function requireTeacher() {
  const session = store.getSession();
  if (!session || session.role !== "docente") {
    if (!session) navigate("#/login");
    else if (session.role === "estudiante") navigate("#/app/inicio");
    else navigate("#/admin");
    return null;
  }
  return session;
}

export function renderTeacherHome(root: HTMLElement): void {
  clear(root);
  const session = requireTeacher();
  if (!session) return;

  const groups = store.getState().data.groups.filter((g) => g.teacherId === session.id);
  const children: HTMLElement[] = [
    pageTitle(`Hola, ${session.name.split(" ")[0]}`, "Resumen de tus grupos."),
  ];

  if (groups.length === 0) {
    children.push(
      emptyState({
        title: "Sin grupos asignados",
        body: "Cuando un administrador te asigne grupos aparecerán aquí.",
      }),
    );
  } else {
    const list = el("div", { className: "flex flex-col gap-3" });
    for (const g of groups) {
      const course = store.getState().data.courses.find((c) => c.id === g.courseId);
      list.append(
        groupCard({
          group: g,
          courseTitle: course?.title,
          featured: true,
          onClick: () => navigate(`#/doc/grupo/${g.id}`),
        }),
      );
    }
    children.push(list);
  }

  root.append(shell({ role: "docente", activeHref: "#/doc/inicio", children }));
}

export function renderGroups(root: HTMLElement): void {
  clear(root);
  const session = requireTeacher();
  if (!session) return;

  const groups = store.getState().data.groups.filter((g) => g.teacherId === session.id);
  const children: HTMLElement[] = [pageTitle("Mis grupos", "Cursos y cohortes a tu cargo.")];

  if (groups.length === 0) {
    children.push(
      emptyState({
        title: "No hay grupos",
        body: "Aún no tienes grupos asignados en este demo.",
      }),
    );
  } else {
    const list = el("div", { className: "flex flex-col gap-3" });
    for (const g of groups) {
      const course = store.getState().data.courses.find((c) => c.id === g.courseId);
      list.append(
        groupCard({
          group: g,
          courseTitle: course?.title,
          onClick: () => navigate(`#/doc/grupo/${g.id}`),
        }),
      );
    }
    children.push(list);
  }

  root.append(shell({ role: "docente", activeHref: "#/doc/grupos", children }));
}

export function renderGroupDetail(root: HTMLElement, groupId: string): void {
  clear(root);
  const session = requireTeacher();
  if (!session) return;

  const group = store.getState().data.groups.find((g) => g.id === groupId);
  if (!group || group.teacherId !== session.id) {
    navigate("#/doc/grupos");
    return;
  }

  const course = store.getState().data.courses.find((c) => c.id === group.courseId);
  const list = el("div", { className: "flex flex-col gap-3" });

  for (const studentId of group.studentIds) {
    const student = store.getState().data.users.find((u) => u.id === studentId);
    if (!student) continue;
    const pct = store.courseProgress(studentId, group.courseId);
    const row = listRow({
      title: student.name,
      subtitle: student.email,
      trailing: el("span", { className: "text-sm font-bold text-primary-container" }, [
        `${pct}%`,
      ]),
      onClick: () => navigate(`#/doc/estudiante/${studentId}?grupo=${groupId}`),
    });
    row.append(el("div", { className: "mt-3" }, [progressBar(pct)]));
    list.append(row);
  }

  root.append(
    shell({
      role: "docente",
      activeHref: "#/doc/grupos",
      top: topBar({ title: "Detalle de grupo", backHref: "#/doc/grupos" }),
      children: [
        pageTitle(group.name, course?.title ?? "Curso"),
        list,
      ],
    }),
  );
}

export function renderStudentFile(
  root: HTMLElement,
  studentId: string,
  query: Record<string, string>,
): void {
  clear(root);
  const session = requireTeacher();
  if (!session) return;

  const student = store.getState().data.users.find((u) => u.id === studentId);
  if (!student) {
    navigate("#/doc/grupos");
    return;
  }

  const back = query.grupo ? `#/doc/grupo/${query.grupo}` : "#/doc/grupos";
  const enrollments = store.getState().data.enrollments.filter((e) => e.userId === studentId);

  const children: HTMLElement[] = [
    pageTitle(student.name, student.email),
    el("p", { className: "label-caps mb-2" }, ["Actividad"]),
  ];

  if (enrollments.length === 0) {
    children.push(
      emptyState({
        title: "Sin actividad",
        body: "Este estudiante aún no tiene inscripciones con progreso.",
      }),
    );
  } else {
    const list = el("div", { className: "flex flex-col gap-3" });
    for (const e of enrollments) {
      const course = store.getState().data.courses.find((c) => c.id === e.courseId);
      if (!course) continue;
      const pct = store.courseProgress(studentId, course.id);
      list.append(
        el("div", { className: "card-white" }, [
          el("h3", { className: "font-bold text-navy" }, [course.title]),
          el("p", { className: "mt-1 text-sm text-on-surface-variant" }, [
            `${e.completedContentIds.length} contenidos completados`,
          ]),
          el("div", { className: "mt-3" }, [
            progressLabeled({ label: "Progreso", percent: pct, success: pct === 100 }),
          ]),
        ]),
      );
    }
    children.push(list);
  }

  root.append(
    shell({
      role: "docente",
      activeHref: "#/doc/grupos",
      top: topBar({ title: "Ficha de estudiante", backHref: back }),
      children,
    }),
  );
}
