import { button } from "./buttons";
import { el } from "../lib/dom";

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
    wrap.append(
      button({
        variant: "primary",
        label: opts.actionLabel,
        className: "mt-2",
        onClick: opts.onAction,
      }),
    );
  }
  return wrap;
}

export function pageTitle(title: string, subtitle?: string): HTMLElement {
  return el("div", { className: "mb-6" }, [
    el("h1", { className: "text-2xl font-bold text-navy" }, [title]),
    subtitle
      ? el("p", { className: "mt-1 text-base text-on-surface-variant" }, [subtitle])
      : null,
  ]);
}
