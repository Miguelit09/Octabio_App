import { el } from "../lib/dom";

export function surfaceCard(opts: {
  children: (Node | string | null | undefined)[];
  onClick?: () => void;
  className?: string;
  asButton?: boolean;
}): HTMLElement {
  const base =
    "card-surface w-full text-left transition active:scale-[0.99]";
  const className = [base, opts.className].filter(Boolean).join(" ");

  if (opts.onClick || opts.asButton) {
    const card = el("button", { type: "button", className }, opts.children);
    if (opts.onClick) card.addEventListener("click", opts.onClick);
    return card;
  }
  return el("div", { className: ["card-surface", opts.className].filter(Boolean).join(" ") }, opts.children);
}

export function listRow(opts: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  trailing?: HTMLElement | string | null;
  actions?: HTMLElement | HTMLElement[] | null;
  onClick?: () => void;
  className?: string;
  borderSuccess?: boolean;
}): HTMLElement {
  const body: (Node | string | null | undefined)[] = [];
  if (opts.eyebrow) {
    body.push(el("p", { className: "label-caps" }, [opts.eyebrow]));
  }
  body.push(
    el("h3", { className: `font-bold text-navy ${opts.eyebrow ? "mt-1" : ""}` }, [opts.title]),
  );
  if (opts.subtitle) {
    body.push(
      el("p", { className: "mt-1 text-sm text-on-surface-variant" }, [opts.subtitle]),
    );
  }

  const main = el("div", { className: "flex items-start justify-between gap-3" }, [
    el("div", {}, body),
    opts.trailing ?? null,
  ]);

  const children: (Node | string | null | undefined)[] = [main];
  if (opts.actions) {
    const actionNodes = Array.isArray(opts.actions) ? opts.actions : [opts.actions];
    children.push(el("div", { className: "mt-3 flex flex-wrap gap-2" }, actionNodes));
  }

  const className = [
    "card-white",
    opts.onClick ? "w-full text-left" : "",
    opts.borderSuccess ? "border-success" : "",
    opts.className,
  ]
    .filter(Boolean)
    .join(" ");

  if (opts.onClick) {
    const row = el("button", { type: "button", className }, children);
    row.addEventListener("click", opts.onClick);
    return row;
  }
  return el("div", { className }, children);
}
