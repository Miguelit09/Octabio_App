import { el } from "../lib/dom";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export function button(opts: {
  variant?: ButtonVariant;
  label?: string;
  children?: (Node | string)[];
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
}): HTMLButtonElement {
  const variant = opts.variant ?? "primary";
  const className = [variantClass[variant], opts.className].filter(Boolean).join(" ");
  const children = opts.children ?? (opts.label != null ? [opts.label] : []);
  const btn = el(
    "button",
    { type: opts.type ?? "button", className },
    children,
  ) as HTMLButtonElement;
  if (opts.onClick) btn.addEventListener("click", opts.onClick);
  return btn;
}

export function actionChip(opts: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}): HTMLButtonElement {
  const btn = el(
    "button",
    {
      type: "button",
      className: `rounded-lg border px-3 py-1.5 text-sm font-semibold ${
        opts.danger
          ? "border-error text-error"
          : "border-primary-container text-primary-container"
      }`,
    },
    [opts.label],
  ) as HTMLButtonElement;
  btn.addEventListener("click", opts.onClick);
  return btn;
}
