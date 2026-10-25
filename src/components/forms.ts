import { el } from "../lib/dom";

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

export function selectField(opts: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value?: string;
}): HTMLElement {
  const select = el("select", {
    id: opts.id,
    name: opts.id,
    className: "field-input",
  }) as HTMLSelectElement;
  for (const opt of opts.options) {
    const option = el("option", { value: opt.value }, [opt.label]) as HTMLOptionElement;
    if (opts.value !== undefined && opts.value === opt.value) option.selected = true;
    select.append(option);
  }
  return el("div", { className: "w-full" }, [
    el("label", { for: opts.id, className: "label-caps mb-2 block" }, [opts.label]),
    select,
  ]);
}

export function checkboxField(opts: {
  id: string;
  label: string;
  checked?: boolean;
}): HTMLElement {
  const input = el("input", {
    type: "checkbox",
    id: opts.id,
    name: opts.id,
  }) as HTMLInputElement;
  if (opts.checked) input.checked = true;
  return el("label", { className: "flex items-center gap-2 text-sm font-medium" }, [
    input,
    opts.label,
  ]);
}
