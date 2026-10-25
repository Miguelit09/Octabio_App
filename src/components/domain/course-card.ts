import { el } from "../../lib/dom";
import { store } from "../../state/store";
import type { Course } from "../../state/types";
import { surfaceCard } from "../cards";
import { progressLabeled } from "../progress";

function categoryName(id: string): string {
  return store.getState().data.categories.find((c) => c.id === id)?.name ?? "STEAM";
}

export function courseCard(opts: {
  course: Course;
  percent?: number;
  onClick?: () => void;
}): HTMLElement {
  const { course, percent, onClick } = opts;
  return surfaceCard({
    onClick,
    asButton: true,
    children: [
      el("p", { className: "label-caps text-primary-container" }, [
        categoryName(course.categoryId),
      ]),
      el("h3", { className: "mt-1 text-lg font-bold text-navy" }, [course.title]),
      el("p", { className: "mt-1 line-clamp-2 text-sm text-on-surface-variant" }, [
        course.description,
      ]),
      percent !== undefined
        ? el("div", { className: "mt-3" }, [
            progressLabeled({ label: "Progreso", percent, size: "xs" }),
          ])
        : null,
    ],
  });
}
