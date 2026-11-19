// The island window: state, events and window sizing. Everything it shows is mock data (mock/data.ts);
// Allow, Deny, answers and chat only change this page's state and show a note.
import "../styles/tokens.css";
import "../styles/fonts.css";
import "../styles/base.css";
import "../styles/island.css";
import { refreshBots, startBots } from "../bot/botCanvas";
import { $ } from "../lib/dom";
import { inTauri, onBotLook, onIslandDemo, openMainWindow, resizeIsland, setIslandFocusable } from "../lib/tauri";
import { CHAT_PLACEHOLDER_REPLY, DEFAULT_LOOK, MOCK_AGENTS, MOCK_APPROVAL, MOCK_CHAT, MOCK_QUESTION, STATES } from "../mock/data";
import { BODY, chatLog, compact, tabs, VIEWS, VIEW_STATE, WIDTH, WITH_TABS, type IslandState, type View } from "./views";

const island = $("#island")!, inner = $("#islandInner")!, status = $("#islandStatus")!;
const DEMO = import.meta.env.DEV || new URLSearchParams(location.search).has("debug");
const OPEN_ON_HOVER = true; // MOCK: the "Open on hover" setting, not yet shared between windows

const S: IslandState = { view: "compact", barState: "working", note: "", answer: 0, muted: false, focusAgent: "claude", chat: [...MOCK_CHAT], ...DEFAULT_LOOK };

// ---------------------------------------------------------------- window sizing
// The window is exactly as big as the island. While the island animates, the window first grows to fit
// both the old and the new size, then shrinks to the new size once the animation is over.
let winW = 0, winH = 0, shrink = 0;
const settleMs = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 480);
const fit = () => {
  const w = WIDTH[S.view];
  inner.style.width = `${w}px`;
  island.style.width = `${w}px`;
  const h = Math.ceil(inner.offsetHeight);
  island.style.height = `${h}px`;
  const gw = Math.max(winW, w), gh = Math.max(winH, h);
  if (gw !== winW || gh !== winH) { winW = gw; winH = gh; void resizeIsland(winW, winH); }
  clearTimeout(shrink);
  shrink = window.setTimeout(() => { if (winW !== w || winH !== h) { winW = w; winH = h; void resizeIsland(w, h); } }, settleMs());
};

// ---------------------------------------------------------------- rendering
const render = () => {
  island.dataset.view = S.view;
  island.style.setProperty("--glow", STATES[VIEW_STATE[S.view]].color);
  inner.innerHTML = S.view === "compact" ? compact(S) : (WITH_TABS.includes(S.view) ? tabs(S) : "") + `<div class="ibody">${BODY[S.view](S)}</div>`;
  fit();
  refreshBots();
  renderDemoStrip();
  if (S.view === "compact") void setIslandFocusable(false);
};

const say = (text: string) => { status.textContent = text; };

const setView = (v: View, note = "") => {
  S.view = v;
  S.note = note;
  render();
  if (note) say(note);
  else if (v !== "compact") say(`${STATES[VIEW_STATE[v]].label}: ${v}`);
  if (v === "chat") $<HTMLInputElement>("#chatInput")?.focus();
};

/** Folds the island back to the bar with a short note of what happened (mock result). */
const fold = (note: string, bar: IslandState["barState"] = "working") => { S.barState = bar; setView("compact", note); };

// ---------------------------------------------------------------- actions
const answer = (i: number) => {
  S.answer = i;
  render();
  window.setTimeout(() => fold(`Answered · ${MOCK_QUESTION.options[i]}`), settleMs() ? 350 : 0);
};

const act = (action: string) => {
  if (action.startsWith("answer-")) return answer(Number(action.slice(7)));
  switch (action) {
    case "home": return setView("home");
    case "chat": return setView("chat");
    case "fold": return fold("");
    case "new": return fold("New session · comes later (mock)", "ready");
    case "settings": void openMainWindow("#/settings/general"); return fold("");
    case "mute": S.muted = !S.muted; render(); return say(S.muted ? "Sounds off" : "Sounds on");
    case "allow": return fold(`Allowed · ${MOCK_APPROVAL.command}`);
    case "deny": return fold(`Denied · ${MOCK_APPROVAL.command}`, "ready");
    case "always": return fold(`Always allowed · ${MOCK_APPROVAL.always}`);
    case "terminal": return fold("Would open the terminal (mock)");
    case "diff": return fold("Would open the diff (mock)");
  }
};

island.addEventListener("click", (e) => {
  const el = e.target as Element;
  const pill = el.closest<HTMLElement>("[data-agent]");
  if (pill) { S.focusAgent = pill.dataset.agent!; render(); const a = MOCK_AGENTS.find((x) => x.id === S.focusAgent); if (a) say(`${a.name} · ${a.project} · ${STATES[a.state].label}`); return; }
  const a = el.closest<HTMLElement>("[data-action]")?.dataset.action;
  if (a) act(a);
});

island.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $<HTMLInputElement>("#chatInput"), log = $("#chatLog");
  const text = input?.value.trim();
  if (!input || !log || !text) return;
  S.chat.push({ who: "me", text }, { who: "ai", text: CHAT_PLACEHOLDER_REPLY, mock: true });
  input.value = "";
  log.innerHTML = chatLog(S);
  log.scrollTop = log.scrollHeight;
  fit();
  say(CHAT_PLACEHOLDER_REPLY);
});

document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "escape" && S.view !== "compact") { e.preventDefault(); return fold(S.view === "approval" ? `Denied · ${MOCK_APPROVAL.command}` : ""); }
  if ((e.target as Element).closest("input, textarea, select") || e.ctrlKey || e.metaKey || e.altKey) return;
  if (S.view === "approval") {
    if (k === "y") return act("allow");
    if (k === "n") return act("deny");
    if (k === "a") return act("always");
  }
  if (S.view === "question" && ["1", "2", "3"].includes(k)) return answer(Number(k) - 1);
  if (DEMO && (k === "]" || k === "[")) step(k === "]" ? 1 : -1);
});

// open on hover; a home page folds again when the pointer leaves. The island can only take keyboard
// focus while it is open and the pointer is on it, so it never steals focus from the user's editor.
let leave = 0;
island.addEventListener("pointerenter", () => {
  clearTimeout(leave);
  if (S.view === "compact") { if (OPEN_ON_HOVER) setView("home"); }
  void setIslandFocusable(true);
});
island.addEventListener("pointerleave", () => {
  if (S.view === "home" && !island.contains(document.activeElement)) leave = window.setTimeout(() => fold(""), 700);
  else if (S.view === "compact") void setIslandFocusable(false);
});

// ---------------------------------------------------------------- dev-only demo cycler
// In dev builds (or with ?debug): "[" and "]" step through the pages, the settings window's dev strip
// sends pages over a Tauri event, and in a plain browser a strip of buttons sits at the bottom.
function step(d: number) { const i = VIEWS.indexOf(S.view); setView(VIEWS[(i + d + VIEWS.length) % VIEWS.length]); }
function renderDemoStrip() {
  if (!DEMO || inTauri()) return;
  document.body.classList.add("preview");
  let strip = $("#demoStrip");
  if (!strip) {
    strip = document.createElement("nav");
    strip.id = "demoStrip"; strip.className = "demo-strip"; strip.setAttribute("aria-label", "Demo: island pages");
    strip.addEventListener("click", (e) => { const v = (e.target as HTMLElement).closest<HTMLElement>("[data-demo]")?.dataset.demo as View | undefined; if (v) setView(v); });
    document.body.append(strip);
  }
  strip.innerHTML = `<span>Demo</span>` + VIEWS.map((v) => `<button type="button" data-demo="${v}" aria-pressed="${S.view === v}">${v}</button>`).join("");
}
void onBotLook((look) => { S.face = look.face; S.outfit = look.outfit; render(); });
if (DEMO) void onIslandDemo((v) => { if ((VIEWS as string[]).includes(v)) setView(v as View); });

render();
startBots();
void document.fonts.ready.then(fit);
