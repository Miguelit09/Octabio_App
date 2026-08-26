import "./styles/main.css";
import { authShell } from "./components/shell";
import { pageTitle } from "./components/ui";
import { clear, el } from "./lib/dom";
import { onNotFound, route, startRouter } from "./router";
import {
  renderChangePassword,
  renderForgot,
  renderForgotSent,
  renderLogin,
  renderNewPassword,
  renderProfile,
  renderRegister,
  renderRegisterSuccess,
  renderWelcome,
} from "./pages/auth";
import {
  renderAdminCategories,
  renderAdminContent,
  renderAdminCourseForm,
  renderAdminCourses,
  renderAdminDashboard,
  renderAdminReports,
  renderAdminUserForm,
  renderAdminUsers,
} from "./pages/admin";
import {
  renderCatalog,
  renderClassroom,
  renderContentViewer,
  renderCourseDetail,
  renderProgress,
  renderStudentHome,
} from "./pages/student";
import {
  renderGroupDetail,
  renderGroups,
  renderStudentFile,
  renderTeacherHome,
} from "./pages/teacher";
import { homeForRole, store } from "./state/store";
import type { Role } from "./state/types";

const appEl = document.querySelector<HTMLElement>("#app");
if (!appEl) {
  throw new Error("No se encontró #app");
}
const app: HTMLElement = appEl;

function render(fn: (root: HTMLElement) => void): void {
  fn(app);
}

function requireAuth(roles?: Role[]): boolean {
  const session = store.getSession();
  if (!session) {
    renderLogin(app);
    return false;
  }
  if (roles && !roles.includes(session.role)) {
    location.hash = homeForRole(session.role);
    return false;
  }
  return true;
}

route("/", () => render(renderWelcome));
route("/login", () => render(renderLogin));
route("/registro", () => render(renderRegister));
route("/registro/exito", () => render(renderRegisterSuccess));
route("/recuperar", () => render(renderForgot));
route("/recuperar/enviado", () => render(renderForgotSent));
route("/nueva-contrasena", () => render(renderNewPassword));

route("/perfil", () => {
  if (!requireAuth()) return;
  render(renderProfile);
});
route("/perfil/contrasena", () => {
  if (!requireAuth()) return;
  render(renderChangePassword);
});

route("/app/inicio", () => {
  if (!requireAuth(["estudiante"])) return;
  render(renderStudentHome);
});
route("/app/catalogo", (m) => {
  if (!requireAuth(["estudiante"])) return;
  renderCatalog(app, m.query);
});
route("/app/curso/:id", (m) => {
  if (!requireAuth(["estudiante"])) return;
  renderCourseDetail(app, m.params.id);
});
route("/app/aula/:id", (m) => {
  if (!requireAuth(["estudiante"])) return;
  renderClassroom(app, m.params.id);
});
route("/app/contenido/:courseId/:contentId", (m) => {
  if (!requireAuth(["estudiante"])) return;
  renderContentViewer(app, m.params.courseId, m.params.contentId);
});
route("/app/progreso", () => {
  if (!requireAuth(["estudiante"])) return;
  render(renderProgress);
});

route("/doc/inicio", () => {
  if (!requireAuth(["docente"])) return;
  render(renderTeacherHome);
});
route("/doc/grupos", () => {
  if (!requireAuth(["docente"])) return;
  render(renderGroups);
});
route("/doc/grupo/:id", (m) => {
  if (!requireAuth(["docente"])) return;
  renderGroupDetail(app, m.params.id);
});
route("/doc/estudiante/:id", (m) => {
  if (!requireAuth(["docente"])) return;
  renderStudentFile(app, m.params.id, m.query);
});

route("/admin", () => {
  if (!requireAuth(["admin"])) return;
  render(renderAdminDashboard);
});
route("/admin/cursos", () => {
  if (!requireAuth(["admin"])) return;
  render(renderAdminCourses);
});
route("/admin/cursos/nuevo", () => {
  if (!requireAuth(["admin"])) return;
  renderAdminCourseForm(app);
});
route("/admin/cursos/:id", (m) => {
  if (!requireAuth(["admin"])) return;
  renderAdminCourseForm(app, m.params.id);
});
route("/admin/contenido/:courseId", (m) => {
  if (!requireAuth(["admin"])) return;
  renderAdminContent(app, m.params.courseId);
});
route("/admin/usuarios", () => {
  if (!requireAuth(["admin"])) return;
  render(renderAdminUsers);
});
route("/admin/usuarios/nuevo", () => {
  if (!requireAuth(["admin"])) return;
  renderAdminUserForm(app);
});
route("/admin/usuarios/:id", (m) => {
  if (!requireAuth(["admin"])) return;
  renderAdminUserForm(app, m.params.id);
});
route("/admin/categorias", () => {
  if (!requireAuth(["admin"])) return;
  render(renderAdminCategories);
});
route("/admin/reportes", () => {
  if (!requireAuth(["admin"])) return;
  render(renderAdminReports);
});

onNotFound(() => {
  clear(app);
  const go = el("button", { type: "button", className: "btn-primary" }, ["Ir al inicio"]);
  go.addEventListener("click", () => {
    const session = store.getSession();
    location.hash = session ? homeForRole(session.role) : "#/";
  });
  app.append(authShell([pageTitle("Página no encontrada", "La ruta no existe en el prototipo."), go]));
});

store.subscribe(() => {
  // Re-render is handled by page actions; subscription keeps listeners ready for future use.
});

startRouter();
