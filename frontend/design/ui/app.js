// AutoAgent desktop v1 · prototype behaviour. Plain JS on purpose: the real Tauri frontend will be
// vanilla TypeScript, and this file is the spec for it. Data below is example data, not a real session.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

  // ---------------------------------------------------------------- state
  const STATES = {
    idle: { anim: "idle", col: "#1af1d6", label: "Idle" }, working: { anim: "work", col: "#4c8dff", label: "Working" },
    waiting: { anim: "alert", col: "#ffb020", label: "Needs you" }, success: { anim: "done", col: "#2fd27a", label: "Success" },
    error: { anim: "error", col: "#ff5a5f", label: "Error" }, sleeping: { anim: "sleep", col: "#8a5cff", label: "Sleeping" },
    chatting: { anim: "wave", col: "#ff6fa5", label: "Chatting" }, offline: { anim: "idle", col: "#9aa3b5", label: "Offline" },
  };
  const VIEW_STATE = { hidden: "idle", compact: "working", sessions: "working", approval: "waiting", question: "waiting", done: "success", error: "error", chat: "chatting" };
  const FACES = [["none", "None"], ["glasses", "Glasses"], ["shades", "Shades"], ["blush", "Blush"], ["hearts", "Heart eyes"], ["stars", "Star eyes"], ["moustache", "Moustache"]];
  const OUTFITS = [["none", "None"], ["party", "Party hat"], ["beanie", "Beanie"], ["crown", "Crown"], ["wizard", "Wizard"], ["bow", "Bow"], ["headphones", "Headphones"], ["bowtie", "Bow tie"], ["scarf", "Scarf"]];
  const S = { platform: "mac", view: "compact", face: "none", outfit: "none", preview: "idle", page: "general", step: 0, connected: true, connecting: false, note: "", chat: [], answer: 0, toggles: { login: true, sounds: true, hover: true, sync: true, sub: false, updates: true } };

  // ---------------------------------------------------------------- the bot, drawn by the real character code
  const drawBot = (cv, t) => {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const key = cv.dataset.state, st = STATES[key === "auto" ? VIEW_STATE[S.view] : key === "preview" ? S.preview : key] || STATES.idle;
    const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); const bg = cv.dataset.bg || st.col; if (bg === "none") c.clearRect(0, 0, w, h); else { c.fillStyle = bg; c.fillRect(0, 0, w, h); }
    const s = Math.min(w / 1.45, h / 1.78);
    window.AABot.drawPosed(c, w / 2, h * 0.47, s, cv.dataset.anim || st.anim, t, { ground: cv.dataset.hole || st.col, face: cv.dataset.face || S.face, outfit: cv.dataset.outfit || S.outfit });
  };
  const loop = (now) => { const t = (now / 1000) % 4; $$("canvas.bot").forEach((cv) => drawBot(cv, t)); requestAnimationFrame(loop); };

  // ---------------------------------------------------------------- the island (layout after Coucou's: a thin
  // black bar when compact; open, a tab bar and rounded dark cards with the bot on the left and a glow in the
  // state's colour underneath)
  const island = $("#island"), inner = $("#islandInner");
  const WIDTH = { hidden: 200, compact: 320, sessions: 660, approval: 660, question: 660, done: 660, error: 660, chat: 660 };
  const CARD_BG = "#141519";
  const AGENTS = [
    { id: "cc", name: "Claude Code", proj: "auto-agent-web", state: "working" },
    { id: "cx", name: "Codex", proj: "landing-page", state: "success" },
    { id: "gm", name: "Gemini CLI", proj: "docs-site", state: "sleeping" },
    { id: "cu", name: "Cursor", proj: "mobile-app", state: "idle" },
  ];
  const svg = (d, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    home: svg('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>', 16), chat: svg('<path d="M4 5h16v11H9l-5 4z"/>', 16), plus: svg('<path d="M12 5v14M5 12h14"/>', 16),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>', 16),
    sound: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>', 16), close: svg('<path d="M6 6l12 12M18 6L6 18"/>', 14),
  };
  // the bot, drawn straight onto the dark card; its visor shows the card through it
  const bigBot = (state, anim, extra = "") => `<div class="cbot">${extra}<canvas class="bot" data-state="${state}" ${anim ? `data-anim="${anim}"` : ""} data-bg="none" data-hole="${CARD_BG}"></canvas></div>`;
  const miniBot = (a) => `<canvas class="bot mini" data-state="${a.state}" data-bg="${STATES[a.state].col}"></canvas>`;
  const glowCard = (state, inside, cls = "") => `<article class="icard ${cls}" style="--g:${STATES[state].col}">${inside}</article>`;
  const tabs = () => `<div class="itabs">
      <div class="tabs-l" role="tablist"><button role="tab" class="itab" aria-selected="${S.view !== "chat"}" data-action="open" aria-label="Home">${I.home}</button><button role="tab" class="itab" aria-selected="${S.view === "chat"}" data-action="chat" aria-label="Chat">${I.chat}</button><button class="itab" data-action="new" aria-label="New session">${I.plus}</button></div>
      <div class="tabs-r"><button class="itab" data-action="settings" aria-label="Settings">${I.gear}</button><button class="itab" data-action="mute" aria-label="Sounds">${I.sound}</button><button class="itab" data-action="fold" aria-label="Fold the island">${I.close}</button></div></div>`;
  const keyBtn = (cls, label, key, action) => `<button class="kbtn ${cls}" data-action="${action}">${label}<kbd>${key}</kbd></button>`;

  const BODY = {
    sessions: () => `<div class="igrid">
      ${glowCard("working", `${bigBot("working")}<div class="cmain">
        <div class="cline"><i class="dot" style="background:var(--blue)"></i><b>auto-agent-web</b><span>Claude Code · working</span></div>
        <ul class="isteps"><li><span>Read</span><code>src/api.ts</code></li><li><span>Edit</span><code>src/api.ts</code><em class="add">+12</em><em class="del">−3</em></li><li class="now"><span>Run</span><code>npm test</code></li></ul>
        <div class="clinks"><button data-action="terminal">Open terminal</button><button data-action="diff">View diff</button></div></div>`)}
      <article class="icard pills">${AGENTS.slice(1).concat(AGENTS[0]).map((a) => `<button class="apill" data-action="open">${miniBot(a)}<span><b>${a.name}</b><small>${a.proj}</small></span><i class="dot" style="background:${STATES[a.state].col}"></i></button>`).join("")}</article></div>`,
    approval: () => glowCard("waiting", `${bigBot("waiting", "alert")}<div class="cmain">
        <div class="cline"><i class="dot" style="background:#fff"></i><b>auto-agent-web</b><span>needs permission</span></div>
        <div class="icmd"><code>npm install zod</code></div>
        <div class="kbtns">${keyBtn("", "Deny", "N", "deny")}${keyBtn("primary", "Allow", "Y", "allow")}${keyBtn("", "Always", "A", "always")}<button class="clink" data-action="terminal">Reply in terminal</button></div></div>`, "wide"),
    question: () => glowCard("waiting", `${bigBot("waiting", "alert", '<span class="badge">?</span>')}<div class="cmain">
        <div class="cline"><i class="dot" style="background:#fff"></i><b>auto-agent-web</b><span>asks a question</span></div>
        <p class="cq">Where should sessions be stored?</p>
        <div class="kbtns">${["Supabase", "SQLite", "Decide later"].map((o, i) => `<button class="kbtn ${S.answer === i ? "primary" : ""}" data-answer="${i}">${o}<kbd>${i + 1}</kbd></button>`).join("")}<button class="clink" data-action="answer">Send</button></div></div>`, "wide"),
    done: () => glowCard("success", `${bigBot("success", "done")}<div class="cmain">
        <div class="cline"><i class="dot" style="background:var(--green)"></i><b>auto-agent-web</b><span>finished in 1m 42s</span></div>
        <p class="cq">Added zod validation to the sessions API</p>
        <div class="cstats"><span><b>4</b> files</span><span class="add"><b>+86</b></span><span class="del"><b>−12</b></span></div>
        <div class="kbtns">${keyBtn("primary", "View changes", "↵", "diff")}${keyBtn("", "Open terminal", "T", "terminal")}</div></div>`, "wide"),
    error: () => glowCard("error", `${bigBot("error", "error")}<div class="cmain">
        <div class="cline"><i class="dot" style="background:var(--red)"></i><b>auto-agent-web</b><span>2 tests failed</span></div>
        <div class="icmd err"><code>✕ rejects an unknown agent</code><code>✕ parses an empty list</code></div>
        <div class="kbtns">${keyBtn("primary", "Open terminal", "T", "terminal")}${keyBtn("", "Dismiss", "Esc", "fold")}</div></div>`, "wide"),
    chat: () => glowCard("chatting", `${bigBot("chatting", "idle")}<div class="cmain chatcol">
        <div class="ichat" id="chatLog"><div class="msg ai">Hi! Ask me about your sessions. Claude Code has been working on auto-agent-web for 6 minutes.</div>${S.chat.map((m) => `<div class="msg ${m.who}">${esc(m.text)}</div>`).join("")}</div>
        <form class="icompose" data-chat><input id="chatInput" placeholder="Ask about your sessions…" aria-label="Message" autocomplete="off"><button class="isend" aria-label="Send">↑</button></form></div>`, "wide tall"),
  };

  const compact = () => `<button class="ibar" data-action="open" aria-label="Open AutoAgent: ${S.note ? esc(S.note) : "Claude Code is working on auto-agent-web"}">
      <canvas class="bot barbot" data-state="auto" data-bg="none" data-hole="#000"></canvas>
      <span class="bartext">${S.note ? esc(S.note) : ""}</span>
      <span class="minigrid">${AGENTS.map(miniBot).join("")}</span></button>`;

  const fit = () => {
    const w = WIDTH[S.view]; inner.style.width = w + "px"; island.style.width = w + "px";
    island.style.height = (S.view === "hidden" ? 8 : inner.offsetHeight) + "px";
  };
  const renderIsland = () => {
    island.dataset.view = S.view; const sc = STATES[VIEW_STATE[S.view]].col;
    island.style.setProperty("--state", sc);
    inner.innerHTML = S.view === "hidden" ? "" : S.view === "compact" ? compact() : tabs() + `<div class="ibody">${BODY[S.view]()}</div>`;
    fit();
    $$("[data-view]", $(".dock")).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === S.view)));
  };
  const setView = (v, note = "") => { S.view = v; S.note = note; renderIsland(); };

  island.addEventListener("mouseenter", () => { if (S.view === "hidden") setView("compact"); });
  island.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]")?.dataset.action, ans = e.target.closest("[data-answer]");
    if (ans) { S.answer = +ans.dataset.answer; renderIsland(); return; }
    if (a === "open") setView("sessions");
    if (a === "chat") setView("chat");
    if (a === "fold") setView("compact");
    if (a === "settings") openSettings();
    if (a === "allow") setView("compact", "Allowed · npm install zod");
    if (a === "always") setView("compact", "Always allowed · npm install");
    if (a === "deny") setView("compact", "Denied · npm install zod");
    if (a === "answer") setView("compact", "Answered · Supabase");
    if (a === "terminal") setView("compact", "Opened the terminal");
  });
  island.addEventListener("submit", (e) => {
    e.preventDefault(); const input = $("#chatInput"), text = input.value.trim(); if (!text) return;
    S.chat.push({ who: "me", text }, { who: "ai", text: "This is the prototype, so I can't answer yet. In the app, your own Claude subscription or API key answers here." });
    renderIsland(); $("#chatInput")?.focus(); const log = $("#chatLog"); if (log) log.scrollTop = log.scrollHeight;
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return; const k = e.key.toLowerCase();
    if (S.view === "approval") { if (k === "y" || k === "enter") setView("compact", "Allowed · npm install zod"); if (k === "n" || k === "escape") setView("compact", "Denied · npm install zod"); if (k === "a") setView("compact", "Always allowed · npm install"); }
    if (S.view === "question" && "123".includes(k)) { S.answer = +k - 1; renderIsland(); }
  });

  // ---------------------------------------------------------------- settings
  const settings = $("#settings"), nav = $("#setNav"), main = $("#setMain");
  const ICON = {
    general: '<path d="M4 6h16M4 12h16M4 18h10"/>', agents: '<rect x="4" y="5" width="16" height="12" rx="3"/><path d="M9 21h6M12 17v4"/>', bot: '<rect x="4" y="7" width="16" height="10" rx="5"/><path d="M12 7V4"/><circle cx="12" cy="3" r="1"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>', account: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', updates: '<path d="M12 4v10M7 9l5 5 5-5M5 20h14"/>', about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  };
  const PAGES = [["general", "General"], ["agents", "Agents"], ["bot", "Your bot"], ["chat", "Chat & keys"], ["account", "Account"], ["updates", "Updates"], ["about", "About"]];
  const sw = (k, label) => `<button class="switch" role="switch" aria-checked="${S.toggles[k]}" data-toggle="${k}" aria-label="${esc(label)}"></button>`;
  const DIFF = `<span class="dim">~/.claude/settings.json</span>
<span class="dim">  "hooks": {</span>
<span class="add">+   "PermissionRequest": [{ "hooks": [{ "type": "command",</span>
<span class="add">+       "command": "autoagent-hook", "timeout": 120 }] }],</span>
<span class="add">+   "PreToolUse":  [{ "hooks": [{ "type": "command", "command": "autoagent-hook" }] }],</span>
<span class="add">+   "PostToolUse": [{ "hooks": [{ "type": "command", "command": "autoagent-hook" }] }],</span>
<span class="add">+   "Stop":        [{ "hooks": [{ "type": "command", "command": "autoagent-hook" }] }],</span>
<span class="dim">    …your own hooks stay exactly as they are</span>
<span class="dim">  }</span>`;

  const PAGE = {
    general: () => `<h2>General</h2><p class="lede">How AutoAgent sits on your screen.</p>
      <div class="group">
        <div class="row"><div class="grow"><b>Open at login</b><small>Start AutoAgent when you sign in to your computer.</small></div>${sw("login", "Open at login")}</div>
        <div class="row"><div class="grow"><b>Open on hover</b><small>Point at the island to open it; otherwise click.</small></div>${sw("hover", "Open on hover")}</div>
        <div class="row"><div class="grow"><b>Sounds</b><small>A soft sound when an agent needs you or finishes.</small></div>${sw("sounds", "Sounds")}</div>
        <div class="row"><div class="grow"><b>Where the island sits</b><small>On a Mac with a notch it always sits in the notch.</small></div><div class="seg" role="group" aria-label="Island position"><button aria-pressed="true">Top centre</button><button aria-pressed="false">Top right</button></div></div>
        <div class="row"><div class="grow"><b>Language</b></div><select class="select" aria-label="Language"><option>English</option><option>हिन्दी</option><option>Español</option><option>Deutsch</option></select></div>
      </div>`,
    agents: () => `<h2>Agents</h2><p class="lede">AutoAgent listens to your coding agents through their own hooks. Nothing is changed without your OK.</p>
      <div class="group">
        <div class="row"><span class="agent-logo" style="background:#d97757">CC</span><div class="grow"><b>Claude Code</b><small>${S.connected ? "Hooks installed in ~/.claude/settings.json" : "Not connected yet"}</small></div>${S.connected ? '<span class="ok-chip">✓ Connected</span><button class="btn btn-line" data-agent="disconnect" style="height:34px">Disconnect</button>' : '<button class="btn btn-ink" data-agent="connect" style="height:36px">Connect</button>'}</div>
        <div class="row"><span class="agent-logo" style="background:#10a37f">CX</span><div class="grow"><b>Codex</b><small>Sessions and approvals</small></div><span class="soon">Coming in 1.1</span></div>
        <div class="row"><span class="agent-logo" style="background:#4c8dff">GM</span><div class="grow"><b>Gemini CLI</b><small>Sessions</small></div><span class="soon">Coming in 1.1</span></div>
      </div>
      ${S.connecting ? `<div class="group" style="padding:18px"><b>Review the change to Claude Code's settings</b><p class="note">A dated backup (settings.json.bak-20261119-1612) is saved before anything is written. If AutoAgent isn't running, Claude Code simply asks in the terminal.</p><pre class="diff">${DIFF}</pre><div class="actions" style="margin-top:14px"><button class="btn btn-line" data-agent="cancel">Cancel</button><button class="btn btn-ink" data-agent="install">Install hooks</button></div></div>` : ""}`,
    bot: () => `<h2>Your bot</h2><p class="lede">Dress it up. The island, the tray and every card use it.</p>
      <div class="bot-page">
        <div class="preview"><canvas class="bot" data-state="preview" aria-label="Bot preview"></canvas>
          <div class="swatches" role="group" aria-label="Preview a state">${Object.entries(STATES).map(([k, v]) => `<button class="swatch" style="background:${v.col}" data-preview="${k}" aria-pressed="${S.preview === k}" aria-label="${v.label}" title="${v.label}"></button>`).join("")}</div>
          <div class="prev-label">Previewing: <b>${STATES[S.preview].label}</b></div></div>
        <div><h3 class="pick-title">Face item</h3><div class="picks">${FACES.map(([k, l]) => `<button class="pick" data-face="${k}" aria-pressed="${S.face === k}"><canvas class="bot" data-state="idle" data-face="${k}" data-outfit="none"></canvas>${l}</button>`).join("")}</div>
          <h3 class="pick-title">Outfit</h3><div class="picks">${OUTFITS.map(([k, l]) => `<button class="pick" data-outfit="${k}" aria-pressed="${S.outfit === k}"><canvas class="bot" data-state="idle" data-face="none" data-outfit="${k}"></canvas>${l}</button>`).join("")}</div></div>
      </div>`,
    chat: () => `<h2>Chat & keys</h2><p class="lede">Chat answers with your own AI. Keys stay in your system's key store and never reach our servers.</p>
      <div class="group">
        <div class="row"><div class="grow"><b>Use my Claude subscription</b><small>Answers through Claude Code, signed in with your own account. No key needed.</small></div>${sw("sub", "Use my Claude subscription")}</div>
        <div class="row"><div class="grow"><b>Anthropic API key</b><small>Stored in Windows Credential Manager / macOS Keychain.</small></div><input class="field" type="password" value="sk-ant-xxxxxxxxxxxx" aria-label="Anthropic API key"></div>
        <div class="row"><div class="grow"><b>Model</b></div><select class="select" aria-label="Model"><option>Claude Sonnet</option><option>Claude Opus</option><option>Claude Haiku</option></select></div>
      </div>`,
    account: () => `<h2>Account</h2><p class="lede">Your account keeps your bot, settings and devices in sync.</p>
      <div class="group">
        <div class="row"><span class="agent-logo" style="background:var(--violet)">A</span><div class="grow"><b>Alex Rivera</b><small>alex@example.com · signed in with GitHub</small></div><button class="btn btn-line" style="height:34px">Sign out</button></div>
        <div class="row"><div class="grow"><b>Sync settings</b><small>Your bot, colours and preferences on every computer.</small></div>${sw("sync", "Sync settings")}</div>
        <div class="row"><div class="grow"><b>This computer</b><small>Windows 11 · AutoAgent 1.0.0 · last seen now</small></div></div>
      </div>`,
    updates: () => `<h2>Updates</h2><p class="lede">You're on the latest version.</p>
      <div class="group">
        <div class="row"><div class="grow"><b>AutoAgent 1.0.0</b><small>Checked 2 minutes ago</small></div><button class="btn btn-line" style="height:34px">Check now</button></div>
        <div class="row"><div class="grow"><b>Install updates automatically</b><small>Downloads are checked against their published fingerprint before installing.</small></div>${sw("updates", "Install updates automatically")}</div>
      </div>`,
    about: () => `<h2>About</h2><p class="lede">AutoAgent 1.0.0 · a small friend for your coding agents.</p>
      <div class="group"><div class="row"><div class="grow"><b>Privacy</b><small>No telemetry. Commands and code stay on your computer.</small></div></div><div class="row"><div class="grow"><b>Licences</b><small>Poppins and Instrument Sans fonts, SIL Open Font License.</small></div></div></div>`,
  };
  const renderSettings = () => {
    nav.innerHTML = `<div class="set-brand"><canvas class="bot" data-state="idle"></canvas>autoagent</div>` + PAGES.map(([k, l]) => `<button class="nav-item" data-page="${k}" ${S.page === k ? 'aria-current="page"' : ""}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>${l}</button>`).join("");
    main.innerHTML = PAGE[S.page]();
  };
  const openSettings = (page) => { if (page) S.page = page; settings.hidden = false; renderSettings(); };
  settings.addEventListener("click", (e) => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.matches("[data-close-settings]")) settings.hidden = true;
    if (t.dataset.page) { S.page = t.dataset.page; renderSettings(); }
    if (t.dataset.toggle) { S.toggles[t.dataset.toggle] = !S.toggles[t.dataset.toggle]; t.setAttribute("aria-checked", String(S.toggles[t.dataset.toggle])); }
    if (t.dataset.preview) { S.preview = t.dataset.preview; renderSettings(); }
    if (t.matches(".pick[data-face]")) { S.face = t.dataset.face; renderSettings(); }
    if (t.matches(".pick[data-outfit]")) { S.outfit = t.dataset.outfit; renderSettings(); }
    if (t.dataset.agent === "connect") { S.connecting = true; renderSettings(); }
    if (t.dataset.agent === "cancel") { S.connecting = false; renderSettings(); }
    if (t.dataset.agent === "install") { S.connecting = false; S.connected = true; renderSettings(); }
    if (t.dataset.agent === "disconnect") { S.connected = false; renderSettings(); }
    if (t.closest(".seg")) $$("button", t.closest(".seg")).forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
  });

  // ---------------------------------------------------------------- first launch
  const onboard = $("#onboard"), box = $("#onboardBox");
  const gh = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>';
  const go = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z"/></svg>';
  const STEPS = [
    () => `<canvas class="bot ob-bot" data-state="idle" data-anim="wave"></canvas><h1 id="obTitle">Hi, I'm Auto</h1><p>I live at the top of your screen and keep an eye on your coding agents, so you don't have to watch the terminal.</p><div class="ob-actions"><button class="btn btn-ink" data-ob="next">Get started</button></div>`,
    () => `<canvas class="bot ob-bot" data-state="chatting" data-anim="idle"></canvas><h1 id="obTitle">Create your account</h1><p>It keeps your bot and settings in sync on every computer.</p><div class="ob-actions"><button class="btn btn-ink prov" data-ob="next">${gh}Continue with GitHub</button><button class="btn btn-line prov" data-ob="next">${go}Continue with Google</button><button class="btn btn-line" data-ob="next">Continue with email</button></div>`,
    () => `<h1 id="obTitle">Connect Claude Code</h1><p>I'll add my hooks to Claude Code's settings. Here's exactly what changes:</p><pre class="diff" style="margin-top:16px;font-size:11.5px">${DIFF}</pre><p class="note" style="text-align:left">A dated backup is saved first. Your own hooks stay untouched.</p><div class="ob-actions" style="margin-top:6px"><button class="btn btn-ink" data-ob="next">Install hooks</button></div>`,
    () => `<canvas class="bot ob-bot" data-state="success" data-anim="done"></canvas><h1 id="obTitle">You're all set</h1><p>Look up: I'm at the top of your screen. When Claude Code needs your OK, I'll ask right there.</p><div class="ob-actions"><button class="btn btn-mint" data-ob="finish">Start using AutoAgent</button></div>`,
  ];
  const renderOnboard = () => { box.innerHTML = STEPS[S.step]() + `<div class="ob-foot"><div class="dots" aria-label="Step ${S.step + 1} of ${STEPS.length}">${STEPS.map((_, i) => `<i class="${i === S.step ? "on" : ""}"></i>`).join("")}</div>${S.step > 0 && S.step < STEPS.length - 1 ? '<button class="skip" data-ob="skip">Skip for now</button>' : ""}</div>`; };
  const openOnboard = () => { S.step = 0; onboard.hidden = false; renderOnboard(); };
  box.addEventListener("click", (e) => {
    const a = e.target.closest("[data-ob]")?.dataset.ob; if (!a) return;
    if (a === "next" || a === "skip") { S.step = Math.min(STEPS.length - 1, S.step + 1); renderOnboard(); }
    if (a === "finish") { onboard.hidden = true; setView("compact", "Watching Claude Code"); }
  });
  onboard.addEventListener("keydown", (e) => { if (e.key === "Escape") onboard.hidden = true; });

  // ---------------------------------------------------------------- prototype dock
  $(".dock").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.view) setView(b.dataset.view);
    if (b.dataset.platform) { S.platform = b.dataset.platform; document.body.className = S.platform; $$("[data-platform]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); requestAnimationFrame(fit); }
    if (b.matches("[data-open-settings]")) openSettings();
    if (b.matches("[data-open-onboard]")) openOnboard();
  });

  renderIsland();
  requestAnimationFrame(loop);
  window.addEventListener("resize", fit);
})();
