import { el } from "../lib/dom";
import { DEMO_PASSWORD } from "../data/seed";

export function demoHint(): HTMLElement {
  return el("div", {
    className: "mt-6 rounded-xl border border-card-border bg-card p-3 text-sm text-on-surface-variant",
  }, [
    el("p", { className: "label-caps mb-2 text-primary-container" }, ["Cuentas demo"]),
    el("p", { className: "font-mono text-xs leading-relaxed text-navy" }, [
      `estudiante@octabio.test / ${DEMO_PASSWORD}`,
    ]),
    el("p", { className: "font-mono text-xs leading-relaxed text-navy" }, [
      `docente@octabio.test / ${DEMO_PASSWORD}`,
    ]),
    el("p", { className: "font-mono text-xs leading-relaxed text-navy" }, [
      `admin@octabio.test / ${DEMO_PASSWORD}`,
    ]),
  ]);
}
