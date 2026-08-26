export type RouteParams = Record<string, string>;

export interface RouteMatch {
  path: string;
  params: RouteParams;
  query: Record<string, string>;
}

type RouteHandler = (match: RouteMatch) => void;

interface RouteDef {
  pattern: string;
  handler: RouteHandler;
}

const routes: RouteDef[] = [];
let notFoundHandler: RouteHandler | null = null;

function parseQuery(search: string): Record<string, string> {
  const q: Record<string, string> = {};
  if (!search) return q;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.forEach((value, key) => {
    q[key] = value;
  });
  return q;
}

function matchPattern(pattern: string, path: string): RouteParams | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: RouteParams = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    const vp = pathParts[i];
    if (pp.startsWith(":")) {
      params[pp.slice(1)] = decodeURIComponent(vp);
    } else if (pp !== vp) {
      return null;
    }
  }
  return params;
}

export function getHashPath(): { path: string; query: Record<string, string> } {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart = ""] = raw.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  return { path, query: parseQuery(queryPart) };
}

export function navigate(to: string): void {
  const hash = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : `/${to}`}`;
  if (location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  location.hash = hash;
}

export function route(pattern: string, handler: RouteHandler): void {
  routes.push({ pattern, handler });
}

export function onNotFound(handler: RouteHandler): void {
  notFoundHandler = handler;
}

export function startRouter(): void {
  const run = () => {
    const { path, query } = getHashPath();
    for (const r of routes) {
      const params = matchPattern(r.pattern, path);
      if (params) {
        r.handler({ path, params, query });
        return;
      }
    }
    notFoundHandler?.({ path, params: {}, query });
  };

  window.addEventListener("hashchange", run);
  if (!location.hash) {
    location.hash = "#/";
  } else {
    run();
  }
}
