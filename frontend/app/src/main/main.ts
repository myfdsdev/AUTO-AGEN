// The settings window ("main"): Sign in → First launch → Settings, on a tiny hash router.
import "../styles/tokens.css";
import "../styles/fonts.css";
import "../styles/base.css";
import "../styles/main.css";
import { refreshBots, startBots } from "../bot/botCanvas";
import { $ } from "../lib/dom";
import { onMainRoute } from "../lib/tauri";
import { onboarding } from "./pages/onboarding";
import { settings } from "./pages/settings";
import { signin } from "./pages/signin";
import { go, parse, type Page } from "./router";

const ROUTES: Record<string, Page> = { signin, welcome: onboarding, settings };
const app = $("#app")!;
let current = "";

/** A selector that finds the same control again after the page is redrawn. */
const keyOf = (el: Element | null): string | null => {
  if (!(el instanceof HTMLElement) || !app.contains(el)) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  for (const a of ["data-toggle", "data-preview", "data-face", "data-outfit", "data-position", "data-action"]) {
    const v = el.getAttribute(a);
    if (v) return `[${a}="${CSS.escape(v)}"]`;
  }
  return null;
};

const render = () => {
  if (!location.hash) { location.replace("#/signin"); return; }
  const { name, param } = parse(location.hash);
  const page = ROUTES[name] ?? signin;
  const route = `${name}/${param}`;
  const keep = route === current ? keyOf(document.activeElement) : null;
  app.innerHTML = page.render(param);
  document.title = `AutoAgent · ${page.title}`;
  refreshBots();
  if (keep) $<HTMLElement>(keep, app)?.focus();
  else if (route !== current && current) {
    // a new page: move focus to its heading so screen readers announce it
    const h1 = $<HTMLElement>("h1", app);
    h1?.setAttribute("tabindex", "-1");
    h1?.focus({ preventScroll: true });
  }
  current = route;
};

const page = () => ROUTES[parse(location.hash).name] ?? signin;
const param = () => parse(location.hash).param;

app.addEventListener("click", (e) => {
  const el = (e.target as Element).closest<HTMLElement>("button, [data-action]");
  if (!el || !app.contains(el)) return;
  if (page().click?.(el, param())) render();
});
app.addEventListener("change", (e) => {
  const el = e.target as HTMLElement;
  if (page().change?.(el, param())) render();
});
app.addEventListener("submit", (e) => {
  e.preventDefault();
  page().submit?.(e.target as HTMLFormElement, param());
});

window.addEventListener("hashchange", render);
void onMainRoute((route) => go(route));
render();
startBots();
