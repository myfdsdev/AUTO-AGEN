// Sign in (Login board): the form on the left, the dark panel on the right.
// MOCK: no account service exists yet. Every way in just continues to first launch; nothing typed here
// is kept, checked or sent.
import { botCanvas, botMark, GITHUB_ICON, GOOGLE_ICON } from "../../lib/dom";
import { go, type Page } from "../router";
import { toast } from "../state";

const MINT = "#1af1d6";

export const signin: Page = {
  title: "Sign in",
  render: () => `<div class="login">
  <main class="login-main">
    <form class="login-form" data-form="signin" novalidate>
      <h1>Sign in</h1>
      <p class="lede">Your account keeps your bot and settings in sync on every computer.</p>
      <button type="button" class="btn btn-ink tall" data-action="provider" data-provider="GitHub">${GITHUB_ICON}Continue with GitHub</button>
      <button type="button" class="btn btn-line tall" data-action="provider" data-provider="Google">${GOOGLE_ICON}Continue with Google</button>
      <div class="or">or with email</div>
      <label for="lEmail">Email</label>
      <input class="field" id="lEmail" type="email" placeholder="you@example.com" autocomplete="off" required>
      <label for="lPass">Password</label>
      <input class="field" id="lPass" type="password" placeholder="At least 8 characters" autocomplete="off" minlength="8" required>
      <div class="login-row"><label><input type="checkbox" checked>Keep me signed in</label><button type="button" class="linkbtn" data-action="forgot">Forgot password?</button></div>
      <button type="submit" class="btn btn-mint tall">Sign in</button>
      <p class="login-foot">New here? <button type="button" class="linkbtn strong" data-action="create">Create an account</button> · <button type="button" class="linkbtn" data-action="offline">Use without an account</button></p>
    </form>
  </main>
  <aside class="login-aside">
    <div class="brand">${botMark(MINT, "#000000", 34)}<span>autoagent</span></div>
    <div class="login-hero">
      ${botCanvas({ anim: "wave", ground: MINT, bg: MINT, cls: "hero-bot" })}
      <h2>Your coding agents, one glance away.</h2>
      <p>Approve commands, answer questions and see every session from the top of your screen.</p>
    </div>
    <span class="fine">Commands and code stay on your computer.</span>
  </aside>
</div>`,
  click: (el) => {
    const a = el.dataset.action;
    if (a === "provider") { toast(`${el.dataset.provider} sign-in comes later (mock)`); go("#/welcome/1"); }
    if (a === "forgot") toast("Password reset comes later (mock)");
    if (a === "create") go("#/welcome/2");
    if (a === "offline") go("#/welcome/1");
  },
  submit: (form) => {
    const email = form.querySelector<HTMLInputElement>("#lEmail")!, pass = form.querySelector<HTMLInputElement>("#lPass")!;
    const bad = [email, pass].find((f) => !f.checkValidity());
    if (bad) { bad.setAttribute("aria-invalid", "true"); bad.focus(); bad.reportValidity(); return; }
    pass.value = ""; // nothing is kept
    toast("Signed in (mock: no account service yet)");
    go("#/welcome/1");
  },
};
