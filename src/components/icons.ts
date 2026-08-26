import { createElement, type IconNode } from "lucide";

export function icon(node: IconNode, className = "h-5 w-5"): SVGElement {
  const svg = createElement(node);
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("class", className);
  return svg as unknown as SVGElement;
}
