// The settings shell: the shared sidebar and the chosen section (Settings* boards).
import { botMark, esc } from "../../../lib/dom";
import { sendIslandDemo } from "../../../lib/tauri";
import type { Page } from "../../router";
import { ui } from "../../state";
import { account } from "./account";
import { agents } from "./agents";
import { bot } from "./bot";
import { about, general, updates } from "./general";
import type { Section } from "./section";

const SECTIONS: Record<string, Section> = { general, agents, bot, account, updates, about };
const ORDER = ["general", "agents", "bot", "account", "updates", "about"];
const sectionOf = (param: string) => (param in SECTIONS ? param : "general");

// dev builds only: buttons that step the island through its pages
const ISLAND_PAGES = ["compact", "home", "approval", "question", "done", "error", "chat"];
const devDemo = () => (import.meta.env.DEV
  ? `<div class="dev-demo"><label for="devIsland">Dev · island page</label><select id="devIsland" class="select">${ISLAND_PAGES.map((v) => `<option>${v}</option>`).join("")}</select></div>`
  : "");

export const settings: Page = {
  title: "Settings",
  render: (param) => {
    const key = sectionOf(param), s = SECTIONS[key];
    return `<div class="settings">
  <nav class="set-nav" aria-label="Settings sections">
    <div class="set-brand">${botMark("#14152a", "#f5f6fa", 28)}<span>autoagent</span></div>
    ${ORDER.map((k) => `<a href="#/settings/${k}"${k === key ? ' aria-current="page"' : ""}>${esc(SECTIONS[k].label)}</a>`).join("")}
    ${devDemo()}
  </nav>
  <main class="set-main" id="setMain" tabindex="-1" aria-labelledby="setTitle">
    <div class="set-head"><h1 id="setTitle">${esc(s.label)}</h1><p>${esc(s.lede)}</p></div>
    ${s.body()}
  </main>
</div>`;
  },
  click: (el, param) => {
    if (el.dataset.toggle) {
      const k = el.dataset.toggle;
      ui.toggles[k] = !ui.toggles[k];
      el.setAttribute("aria-checked", String(ui.toggles[k]));
      return;
    }
    return SECTIONS[sectionOf(param)].click?.(el);
  },
  change: (el, param) => {
    if (el.id === "devIsland") { void sendIslandDemo((el as HTMLSelectElement).value); return; }
    return SECTIONS[sectionOf(param)].change?.(el);
  },
};

