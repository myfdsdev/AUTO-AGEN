// Settings → General, plus the two small sections without a board of their own (Updates, About).
// MOCK: changes stay in memory; nothing is applied to the system yet.
import { toast, ui } from "../../state";
import { row, sw, type Section } from "./section";

export const general: Section = {
  label: "General",
  lede: "How AutoAgent sits on your screen.",
  body: () => `<div class="group">
    ${row("Open at login", "Start AutoAgent when you sign in to your computer.", sw("login", "Open at login"))}
    ${row("Open on hover", "Point at the island to open it; otherwise click.", sw("hover", "Open on hover"))}
    ${row("Sounds", "A soft sound when an agent needs you or finishes.", sw("sounds", "Sounds"))}
    ${row("Where the island sits", "On a Mac with a notch it always sits in the notch.", `<div class="seg" role="group" aria-label="Where the island sits">
      <button type="button" data-position="centre" aria-pressed="${ui.position === "centre"}">Top centre</button>
      <button type="button" data-position="right" aria-pressed="${ui.position === "right"}">Top right</button></div>`)}
    <div class="row"><label for="gLang" class="row-title">Language</label><select id="gLang" class="select"><option>English</option><option>हिन्दी</option><option>Español</option></select></div>
  </div>
  <div class="group">
    ${row("Keyboard shortcuts", "Open the island, allow, deny and open chat from anywhere.", `<button type="button" class="btn btn-line small" data-action="shortcuts">Customise</button>`)}
  </div>`,
  click: (el) => {
    if (el.dataset.position) { ui.position = el.dataset.position as typeof ui.position; return true; }
    if (el.dataset.action === "shortcuts") toast("Shortcut editor comes later (mock)");
  },
  change: (el) => { if (el.id === "gLang") toast("Translations come later (mock)"); },
};

export const updates: Section = {
  label: "Updates",
  lede: "MOCK: no update service yet.",
  body: () => `<div class="group">
    ${row("AutoAgent 0.1.0", "UI preview build", `<button type="button" class="btn btn-line small" data-action="check">Check now</button>`)}
    ${row("Install updates automatically", "Updates are checked against their published signature before installing.", sw("autoUpdate", "Install updates automatically"))}
  </div>`,
  click: (el) => { if (el.dataset.action === "check") toast("You're on the latest version (mock)"); },
};

export const about: Section = {
  label: "About",
  lede: "AutoAgent 0.1.0 · a small friend for your coding agents.",
  body: () => `<div class="group">
    ${row("Privacy", "No telemetry. Commands and code stay on your computer.", "")}
    ${row("Licences", "Poppins and Instrument Sans fonts, SIL Open Font License.", "")}
  </div>`,
};
