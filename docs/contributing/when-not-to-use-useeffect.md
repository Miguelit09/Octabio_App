# When NOT to use useEffect

Effects are an escape hatch from React's paradigm. They exist to _synchronize_ your component with an external system (a non-React widget, the network, or the browser DOM). If no external system is involved — if you just want to update state when props/state change, compute a value for rendering, or react to a user action — you should **not** reach for `useEffect`.

This page is the checklist we review against before approving a component PR. It complements [Rules of React](./rules-of-react.md) (which governs _how_ hooks are called); this one governs _whether_ an effect belongs at all.

Reference: [react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect).

## The anti-patterns

### A1 — Derived state synced via effect (props/state → state)

Computing a value from props or other state and writing it back with `setState` inside `useEffect`.

```tsx
// 🔴 Anti-pattern
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);

// ✅ Good — calculate during render
const fullName = firstName + ' ' + lastName;
```

**Rule:** If a value can be computed from existing props/state, compute it during render. Wrap in `useMemo` only if the calculation is expensive (looping over thousands of objects). Never store derived data in `useState`.

### A2 — Manual subscriptions instead of `useSyncExternalStore`

Subscribing to a browser/DOM/external store with `addEventListener` + `useState` inside an effect.

```tsx
// 🔴 Less ideal
const [isOnline, setIsOnline] = useState(true);
useEffect(() => {
  const update = () => setIsOnline(navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  return () => {
    /* remove listeners */
  };
}, []);

// ✅ Good — purpose-built Hook
useSyncExternalStore(
  subscribe,
  () => navigator.onLine,
  () => true,
);
```

**Rule:** For reactive external values, prefer `useSyncExternalStore`. It is concurrency-safe and avoids tearing. Raw `addEventListener` effects are still acceptable for one-off event handlers (e.g. click-outside) but not for exposing reactive values.

### A3 — Event logic living in an effect

Side effects that should fire _because the user did something_ (POST, toast, navigation, form reset) placed in an effect that watches state.

```tsx
// 🔴 Anti-pattern — fires on mount, refresh, and every re-render
useEffect(() => {
  if (product.isInCart) showNotification(`Added ${product.name}`);
}, [product]);

// ✅ Good — fires only on the click
function handleBuy() {
  addToCart(product);
  showNotification(`Added ${product.name}`);
}
```

**Rule:** If a side effect is caused by a specific interaction, keep it in the event handler. Effects are for code that runs _because the component was displayed_. With React Router, handle mutations in the `action` and surface results via `useActionData` / `useFetcher` in the component that submitted — not by watching `fetcher.state` in an effect.

**Bridge for framework action responses:** a handler that `await`s `submit()` / `fetcher.submit()` often must react to the *committed* response (`fetcher.data` / `useActionData`), which lands on a render that races the handler continuation. `useActionResponse` (`app/hooks/useActionResponse.ts`) is the sanctioned bridge: the handler marks its submission settled, and the hook invokes the callback exactly once when that submission's own response data has committed — never on mount, refresh, or navigation. Everything else (toasts, resets, modal close, revalidation) still lives in handlers/callbacks; do not hand-roll state-watching effects alongside it.

### A4 — Chains of effects that trigger each other

Multiple effects where each writes state that another effect depends on, cascading re-renders.

```tsx
// 🔴 Anti-pattern — 3+ extra renders per change
useEffect(() => {
  if (card?.gold) setGoldCardCount((c) => c + 1);
}, [card]);
useEffect(() => {
  if (goldCardCount > 3) setRound((r) => r + 1);
}, [goldCardCount]);
```

**Rule:** Calculate what you can during render; batch the rest inside the triggering event handler. If truly needed, keep all the logic in one effect.

### A5 — Resetting/adjusting state on prop change in an effect

Setting state back to an initial value when a prop changes.

```tsx
// 🔴 Anti-pattern
useEffect(() => {
  setComment('');
}, [userId]);

// ✅ Good — reset the whole subtree with a key
<Profile userId={userId} key={userId} />;
```

**Rule:** To reset _all_ state for a changed entity, pass a `key` (often the entity id) from the parent. To reset _part_ of state, compute it during render, or — as a last resort — adjust during render with a `prev` guard. Prefer lifting state up so the parent fully controls it.

### A6 — Parent/child state sync via effect callbacks

A child effect calls a parent callback (`onChange`, `onSaved`) to push state up when the child's state changes.

```tsx
// 🔴 Anti-pattern — parent updates after child render, extra pass
useEffect(() => {
  onChange(isOn);
}, [isOn, onChange]);

// ✅ Good — update both in the event
function updateToggle(next) {
  setIsOn(next);
  onChange(next);
}
```

**Rule:** Lift state up or make the component fully controlled (`value` + `onChange`). Notify the parent in the same event handler that changed the child, not in an effect.

### A7 — Data fetching without race-condition cleanup

An effect fetches data and writes it with `setState`, but doesn't ignore stale responses when deps change or the component unmounts.

```tsx
// 🔴 Anti-pattern — out-of-order responses overwrite correct data
useEffect(() => {
  fetchResults(query).then((json) => setResults(json));
}, [query]);

// ✅ Good — ignore stale responses
useEffect(() => {
  let ignore = false;
  fetchResults(query).then((json) => {
    if (!ignore) setResults(json);
  });
  return () => {
    ignore = true;
  };
}, [query]);
```

**Rule:** Every async effect that sets state must return a cleanup that cancels/ignores the in-flight work. Prefer framework-level data loading (React Router loaders/actions) where possible; for client-only fetches, add an `ignore` flag or `AbortController`.

### A8 — One-time init in an empty-deps effect

App/component-wide setup placed in `useEffect(() => { … }, [])` runs twice in dev and can break idempotent setups (auth tokens, websockets).

```tsx
// 🔴 Anti-pattern
useEffect(() => {
  loadDataFromLocalStorage();
  checkAuthToken();
}, []);

// ✅ Good — module-level, runs once per app load
if (typeof window !== 'undefined') {
  checkAuthToken();
}
```

**Rule:** Move truly app-wide setup to module init or a React Router `loader`. Guard remounts with a module-level flag if it must stay in an effect. Never put data dependencies in an empty-deps effect (use proper deps + memoized callbacks).

## Review checklist

Before approving a component PR, confirm there is **no** `useEffect` that:

- [ ] computes a value that could be derived during render (A1)
- [ ] manually subscribes to an external store that `useSyncExternalStore` fits (A2)
- [ ] runs because of a user event instead of component display (A3)
- [ ] triggers another effect via state writes (A4)
- [ ] resets/adjusts state on prop change instead of using `key`/lifted state (A5)
- [ ] pushes child state to a parent via a callback (A6)
- [ ] fetches without an `ignore`/`abort` cleanup (A7)
- [ ] performs one-time init in an empty-deps effect (A8)
