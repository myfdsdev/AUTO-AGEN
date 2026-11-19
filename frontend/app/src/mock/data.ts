// ============================================================================================
// MOCK DATA. Everything in this file is made-up example data for the UI-only build: there is no
// hook server, no agent connection and no account yet. Replace these with real sources later.
// ============================================================================================
import type { Anim, FaceItem, Outfit } from "../bot/glyphPose";

export type BotState = "ready" | "working" | "needsYou" | "done" | "problem" | "paused" | "chatting" | "offline";

/** The bot's eight states, with their colour token and animation (Foundations board, "State"). */
export const STATES: Record<BotState, { label: string; color: string; anim: Anim }> = {
  ready: { label: "Ready", color: "#1af1d6", anim: "idle" },
  working: { label: "Working", color: "#4c8dff", anim: "work" },
  needsYou: { label: "Needs you", color: "#ffb020", anim: "alert" },
  done: { label: "Done", color: "#2fd27a", anim: "done" },
  problem: { label: "Problem", color: "#ff5a5f", anim: "error" },
  paused: { label: "Paused", color: "#8a5cff", anim: "sleep" },
  chatting: { label: "Chatting", color: "#ff6fa5", anim: "wave" },
  offline: { label: "Offline", color: "#9aa3b5", anim: "idle" },
};
export const STATE_ORDER: BotState[] = ["ready", "working", "needsYou", "done", "problem", "paused", "chatting", "offline"];

export type Agent = { id: string; name: string; short: string; color: string; project: string; state: BotState };

/** MOCK: the four agents shown in the island. Only Claude Code will be real in 1.0. */
export const MOCK_AGENTS: Agent[] = [
  { id: "claude", name: "Claude Code", short: "Claude", color: "#ff8a5c", project: "auto-agent-web", state: "working" },
  { id: "codex", name: "Codex", short: "Codex", color: "#2fd27a", project: "landing-page", state: "done" },
  { id: "gemini", name: "Gemini CLI", short: "Gemini CLI", color: "#5b8cff", project: "docs-site", state: "paused" },
  { id: "cursor", name: "Cursor", short: "Cursor", color: "#a77bff", project: "mobile-app", state: "ready" },
];

/** MOCK: the focused Claude Code session. */
export const MOCK_SESSION = {
  project: "auto-agent-web",
  steps: [
    { verb: "Read", target: "src/api.ts" },
    { verb: "Edit", target: "src/api.ts", add: 12, del: 3 },
    { verb: "Run", target: "npm test", now: true },
  ],
};

/** MOCK: a permission request from Claude Code. */
export const MOCK_APPROVAL = { project: "auto-agent-web", command: "npm install zod", always: "npm install" };

/** MOCK: a question from Claude Code. */
export const MOCK_QUESTION = { project: "auto-agent-web", text: "Where should sessions be stored?", options: ["Supabase", "SQLite", "Decide later"] };

/** MOCK: a finished session and a failed one. */
export const MOCK_DONE = { project: "auto-agent-web", took: "1m 42s", summary: "Added zod validation to the sessions API", files: 4, add: 86, del: 12 };
export const MOCK_ERROR = { project: "auto-agent-web", headline: "2 tests failed", failures: ["rejects an unknown agent", "parses an empty list"] };

/** MOCK: the chat's opening exchange (Island board, "Chat"). */
export const MOCK_CHAT = [
  { who: "me" as const, text: "What changed in auto-agent-web today?" },
  { who: "ai" as const, text: "Claude Code added zod validation to the sessions API and installed zod with your OK. Tests are running now." },
];
/** Placeholder reply until a real AI is connected. */
export const CHAT_PLACEHOLDER_REPLY = "Mock reply: the connected AI answers here later.";

/** MOCK: the agents list in Settings → Agents. */
export const MOCK_AGENT_SETTINGS = [
  { id: "claude", name: "Claude Code", color: "#ff8a5c", note: "Hooks installed in ~/.claude/settings.json", soon: false },
  { id: "codex", name: "Codex", color: "#2fd27a", note: "Sessions and approvals", soon: true },
  { id: "gemini", name: "Gemini CLI", color: "#5b8cff", note: "Sessions", soon: true },
  { id: "cursor", name: "Cursor", color: "#a77bff", note: "Sessions and approvals", soon: true },
];

/** MOCK: the signed-in account (placeholders, as on the Account board). */
export const MOCK_ACCOUNT = { name: "[YOUR NAME]", email: "[you@example.com]", provider: "GitHub", initial: "A", devices: "This Windows PC (now) · MacBook Air (2 days ago)" };

/** MOCK: the backup file name shown before hooks are installed. */
export const MOCK_BACKUP_NAME = "settings.json.bak-20261119-1612";

/** Face items and outfits the bot can wear (drawPosed supports all of them). */
export const FACES: [FaceItem, string][] = [["none", "None"], ["glasses", "Glasses"], ["shades", "Shades"], ["blush", "Blush"], ["hearts", "Heart eyes"], ["stars", "Star eyes"], ["moustache", "Moustache"]];
export const OUTFITS: [Outfit, string][] = [["none", "None"], ["party", "Party hat"], ["beanie", "Beanie"], ["crown", "Crown"], ["wizard", "Wizard"], ["bow", "Bow"], ["headphones", "Headphones"], ["bowtie", "Bow tie"], ["scarf", "Scarf"]];
