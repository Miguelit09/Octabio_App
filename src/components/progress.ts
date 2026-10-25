import { el } from "../lib/dom";

export function progressBar(percent: number, success = false): HTMLElement {
  const clamped = Math.max(0, Math.min(100, percent));
  const fill = el("div", {
    className: `progress-fill ${success ? "progress-fill-success" : ""}`,
    style: `width:${clamped}%`,
  });
  return el("div", { className: "progress-track" }, [fill]);
}

export function progressLabeled(opts: {
  label: string;
  percent: number;
  success?: boolean;
  size?: "xs" | "sm";
}): HTMLElement {
  const sizeClass = opts.size === "xs" ? "text-xs" : "text-sm";
  return el("div", {}, [
    el("div", {
      className: `mb-1 flex justify-between font-semibold ${sizeClass}`,
    }, [
      el("span", {}, [opts.label]),
      el("span", {}, [`${opts.percent}%`]),
    ]),
    progressBar(opts.percent, opts.success),
  ]);
}
