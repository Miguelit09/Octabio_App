import { el } from "../lib/dom";

export function progressBar(percent: number, success = false): HTMLElement {
  const clamped = Math.max(0, Math.min(100, percent));
  const fill = el("div", {
    className: `progress-fill ${success ? "progress-fill-success" : ""}`,
    style: `width:${clamped}%`,
  });
  const track = el("div", { className: "progress-track" }, [fill]);
  return track;
}

export function emptyState(opts: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}): HTMLElement {
  const wrap = el("div", {
    className: "card-white flex flex-col items-start gap-3 text-left",
  }, [
    el("h2", { className: "text-xl font-bold text-navy" }, [opts.title]),
    el("p", { className: "text-base text-on-surface-variant" }, [opts.body]),
  ]);

  if (opts.actionLabel && opts.onAction) {
    const btn = el("button", { type: "button", className: "btn-primary mt-2" }, [opts.actionLabel]);
    btn.addEventListener("click", opts.onAction);
    wrap.append(btn);
  }
  return wrap;
}

export function field(opts: {
  id: string;
  label: string;
  type?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  readonly?: boolean;
  hint?: string;
}): HTMLElement {
  const input = el("input", {
    id: opts.id,
    name: opts.id,
    type: opts.type ?? "text",
    className: `field-input ${opts.error ? "field-input-error" : ""}`,
    value: opts.value ?? "",
    placeholder: opts.placeholder ?? "",
    readonly: opts.readonly ? true : undefined,
  }) as HTMLInputElement;

  const children: (Node | string)[] = [
    el("label", { for: opts.id, className: "label-caps mb-2 block" }, [opts.label]),
    input,
  ];
  if (opts.hint) {
    children.push(el("p", { className: "mt-1 text-sm text-on-surface-variant" }, [opts.hint]));
  }
  if (opts.error) {
    children.push(el("p", { className: "mt-1 text-sm font-medium text-error" }, [opts.error]));
  }
  return el("div", { className: "w-full" }, children);
}

export function pageTitle(title: string, subtitle?: string): HTMLElement {
  return el("div", { className: "mb-6" }, [
    el("h1", { className: "text-2xl font-bold text-navy" }, [title]),
    subtitle
      ? el("p", { className: "mt-1 text-base text-on-surface-variant" }, [subtitle])
      : null,
  ]);
}
