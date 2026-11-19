// First launch, four steps (Onboarding board): welcome, account, connect Claude Code, ready.
// MOCK: "Install hooks" only flips a flag in memory; ~/.claude/settings.json is not touched.
import { botCanvas, GITHUB_ICON, GOOGLE_ICON } from "../../lib/dom";
import { go, type Page } from "../router";
import { toast, ui } from "../state";

const MINT = "#1af1d6", GREEN = "#2fd27a";
const TOTAL = 4;

const dots = (n: number) => `<div class="dots" role="img" aria-label="Step ${n} of ${TOTAL}">${Array.from({ length: TOTAL }, (_, i) => `<i class="${i + 1 === n ? "on" : ""}"></i>`).join("")}</div>`;
const skip = `<button type="button" class="linkbtn quiet" data-action="skip">Skip for now</button>`;

const STEPS: ((n: number) => string)[] = [
  (n) => `<span class="ob-step">Step 1 · Welcome</span>
    ${botCanvas({ anim: "wave", ground: MINT, bg: MINT, cls: "ob-bot" })}
    <h1 class="center" id="obTitle">Hi, I'm Auto</h1>
    <p class="center">I live at the top of your screen and keep an eye on your coding agents, so you don't have to watch the terminal.</p>
    <button type="button" class="btn btn-ink tall ob-push" data-action="next">Get started</button>
    <div class="ob-foot center">${dots(n)}</div>`,
  (n) => `<span class="ob-step">Step 2 · Account</span>
    <h1 id="obTitle">Create your account</h1>
    <p>It keeps your bot and settings in sync on every computer. You can skip this and use AutoAgent offline.</p>
    <button type="button" class="btn btn-ink tall" data-action="account" data-provider="GitHub" style="margin-top: var(--space-3)">${GITHUB_ICON}Continue with GitHub</button>
    <button type="button" class="btn btn-line tall" data-action="account" data-provider="Google">${GOOGLE_ICON}Continue with Google</button>
    <button type="button" class="btn btn-line tall" data-action="account" data-provider="email">Continue with email</button>
    <div class="ob-foot ob-push">${dots(n)}${skip}</div>`,
  (n) => `<span class="ob-step">Step 3 · Connect</span>
    <h1 id="obTitle">Connect Claude Code</h1>
    <p>I'll add my hooks to Claude Code's settings. Here is exactly what changes:</p>
    <pre class="diff" aria-label="Changes to Claude Code settings"><span class="dim">~/.claude/settings.json</span>
<span class="add">+ PermissionRequest → autoagent-hook</span>
<span class="add">+ PreToolUse → autoagent-hook</span>
<span class="add">+ PostToolUse → autoagent-hook</span>
<span class="add">+ Stop → autoagent-hook</span>
<span class="dim">  your own hooks stay as they are</span></pre>
    <p class="small">A dated backup is saved first.</p>
    <button type="button" class="btn btn-ink tall ob-push" data-action="install">Install hooks</button>
    <div class="ob-foot">${dots(n)}${skip}</div>`,
  (n) => `<span class="ob-step">Step 4 · Ready</span>
    ${botCanvas({ anim: "done", ground: GREEN, bg: GREEN, cls: "ob-bot" })}
    <h1 class="center" id="obTitle">You're all set</h1>
    <p class="center">Look up: I'm at the top of your screen. When Claude Code needs your OK, I'll ask right there.</p>
    <a class="btn btn-mint tall ob-push" href="#/settings/general">Start using AutoAgent</a>
    <div class="ob-foot center">${dots(n)}</div>`,
];

const stepOf = (param: string) => Math.min(TOTAL, Math.max(1, Number(param) || 1));
const next = (param: string) => go(`#/welcome/${Math.min(TOTAL, stepOf(param) + 1)}`);

export const onboarding: Page = {
  title: "Welcome",
  render: (param) => {
    const n = stepOf(param);
    return `<div class="onboard"><section class="ob-card" aria-labelledby="obTitle">${STEPS[n - 1](n)}</section></div>`;
  },
  click: (el, param) => {
    const a = el.dataset.action;
    if (a === "next" || a === "skip") next(param);
    if (a === "account") { toast(`${el.dataset.provider === "email" ? "Email" : el.dataset.provider} sign-up comes later (mock)`); next(param); }
    if (a === "install") { ui.hooksInstalled = true; ui.reviewOpen = false; toast("Hooks installed (mock: nothing was written)"); next(param); }
  },
};
