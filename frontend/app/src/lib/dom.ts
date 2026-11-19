// Small DOM helpers shared by both windows.

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/** Escapes text for use inside HTML markup and attribute values. */
export const esc = (s: unknown) =>
  String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string);

/** A <canvas class="bot"> drawn by bot/botCanvas.ts. */
export const botCanvas = (o: { anim: string; ground: string; bg?: string; ink?: string; face?: string; outfit?: string; cls?: string; label?: string }) =>
  `<canvas class="bot ${o.cls ?? ""}" data-anim="${esc(o.anim)}" data-ground="${esc(o.ground)}"` +
  (o.bg ? ` data-bg="${esc(o.bg)}"` : "") + (o.ink ? ` data-ink="${esc(o.ink)}"` : "") +
  (o.face ? ` data-face="${esc(o.face)}"` : "") + (o.outfit ? ` data-outfit="${esc(o.outfit)}"` : "") +
  (o.label ? ` role="img" aria-label="${esc(o.label)}"` : ` aria-hidden="true"`) + `></canvas>`;

/** The flat bot mark (logo) from the boards, as SVG. `fill` is the body, `hole` the visor. */
export const botMark = (fill: string, hole: string, w = 28) =>
  `<svg width="${w}" height="${Math.round(w * 1.1)}" viewBox="0 0 100 110" aria-hidden="true"><circle cx="50" cy="11" r="8" fill="${fill}"/><rect x="46" y="14" width="8" height="10" fill="${fill}"/><rect x="8" y="22" width="84" height="52" rx="24" fill="${fill}"/><rect x="21" y="33" width="58" height="31" rx="14" fill="${hole}"/><rect x="32" y="41" width="13" height="10" rx="4" fill="${fill}"/><rect x="55" y="41" width="13" height="10" rx="4" fill="${fill}"/><rect x="43" y="80" width="14" height="26" rx="7" fill="${fill}"/><rect x="21" y="78" width="11" height="20" rx="5.5" fill="${fill}" transform="rotate(38 26.5 88)"/><rect x="68" y="78" width="11" height="20" rx="5.5" fill="${fill}" transform="rotate(-38 73.5 88)"/></svg>`;

const icon = (d: string, size: number, extra = "") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;

/** Outline icons on a 24 px grid, 2 px stroke, round ends (Foundations board, "Icons"). */
export const ICONS = {
  home: (s = 18) => icon('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>', s),
  chat: (s = 18) => icon('<path d="M4 5h16v11H9l-5 4z"/>', s),
  settings: (s = 18) => icon('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>', s),
  allow: (s = 18) => icon('<path d="M5 12l5 5 9-10"/>', s),
  deny: (s = 18) => icon('<path d="M6 6l12 12M18 6L6 18"/>', s),
  terminal: (s = 18) => icon('<path d="M4 17l6-6-6-6M12 19h8"/>', s),
  new: (s = 18) => icon('<path d="M12 5v14M5 12h14"/>', s),
  sound: (s = 18) => icon('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>', s),
  muted: (s = 18) => icon('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l4 6M21 9l-4 6"/>', s),
  close: (s = 16) => icon('<path d="M6 6l12 12M18 6L6 18"/>', s, ' stroke-width="2.2"'),
  send: (s = 16) => icon('<path d="M12 19V5M6 11l6-6 6 6"/>', s, ' stroke-width="2.4"'),
};

export const GITHUB_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>';
export const GOOGLE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z"/></svg>';
