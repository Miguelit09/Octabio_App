# useRef pitfalls (F1–F6)

`useRef` holds a mutable value that survives re-renders without triggering them. That makes it the right home for values rendering never reads: interval/timer IDs, subscription and animation-frame handles, latest-callback slots read from effects, and DOM nodes driven imperatively (`focus()`, `play()`, `scrollIntoView()`). Anything a user can see or interact with is state.

Reference: [react.dev/reference/react/useRef](https://react.dev/reference/react/useRef).

## Why it matters

React treats a ref as a plain object it never observes. Mutating `ref.current` is invisible to the render pipeline — no re-render, no scheduling, no diffing. That invisibility is the feature (cheap, synchronous, render-safe storage) *and* the whole bug family below: code that leans on `ref.current` where React needs visibility produces UI that silently freezes, or renders whose output depends on mutation order. In Strict Mode dev, components run twice with one result discarded, so impure ref access during render double-applies in development and misbehaves differently in production.

This page complements [Rules of React](./rules-of-react.md) (F1/F5 are its purity rules applied to refs) and [When NOT to use useEffect](./when-not-to-use-useeffect.md) (once a ref holds a handle, the consuming cleanup lives there).

## The pitfalls

### F1 — Reading or writing `ref.current` during render

The component body must stay pure: same inputs → same JSX.

```tsx
// 🔴 Anti-pattern
function Profile() {
  visitsRef.current += 1;              // render-phase write
  return <h1>{draftRef.current.name}</h1>; // render-phase read
}
```

```tsx
// ✅ Good — handlers and effects own ref access
useEffect(() => {
  reportVisit();
}, []);
function handleRename(name: string) {
  draftRef.current = { name };
}
```

**Rule:** Read/write `ref.current` from event handlers, effects, and callbacks they register. The single sanctioned exception is a deterministic lazy-init guard — `if (ref.current === null) { ref.current = … }` — because it runs once and always yields the same value:

```tsx
const playerRef = useRef<Player | null>(null);
if (playerRef.current === null) {
  playerRef.current = new Player();
}
```

Render-prop callbacks count as render phase when the host component invokes function children synchronously in its own body — logic reached that way belongs in an event handler or an effect keyed on the submitted data.

### F2 — Display-bound refs

Storing display-bound data (counters, toggles, form values) in a ref freezes the UI: mutating `current` never re-renders, so the JSX shows a stale snapshot until an unrelated state change happens to re-render.

```tsx
// 🔴 Anti-pattern — number never updates
function Counter() {
  const countRef = useRef(0);
  return (
    <button onClick={() => { countRef.current += 1; }}>
      {countRef.current}
    </button>
  );
}
```

```tsx
// ✅ Good — state drives output
const [count, setCount] = useState(0);
```

**Rule:** Pick the home by one question — *does rendering need it?* Yes → `useState` (re-render + fresh snapshot). No → `useRef` (silent, synchronous). A component writing a ref and then calling `setState` just to force a repaint is this pitfall wearing a disguise; the value wanted the state slot all along.

### F3 — Eager initializers

React evaluates the `useRef` argument on **every** render and discards the result after the first.

```tsx
// 🔴 Wasteful — new Player() built on every render
const playerRef = useRef(new Player());
```

**Rule:** Initialize cheap (`null`, `0`, `''`) and construct lazily behind the sanctioned guard from F1. For nullable types that resist null checks, expose a getter that creates on first use instead of sprinkling guards at call sites.

### F4 — Dropped refs on custom components

A DOM element attaches a passed ref automatically; a custom component does not unless it accepts `ref` and forwards it to a node inside itself (on React ≤18 via `forwardRef` + `useImperativeHandle`; on React ≥19 as a regular prop).

```tsx
// 🔎 Symptom: parent's inputRef.current stays null / TypeError on use
<MyInput ref={inputRef} />
```

**Rule:** When passing a ref to your own component, open its definition and confirm the chain ends at a built-in element. When authoring a wrapper around an interactive node, accept and forward `ref` as part of its public contract — same discipline as accepting `className`.

### F5 — Mutating render-used objects held in a ref

Reassigning `ref.current` wholesale is fine; reaching into the object it stores and mutating fields is not, when that object feeds rendering — props, state values, anything serialized into forms.

```tsx
// 🔴 Anti-pattern — codesRef.current is passed as a prop elsewhere
codesRef.current.push(code);

// ✅ Good — replace, don't reach in
setCodes((prev) => [...prev, code]);
```

**Rule:** Treat ref-stored objects as immutable if any copy of them flows into JSX or child props. In-place mutation defeats memo comparators (a snapshot compared against itself reads as unchanged) and corrupts discarded concurrent renders. If the data must influence output, it wants state; if it is handler-only bookkeeping, wholesale replacement keeps identity honest.

### F6 — Handles stored without cleanup

Every handle a ref stores — timer ID, subscription, animation-frame ID, abort controller — earns a cleanup that consumes it. A loop whose ID was never stored can never be cancelled; a map of timeout IDs cleared only per-item leaks on unmount.

**Rule:** Store handles at creation time and cancel/remove them in the effect's cleanup return. Before shipping a ref that holds a handle, name the line that releases it. (Cleanup placement rules live in [When NOT to use useEffect](./when-not-to-use-useeffect.md#review-checklist).)

## Review checklist

Before approving a component PR, confirm no added code:

- [ ] reads or writes `ref.current` during render outside a deterministic lazy-init guard (F1)
- [ ] renders from `{someRef.current}` or branches output on it (F2)
- [ ] writes a ref then forces a repaint with `setState` (F2)
- [ ] passes an eager initializer as the `useRef` argument (F3)
- [ ] passes a `ref` to a custom component without verifying forwarding (F4)
- [ ] deep-mutates a ref-stored object that participates in rendering (F5)
- [ ] stores a handle with no cleanup consuming it (F6)
