# Rules of React (R1–R8)

Octabio components must follow the [official Rules of React](https://react.dev/reference/rules). This page is the concise checklist we review every component against before a PR is approved.

## Why it matters

React's rendering model assumes components are pure and deterministic. A single violation causes subtle, hard-to-reproduce bugs: a component remounts on every render, state is lost, effects double-fire, or you get production-only hydration mismatches. The rules below prevent that class of bug.

## The rules

- **R1 — Hooks at the top level only.** Never call hooks inside conditions, loops, after an early `return`, inside event handlers, or inside `useMemo`/`useReducer`/`useEffect` callbacks. _(Auto-caught by `eslint-plugin-react-hooks`.)_
- **R2 — Hooks only from React functions.** Call hooks from components or custom hooks, never from plain JS helpers. _(Auto-caught by `eslint-plugin-react-hooks`.)_
- **R3 — Never call component functions directly.** Write `<Component />` in JSX, never `Component()`. Calling a component as a function bypasses React's reconciliation and breaks silently the moment it gains hooks or state.
- **R4 — Never pass hooks around as values.** No higher-order hooks; don't store or forward hook calls as arguments or return values.
- **R5 — Keep render pure.** No `new Date()` / `Date.now()` / `Math.random()` / `crypto.randomUUID()` in render, no render-time `fetch`/DOM writes, and no mutation of module/global/external state during render. Derive keys/ids with `useId()` or `useState(() => …)` instead of `Date.now()`.
- **R6 — Props and `useState` state are immutable snapshots.** Don't mutate them in place; create new objects/arrays instead.
- **R7 — Hook arguments and return values are immutable.** Don't mutate them. Copy before mutating (e.g. `new URLSearchParams(searchParams)`).
- **R8 — Values are immutable after being used in JSX.** Don't create-then-mutate a value you already rendered.

## Enforcement (the CI gate)

The primary guardrail is CI — a PR must pass:

- `npm run lint` — ESLint with `eslint-plugin-react-hooks` (`react-hooks/rules-of-hooks` = **error**, `exhaustive-deps` = warn). This **auto-catches R1 and R2** for client files.
- `npm run typecheck` — `tsc --noEmit`, which catches type-level mistakes.
- `npm run test` — `vitest`, for the regression tests that lock in rule fixes.

The **React Compiler** is the main guardrail for **R3, R5, R6, R7, R8** — those rules are _not_ covered by stock `eslint-plugin-react-hooks`, so they rely on the compiler plus author discipline. A PR that adds render-time impurity or in-place mutation should be flagged in review **even if lint passes**.

> **Review checklist:** before approving a component PR, confirm it adds no direct component calls (R3), no `Date.now()`/`Math.random()` in render (R5), and no in-place mutation of props/state/arguments (R6/R7).

## Related: when _not_ to use `useEffect`

[When NOT to use useEffect](./when-not-to-use-useeffect.md) governs _whether_ an effect belongs at all; this page governs _how_ hooks are called. Read both before approving a component PR.
