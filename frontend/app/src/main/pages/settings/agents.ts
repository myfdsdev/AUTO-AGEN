// Settings → Agents (SettingsAgents board). MOCK: Install hooks and Disconnect only flip a flag in
// memory; Claude Code's settings file is never read or written in this build.
import { botMark, esc } from "../../../lib/dom";
import { MOCK_AGENT_SETTINGS, MOCK_BACKUP_NAME } from "../../../mock/data";
import { toast, ui } from "../../state";
import type { Section } from "./section";

const INK = "#14152a";

const DIFF = `<span class="dim">~/.claude/settings.json  "hooks": {</span>
<span class="add">+  "PermissionRequest": [{ "command": "autoagent-hook", "timeout": 120 }],</span>
<span class="add">+  "PreToolUse":  [{ "command": "autoagent-hook" }],</span>
<span class="add">+  "PostToolUse": [{ "command": "autoagent-hook" }],</span>
<span class="add">+  "Stop":        [{ "command": "autoagent-hook" }],</span>
<span class="dim">   …your own hooks stay exactly as they are</span>`;

const status = (id: string, soon: boolean) => {
  if (soon) return `<span class="chip soon">Coming in 1.1</span>`;
  if (id !== "claude") return "";
  return ui.hooksInstalled
    ? `<span class="chip ok">Connected</span><button type="button" class="btn btn-danger small" data-action="disconnect">Disconnect</button>`
    : ui.reviewOpen ? "" : `<button type="button" class="btn btn-ink small" data-action="connect">Connect</button>`;
};

export const agents: Section = {
  label: "Agents",
  lede: "AutoAgent listens to your coding agents through their own hooks. Nothing changes without your OK.",
  body: () => `<div class="group">${MOCK_AGENT_SETTINGS.map((a) => `<div class="row">
      <div class="agent-tile">${botMark(a.color, INK, 32)}</div>
      <div class="row-text"><span class="row-title">${esc(a.name)}</span><span class="row-sub">${esc(a.id === "claude" && !ui.hooksInstalled ? "Not connected yet" : a.note)}</span></div>
      ${status(a.id, a.soon)}</div>`).join("")}
  </div>
  ${!ui.hooksInstalled && ui.reviewOpen ? `<section class="group pad" aria-labelledby="reviewTitle">
    <span class="row-title" id="reviewTitle">Review the change to Claude Code's settings</span>
    <p class="note">A dated backup (${esc(MOCK_BACKUP_NAME)}) is saved before anything is written. If AutoAgent isn't running, Claude Code simply asks in the terminal.</p>
    <pre class="diff" aria-label="Changes to Claude Code settings">${DIFF}</pre>
    <div class="actions"><button type="button" class="btn btn-line small" data-action="cancel">Cancel</button><button type="button" class="btn btn-ink small" data-action="install">Install hooks</button></div>
  </section>` : ""}`,
  click: (el) => {
    switch (el.dataset.action) {
      case "connect": ui.reviewOpen = true; return true;
      case "cancel": ui.reviewOpen = false; return true;
      case "install": ui.hooksInstalled = true; ui.reviewOpen = false; toast("Hooks installed (mock: nothing was written)"); return true;
      case "disconnect": ui.hooksInstalled = false; ui.reviewOpen = false; toast("Hooks removed (mock: nothing was written)"); return true;
    }
  },
};
