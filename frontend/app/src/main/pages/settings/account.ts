// Settings → Account & chat (SettingsAccount board). MOCK: the account is placeholder text, Sign out
// only returns to the sign-in page, and the API key field is never read, stored or sent.
import { esc } from "../../../lib/dom";
import { MOCK_ACCOUNT } from "../../../mock/data";
import { go } from "../../router";
import { toast } from "../../state";
import { row, sw, type Section } from "./section";

export const account: Section = {
  label: "Account & chat",
  lede: "Your account syncs your bot and settings. Chat answers with your own AI; keys never reach our servers.",
  body: () => `<div class="group">
    <div class="row"><div class="avatar" aria-hidden="true">${esc(MOCK_ACCOUNT.initial)}</div>
      <div class="row-text"><span class="row-title">${esc(MOCK_ACCOUNT.name)}</span><span class="row-sub">${esc(MOCK_ACCOUNT.email)} · signed in with ${esc(MOCK_ACCOUNT.provider)}</span></div>
      <button type="button" class="btn btn-line small" data-action="signout">Sign out</button></div>
    ${row("Sync settings", "Your bot, colours and preferences on every computer.", sw("sync", "Sync settings"))}
    ${row("Devices", MOCK_ACCOUNT.devices, `<button type="button" class="linkbtn strong" data-action="devices">Manage</button>`)}
  </div>
  <div class="group">
    ${row("Use my Claude subscription", "Answers through Claude Code, signed in with your own account. No key needed.", sw("subscription", "Use my Claude subscription"))}
    <div class="row"><div class="row-text"><label for="aKey" class="row-title">Anthropic API key</label><span class="row-sub" id="aKeyHelp">Kept in Windows Credential Manager or macOS Keychain.</span></div>
      <input id="aKey" class="field mono" type="password" placeholder="sk-ant-…" autocomplete="off" spellcheck="false" aria-describedby="aKeyHelp" style="width: 260px; height: 40px"></div>
    <div class="row"><label for="aModel" class="row-title">Model</label><select id="aModel" class="select"><option>Claude Sonnet</option><option>Claude Opus</option><option>Claude Haiku</option></select></div>
  </div>
  <p class="note">Plans and billing arrive in a later version.</p>`,
  click: (el) => {
    if (el.dataset.action === "signout") { toast("Signed out (mock)"); go("#/signin"); }
    if (el.dataset.action === "devices") toast("Device list comes later (mock)");
  },
  change: (el) => {
    // MOCK: the key is not saved anywhere in this build; clear it so it does not linger in the page.
    if (el.id === "aKey") { (el as HTMLInputElement).value = ""; toast("Keys are not saved in this preview build"); }
  },
};
