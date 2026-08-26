import type { ContentType } from "../state/types";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | number | undefined> = {},
  children: (Node | string | null | undefined)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key === "className") {
      node.setAttribute("class", String(value));
    } else if (key === "checked" && value === true && node instanceof HTMLInputElement) {
      node.checked = true;
    } else if (key === "selected" && value === true && node instanceof HTMLOptionElement) {
      node.selected = true;
    } else if (key === "value" && "value" in node) {
      (node as HTMLInputElement).value = String(value);
    } else if (value === true) {
      node.setAttribute(key, "");
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

export function clear(root: HTMLElement): void {
  root.replaceChildren();
}

export function contentTypeLabel(type: ContentType): string {
  const map: Record<ContentType, string> = {
    video: "Video",
    pdf: "PDF / Documento",
    image: "Imagen",
    richtext: "Texto",
    steam: "Recurso STEAM",
  };
  return map[type];
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
