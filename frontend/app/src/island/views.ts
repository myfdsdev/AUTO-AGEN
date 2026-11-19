// The island's pages as markup, one function per page (Island board). They read the island state
// and the mock data; island/main.ts owns the state and the events.
import { botCanvas, esc, ICONS } from "../lib/dom";
import { MOCK_AGENTS, MOCK_APPROVAL, MOCK_DONE, MOCK_ERROR, MOCK_QUESTION, MOCK_SESSION, STATES, type BotState } from "../mock/data";

export type View = "compact" | "home" | "approval" | "question" | "done" | "error" | "chat";
export const VIEWS: View[] = ["compact", "home", "approval", "question", "done", "error", "chat"];

/** Island width per page, in CSS pixels (from the board). Height follows the content. */
export const WIDTH: Record<View, number> = { compact: 340, home: 680, approval: 680, question: 680, done: 484, error: 484, chat: 680 };

/** The state (colour and bot animation) each page shows. */
export const VIEW_STATE: Record<View, BotState> = { compact: "working", home: "working", approval: "needsYou", question: "needsYou", done: "done", error: "problem", chat: "chatting" };

export type IslandState = {
  view: View;
  barState: BotState;
  note: string;
  answer: number;
  muted: boolean;
  focusAgent: string;
  chat: { who: "me" | "ai"; text: string; mock?: boolean }[];
};

const CARD = "#141519", PILL = "#1b1c22", ISLAND = "#000000";

const cardBot = (state: BotState, cls = "") =>
  `<div class="cbot ${cls}">${botCanvas({ anim: STATES[state].anim, ground: CARD })}</div>`;

const head = (project: string, what: string, dot = "var(--color-island-text)") =>
  `<div class="cline"><i class="dot" style="--dot:${dot}"></i><b>${esc(project)}</b><span>${esc(what)}</span></div>`;

const glow = (state: BotState, inner: string, cls = "") =>
  `<article class="icard ${cls}" style="--glow:${STATES[state].color}">${inner}</article>`;

const keyBtn = (label: string, key: string, action: string, primary = false, extra = "") =>
  `<button type="button" class="kbtn${primary ? " primary" : ""}" data-action="${action}" aria-keyshortcuts="${esc(key)}"${extra}>${esc(label)}<kbd aria-hidden="true">${esc(key)}</kbd></button>`;

export const tabs = (s: IslandState) => `<div class="itabs">
  <div class="tabs-l" role="tablist" aria-label="Island">
    <button type="button" role="tab" class="itab" aria-selected="${s.view === "home"}" data-action="home" aria-label="Home">${ICONS.home()}</button>
    <button type="button" role="tab" class="itab" aria-selected="${s.view === "chat"}" data-action="chat" aria-label="Chat">${ICONS.chat()}</button>
    <button type="button" class="itab" data-action="new" aria-label="New session">${ICONS.new()}</button>
  </div>
  <div class="tabs-r">
    <button type="button" class="itab" data-action="settings" aria-label="Settings">${ICONS.settings()}</button>
    <button type="button" class="itab" data-action="mute" aria-pressed="${!s.muted}" aria-label="${s.muted ? "Sounds off" : "Sounds on"}">${s.muted ? ICONS.muted() : ICONS.sound()}</button>
    <button type="button" class="itab" data-action="fold" aria-label="Fold the island">${ICONS.close()}</button>
  </div>
</div>`;

export const compact = (s: IslandState) => {
  const text = s.note || `${STATES[s.barState].label} · ${MOCK_SESSION.project}`;
  return `<button type="button" class="ibar" data-action="home" aria-label="Open AutoAgent. ${esc(text)}">
    ${botCanvas({ anim: STATES[s.barState].anim, ground: ISLAND, cls: "barbot" })}
    <span class="bartext">${esc(text)}</span>
    <span class="minigrid">${MOCK_AGENTS.map((a) => botCanvas({ anim: STATES[a.state].anim === "work" ? "work" : "idle", ground: ISLAND, ink: a.color, cls: "mini" })).join("")}</span>
  </button>`;
};

const home = (s: IslandState) => `<div class="igrid">
  ${glow("working", `${cardBot("working")}<div class="cmain">
    ${head(MOCK_SESSION.project, "working", "var(--color-state-working)")}
    <ul class="isteps" aria-label="Recent steps">${MOCK_SESSION.steps.map((st) => `<li class="${st.now ? "now" : ""}"><span class="verb">${esc(st.verb)}</span><span>${esc(st.target)}</span>${st.add ? ` <span class="add">+${st.add}</span> <span class="del">−${st.del}</span>` : ""}</li>`).join("")}</ul>
    <div class="clinks"><button type="button" class="ilink" data-action="terminal">Open terminal</button><button type="button" class="ilink" data-action="diff">View diff</button></div>
  </div>`)}
  <div class="pills" role="group" aria-label="Agents">${MOCK_AGENTS.map((a) => `<button type="button" class="apill" data-agent="${a.id}" aria-pressed="${s.focusAgent === a.id}" title="${esc(`${a.name} · ${a.project} · ${STATES[a.state].label}`)}">${botCanvas({ anim: a.state === "working" ? "work" : "idle", ground: PILL, ink: a.color, cls: "pbot" })}<span>${esc(a.short)}</span></button>`).join("")}</div>
</div>`;

const approval = () => glow("needsYou", `${cardBot("needsYou")}<div class="cmain">
    ${head(MOCK_APPROVAL.project, "needs permission")}
    <div class="icmd"><code>${esc(MOCK_APPROVAL.command)}</code></div>
    <div class="kbtns">${keyBtn("Deny", "N", "deny")}${keyBtn("Allow", "Y", "allow", true)}${keyBtn("Always", "A", "always")}<button type="button" class="ilink quiet" data-action="terminal">Reply in terminal</button></div>
  </div>`);

const question = (s: IslandState) => glow("needsYou", `
    ${head(MOCK_QUESTION.project, "asks a question")}
    <p class="cq" id="qText">${esc(MOCK_QUESTION.text)}</p>
    <div class="kbtns" role="group" aria-labelledby="qText">${MOCK_QUESTION.options.map((o, i) => keyBtn(o, String(i + 1), `answer-${i}`, s.answer === i)).join("")}</div>`, "nobot");

const done = () => glow("done", `
    ${head(MOCK_DONE.project, `finished in ${MOCK_DONE.took}`, "var(--color-state-done)")}
    <p class="cdone">${esc(MOCK_DONE.summary)}</p>
    <span class="cstats"><b>${MOCK_DONE.files}</b> files · <b class="add">+${MOCK_DONE.add}</b> · <b class="del">−${MOCK_DONE.del}</b></span>
    <div class="clinks"><button type="button" class="ilink" data-action="diff">View changes</button><button type="button" class="ilink quiet" data-action="fold">Dismiss</button></div>`, "small");

const error = () => glow("problem", `
    ${head(MOCK_ERROR.project, MOCK_ERROR.headline, "var(--color-state-problem)")}
    <ul class="cfail">${MOCK_ERROR.failures.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
    <div class="clinks"><button type="button" class="ilink" data-action="terminal">Open terminal</button><button type="button" class="ilink quiet" data-action="fold">Dismiss</button></div>`, "small");

export const chatLog = (s: IslandState) => s.chat.map((m) => `<div class="msg ${m.who}${m.mock ? " mock" : ""}">${esc(m.text)}</div>`).join("");

const chat = (s: IslandState) => glow("chatting", `${cardBot("chatting", "chat")}<div class="chatcol">
    <div class="ichat" id="chatLog" role="log" aria-label="Chat">${chatLog(s)}</div>
    <form class="icompose" data-chat><label for="chatInput" class="visually-hidden">Message</label><input id="chatInput" placeholder="Ask about your sessions…" autocomplete="off"><button class="isend" aria-label="Send">${ICONS.send()}</button></form>
  </div>`, "chatcard");

export const BODY: Record<Exclude<View, "compact">, (s: IslandState) => string> = { home, approval, question, done, error, chat };
/** Pages that show the tab bar (Home and Chat on the board; the alerts are bare cards). */
export const WITH_TABS: View[] = ["home", "chat"];
