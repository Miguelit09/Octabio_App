import { el } from "../lib/dom";

let hideTimer: number | undefined;

export function showToast(message: string, variant: "success" | "error" | "info" = "info"): void {
  const root = document.getElementById("toast-root");
  if (!root) return;
  root.replaceChildren();

  const colors =
    variant === "success"
      ? "bg-success-container text-success border-success"
      : variant === "error"
        ? "bg-error-container text-on-error-container border-error"
        : "bg-secondary-container text-on-secondary-container border-primary-container";

  const toast = el("div", {
    className: `pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${colors}`,
    role: "status",
  }, [message]);

  root.append(toast);
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    root.replaceChildren();
  }, 2800);
}
