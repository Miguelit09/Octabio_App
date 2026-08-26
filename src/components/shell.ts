import {
  BookOpen,
  ChartColumn,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  Users,
} from "lucide";
import { el } from "../lib/dom";
import { navigate } from "../router";
import type { Role } from "../state/types";
import { icon } from "./icons";

interface NavItem {
  href: string;
  label: string;
  lucide: typeof Home;
}

function itemsForRole(role: Role): NavItem[] {
  if (role === "estudiante") {
    return [
      { href: "#/app/inicio", label: "Inicio", lucide: Home },
      { href: "#/app/catalogo", label: "Catálogo", lucide: Library },
      { href: "#/app/progreso", label: "Progreso", lucide: ChartColumn },
      { href: "#/perfil", label: "Perfil", lucide: Settings },
    ];
  }
  if (role === "docente") {
    return [
      { href: "#/doc/inicio", label: "Inicio", lucide: Home },
      { href: "#/doc/grupos", label: "Grupos", lucide: Users },
      { href: "#/perfil", label: "Perfil", lucide: Settings },
    ];
  }
  return [
    { href: "#/admin", label: "Panel", lucide: LayoutDashboard },
    { href: "#/admin/cursos", label: "Cursos", lucide: BookOpen },
    { href: "#/admin/usuarios", label: "Usuarios", lucide: Users },
    { href: "#/perfil", label: "Perfil", lucide: Settings },
  ];
}

export function bottomNav(role: Role, activeHref: string): HTMLElement {
  const nav = el("nav", {
    className:
      "fixed bottom-0 left-1/2 z-40 flex w-full max-w-[640px] -translate-x-1/2 border-t border-outline-variant bg-surface-lowest px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1",
    "aria-label": "Navegación principal",
  });

  for (const item of itemsForRole(role)) {
    const active =
      activeHref === item.href ||
      (item.href !== "#/admin" && activeHref.startsWith(`${item.href}/`));
    const btn = el(
      "button",
      {
        type: "button",
        className: `flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-semibold ${
          active ? "text-primary-container" : "text-on-surface-variant"
        }`,
      },
      [icon(item.lucide, active ? "h-5 w-5" : "h-5 w-5 opacity-80"), item.label],
    );
    btn.addEventListener("click", () => navigate(item.href));
    nav.append(btn);
  }
  return nav;
}

export function topBar(opts: {
  title: string;
  backHref?: string;
  right?: HTMLElement | null;
}): HTMLElement {
  const left = opts.backHref
    ? (() => {
        const b = el("button", {
          type: "button",
          className: "btn-ghost -ml-2",
        }, ["← Volver"]);
        b.addEventListener("click", () => navigate(opts.backHref!));
        return b;
      })()
    : el("div", { className: "w-16" });

  return el(
    "header",
    {
      className:
        "sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant bg-background/95 px-3 py-3 backdrop-blur",
    },
    [
      left,
      el("h1", { className: "text-base font-bold text-navy" }, [opts.title]),
      opts.right ?? el("div", { className: "w-16" }),
    ],
  );
}

export function shell(opts: {
  role: Role;
  activeHref: string;
  children: HTMLElement[];
  top?: HTMLElement | null;
}): HTMLElement {
  const main = el("div", { className: "page-shell relative" }, [
    opts.top ?? null,
    el("div", { className: "page-pad-nav" }, opts.children),
    bottomNav(opts.role, opts.activeHref),
  ]);
  return main;
}

export function authShell(children: HTMLElement[]): HTMLElement {
  return el("div", { className: "page-shell" }, [
    el("div", { className: "page-pad" }, children),
  ]);
}

export function logoutButton(): HTMLElement {
  const btn = el("button", { type: "button", className: "btn-ghost text-error" }, [
    icon(LogOut, "h-4 w-4"),
    "Salir",
  ]);
  return btn;
}
