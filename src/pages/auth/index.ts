import { button } from "../../components/buttons";
import { demoHint } from "../../components/demo-hint";
import { checkboxField, field } from "../../components/forms";
import { authShell, shell } from "../../components/shell";
import { showToast } from "../../components/toast";
import { pageTitle } from "../../components/ui";
import { clear, el } from "../../lib/dom";
import { navigate } from "../../router";
import { homeForRole, store } from "../../state/store";

export function renderWelcome(root: HTMLElement): void {
  clear(root);
  const login = button({
    variant: "primary",
    label: "Iniciar sesión",
    onClick: () => navigate("#/login"),
  });
  const register = button({
    variant: "secondary",
    label: "Crear cuenta",
    onClick: () => navigate("#/registro"),
  });

  root.append(
    authShell([
      el("div", { className: "flex min-h-[70dvh] flex-col justify-center gap-6" }, [
        el("div", { className: "space-y-3" }, [
          el("p", { className: "label-caps text-primary-container" }, ["Plataforma STEAM"]),
          el("h1", { className: "text-4xl font-extrabold tracking-tight text-navy" }, ["Octabio"]),
          el("p", { className: "text-lg text-on-surface-variant" }, [
            "Aprende ciencia, tecnología, ingeniería, arte y matemáticas con ritmos claros y progreso visible.",
          ]),
        ]),
        el("div", { className: "flex flex-col gap-3" }, [login, register]),
        demoHint(),
      ]),
    ]),
  );
}

export function renderLogin(root: HTMLElement, opts?: { error?: string }): void {
  clear(root);

  const form = el("form", { className: "flex flex-col gap-4", novalidate: true });
  form.append(
    field({ id: "email", label: "Correo", type: "email", placeholder: "tu@correo.com" }),
    field({
      id: "password",
      label: "Contraseña",
      type: "password",
      placeholder: "••••••••",
      error: opts?.error,
    }),
  );
  const submit = button({ variant: "primary", type: "submit", label: "Entrar" });
  const forgot = button({
    variant: "ghost",
    label: "¿Olvidaste tu contraseña?",
    className: "self-start px-0",
    onClick: () => navigate("#/recuperar"),
  });
  const toRegister = button({
    variant: "ghost",
    label: "Crear cuenta de estudiante",
    className: "self-center",
    onClick: () => navigate("#/registro"),
  });

  form.append(forgot, submit, toRegister);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (form.querySelector("#email") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement).value;
    const result = store.login(email, password);
    if (!result.ok) {
      renderLogin(root, { error: result.error });
      return;
    }
    navigate(homeForRole(result.user.role));
  });

  root.append(
    authShell([
      pageTitle("Iniciar sesión", "Accede a tu panel según tu rol."),
      form,
      demoHint(),
    ]),
  );
}

export function renderRegister(root: HTMLElement, opts?: { error?: string }): void {
  clear(root);
  const form = el("form", { className: "flex flex-col gap-4", novalidate: true });
  form.append(
    field({ id: "name", label: "Nombre completo", placeholder: "Valentina Gómez" }),
    field({
      id: "email",
      label: "Correo",
      type: "email",
      placeholder: "tu@correo.com",
      error: opts?.error,
    }),
    field({ id: "password", label: "Contraseña", type: "password" }),
    field({ id: "confirm", label: "Confirmar contraseña", type: "password" }),
    checkboxField({ id: "terms", label: "Acepto los términos y condiciones de Octabio." }),
  );
  const submit = button({ variant: "primary", type: "submit", label: "Crear cuenta" });
  const toLogin = button({
    variant: "ghost",
    label: "Ya tengo cuenta",
    className: "self-center",
    onClick: () => navigate("#/login"),
  });

  form.append(submit, toLogin);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
    const email = (form.querySelector("#email") as HTMLInputElement).value.trim();
    const password = (form.querySelector("#password") as HTMLInputElement).value;
    const confirm = (form.querySelector("#confirm") as HTMLInputElement).value;
    const terms = (form.querySelector("#terms") as HTMLInputElement).checked;

    if (!name || !email || !password || !confirm) {
      showToast("Completa todos los campos.", "error");
      return;
    }
    if (!terms) {
      showToast("Debes aceptar los términos.", "error");
      return;
    }
    if (password !== confirm) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }
    const result = store.register({ name, email, password });
    if (!result.ok) {
      renderRegister(root, { error: result.error });
      return;
    }
    navigate("#/registro/exito");
  });

  root.append(
    authShell([
      pageTitle("Crear cuenta", "El registro público es solo para estudiantes."),
      form,
    ]),
  );
}

export function renderRegisterSuccess(root: HTMLElement): void {
  clear(root);
  const go = button({
    variant: "primary",
    label: "Ir a iniciar sesión",
    onClick: () => navigate("#/login"),
  });
  root.append(
    authShell([
      pageTitle("Revisa tu correo", "Enviamos una confirmación simulada. Ya puedes iniciar sesión."),
      el("div", { className: "card-surface mb-4" }, [
        "En este prototipo no hay correo real: tu cuenta ya está lista en el dispositivo.",
      ]),
      go,
    ]),
  );
}

export function renderForgot(root: HTMLElement): void {
  clear(root);
  const form = el("form", { className: "flex flex-col gap-4" });
  form.append(field({ id: "email", label: "Correo", type: "email", placeholder: "tu@correo.com" }));
  const submit = button({ variant: "primary", type: "submit", label: "Enviar enlace" });
  form.append(submit);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    navigate("#/recuperar/enviado");
  });
  form.append(
    button({
      variant: "ghost",
      label: "Volver al login",
      className: "self-center",
      onClick: () => navigate("#/login"),
    }),
  );

  root.append(
    authShell([
      pageTitle("Recuperar contraseña", "Te enviaremos un enlace temporal (simulado)."),
      form,
    ]),
  );
}

export function renderForgotSent(root: HTMLElement): void {
  clear(root);
  const go = button({
    variant: "primary",
    label: "Volver al login",
    onClick: () => navigate("#/login"),
  });
  const fake = button({
    variant: "secondary",
    label: "Simular abrir enlace",
    onClick: () => navigate("#/nueva-contrasena"),
  });

  root.append(
    authShell([
      pageTitle(
        "Revisa tu bandeja",
        "Si el correo está registrado, enviamos un enlace. Por privacidad no confirmamos si existe.",
      ),
      el("div", { className: "flex flex-col gap-3" }, [fake, go]),
    ]),
  );
}

export function renderNewPassword(root: HTMLElement): void {
  clear(root);
  const form = el("form", { className: "flex flex-col gap-4" });
  form.append(
    field({ id: "password", label: "Nueva contraseña", type: "password" }),
    field({ id: "confirm", label: "Confirmar contraseña", type: "password" }),
  );
  const submit = button({ variant: "primary", type: "submit", label: "Guardar contraseña" });
  form.append(submit);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const password = (form.querySelector("#password") as HTMLInputElement).value;
    const confirm = (form.querySelector("#confirm") as HTMLInputElement).value;
    if (!password || password !== confirm) {
      showToast("Las contraseñas deben coincidir.", "error");
      return;
    }
    showToast("Contraseña actualizada (simulado).", "success");
    navigate("#/login");
  });

  root.append(
    authShell([
      pageTitle("Nueva contraseña", "Define una clave nueva para tu cuenta."),
      form,
    ]),
  );
}

export function renderProfile(root: HTMLElement): void {
  clear(root);
  const session = store.getSession();
  if (!session) {
    navigate("#/login");
    return;
  }

  const form = el("form", { className: "flex flex-col gap-4" });
  form.append(
    field({ id: "name", label: "Nombre", value: session.name }),
    field({
      id: "email",
      label: "Correo",
      value: session.email,
      readonly: true,
      hint: "El correo no se puede editar desde el perfil.",
    }),
  );
  const save = button({ variant: "primary", type: "submit", label: "Guardar cambios" });
  form.append(save);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (form.querySelector("#name") as HTMLInputElement).value;
    const result = store.updateProfile(name);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    showToast("Cambios guardados.", "success");
    renderProfile(root);
  });

  const changePass = button({
    variant: "secondary",
    label: "Cambiar contraseña",
    onClick: () => navigate("#/perfil/contrasena"),
  });

  const reset = button({
    variant: "danger",
    label: "Restablecer demo",
    onClick: () => {
      store.resetDemo();
      showToast("Demo restablecida.", "info");
      navigate("#/");
    },
  });

  const logout = button({
    variant: "ghost",
    label: "Cerrar sesión",
    className: "text-error",
    onClick: () => {
      store.logout();
      navigate("#/login");
    },
  });

  root.append(
    shell({
      role: session.role,
      activeHref: "#/perfil",
      children: [
        pageTitle("Mi perfil", `Rol: ${session.role}`),
        form,
        el("div", { className: "mt-6 flex flex-col gap-3" }, [changePass, reset, logout]),
      ],
    }),
  );
}

export function renderChangePassword(root: HTMLElement): void {
  clear(root);
  const session = store.getSession();
  if (!session) {
    navigate("#/login");
    return;
  }

  const form = el("form", { className: "flex flex-col gap-4" });
  form.append(
    field({ id: "current", label: "Contraseña actual", type: "password" }),
    field({ id: "next", label: "Nueva contraseña", type: "password" }),
    field({ id: "confirm", label: "Confirmar nueva", type: "password" }),
  );
  const submit = button({ variant: "primary", type: "submit", label: "Actualizar" });
  form.append(submit);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const current = (form.querySelector("#current") as HTMLInputElement).value;
    const next = (form.querySelector("#next") as HTMLInputElement).value;
    const confirm = (form.querySelector("#confirm") as HTMLInputElement).value;
    if (!next || next !== confirm) {
      showToast("La confirmación no coincide.", "error");
      return;
    }
    const result = store.changePassword(current, next);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    showToast("Contraseña actualizada.", "success");
    navigate("#/perfil");
  });

  root.append(
    shell({
      role: session.role,
      activeHref: "#/perfil",
      children: [pageTitle("Cambiar contraseña"), form],
    }),
  );
}
