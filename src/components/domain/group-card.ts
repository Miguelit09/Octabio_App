import { el } from "../../lib/dom";
import type { Group } from "../../state/types";
import { surfaceCard } from "../cards";

export function groupCard(opts: {
  group: Group;
  courseTitle?: string;
  onClick?: () => void;
  featured?: boolean;
}): HTMLElement {
  const { group, courseTitle, onClick, featured } = opts;
  const titleClass = featured ? "text-lg font-bold text-navy" : "font-bold text-navy";
  return surfaceCard({
    onClick,
    asButton: true,
    children: [
      el("h3", { className: titleClass }, [group.name]),
      el("p", { className: "mt-1 text-sm text-on-surface-variant" }, [
        `${courseTitle ?? "Curso"} · ${group.studentIds.length} estudiantes`,
      ]),
    ],
  });
}
