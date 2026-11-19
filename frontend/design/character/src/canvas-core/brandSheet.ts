// AUTOAGENT · logo and brand sheet, in the manner of Conceptic's logo work (dribbble.com/Conceptic,
// studied in the browser, never copied): one simple geometric idea per mark, built on a grid with
// negative space, a vivid gradient, rounded terminals, a lowercase geometric wordmark with tight
// tracking, and the presentation those shots use (the mark on dark, on light, as app-icon tiles).
//
// THE MARK: the AutoAgent bot's head reduced to geometry. A soft box head in a warm gradient
// (orange -> pink -> violet), the visor cut out as negative space, two cool mint->cyan eyes in it,
// side dials, and the antenna whose ball is the status light. The eyes carry the bot's moods, so
// the same mark becomes five status icons. A monoline version is one stroke weight with round caps.
import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import { POPPINS_BOLD } from "../../assets/fonts/poppinsBold";
import { registerFaces } from "./launchLook";

// the inlined copy of Poppins Bold (the .ttf import path breaks on Windows drive-letter paths)
registerFaces([{ family: "Poppins", file: { data: POPPINS_BOLD, format: "ttf", path: "Poppins-Bold.ttf" } } as never]);

const W = 1600, H = 900;
const WARM: [number, string][] = [[0, "#ffae3d"], [0.5, "#ff4f7b"], [1, "#8a5cff"]];
const COOL: [number, string][] = [[0, "#4ff5c8"], [1, "#3aa2ff"]];
const DARK = "#0e0f1a", INK = "#14152a", LIGHT = "#f5f5f8";
type Mood = "idle" | "working" | "waiting" | "done" | "error";
const MC: Record<Mood, string> = { idle: "#3fe0c0", working: "#4c8dff", waiting: "#ffb020", done: "#33d17f", error: "#ff4f5a" };

const grad = (c: Ctx, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); return g; };
const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

// the mark, centred at (cx, cy), `s` = head width in px
const mark = (c: Ctx, cx: number, cy: number, s: number, o: { bg: string; mood?: Mood; mono?: boolean; status?: boolean }) => {
  const u = (v: number) => v * s, m = o.mood ?? "idle";
  c.save(); c.translate(cx, cy + u(0.06));
  const warm = grad(c, u(-0.5), u(-0.6), u(0.5), u(0.45), WARM), cool = grad(c, u(-0.25), u(-0.1), u(0.25), u(0.25), COOL);
  const bulb = o.status ? MC[m] : undefined;
  if (o.mono) {
    c.lineCap = "round"; c.lineJoin = "round"; c.lineWidth = u(0.05); c.strokeStyle = warm;
    rr(c, u(-0.47), u(-0.27), u(0.94), u(0.66), u(0.28)); c.stroke();
    rr(c, u(-0.31), u(-0.12), u(0.62), u(0.37), u(0.17)); c.stroke();
    c.beginPath(); c.moveTo(u(-0.47), u(-0.04)); c.lineTo(u(-0.56), u(-0.04)); c.lineTo(u(-0.56), u(0.16)); c.lineTo(u(-0.47), u(0.16)); c.stroke();
    c.beginPath(); c.moveTo(u(0.47), u(-0.04)); c.lineTo(u(0.56), u(-0.04)); c.lineTo(u(0.56), u(0.16)); c.lineTo(u(0.47), u(0.16)); c.stroke();
    c.beginPath(); c.moveTo(u(0.14), u(-0.27)); c.quadraticCurveTo(u(0.16), u(-0.38), u(0.22), u(-0.45)); c.stroke();
    c.beginPath(); c.arc(u(0.25), u(-0.52), u(0.055), 0, Math.PI * 2); c.stroke();
    c.lineWidth = u(0.07); c.strokeStyle = cool; [-1, 1].forEach((sd) => { c.beginPath(); c.moveTo(u(sd * 0.13), u(0.03)); c.lineTo(u(sd * 0.13), u(0.1)); c.stroke(); });
    c.restore(); return;
  }
  // dials, then the head over them
  c.fillStyle = warm; [-1, 1].forEach((sd) => { rr(c, sd > 0 ? u(0.42) : u(-0.58), u(-0.07), u(0.16), u(0.26), u(0.07)); c.fill(); });
  rr(c, u(-0.5), u(-0.3), u(1), u(0.72), u(0.3)); c.fill();
  // antenna and its status ball
  c.lineCap = "round"; c.strokeStyle = warm; c.lineWidth = u(0.06);
  c.beginPath(); c.moveTo(u(0.14), u(-0.24)); c.quadraticCurveTo(u(0.16), u(-0.38), u(0.22), u(-0.45)); c.stroke();
  c.fillStyle = bulb ?? warm; c.beginPath(); c.arc(u(0.25), u(-0.52), u(0.085), 0, Math.PI * 2); c.fill();
  // the visor: negative space
  c.fillStyle = o.bg; rr(c, u(-0.35), u(-0.15), u(0.7), u(0.43), u(0.19)); c.fill();
  // the eyes carry the mood
  c.fillStyle = cool; c.strokeStyle = cool; c.lineCap = "round";
  [-1, 1].forEach((sd) => {
    const x = u(sd * 0.14), y = u(0.065);
    if (m === "idle") { rr(c, x - u(0.055), y - u(0.09), u(0.11), u(0.18), u(0.055)); c.fill(); }
    if (m === "working") { rr(c, x - u(0.06) + u(0.03), y - u(0.01), u(0.12), u(0.06), u(0.03)); c.fill(); }
    if (m === "waiting") { rr(c, x - u(0.07), y - u(0.115), u(0.14), u(0.22), u(0.07)); c.fill(); }
    if (m === "done") { c.lineWidth = u(0.05); c.beginPath(); c.arc(x, y + u(0.05), u(0.065), Math.PI * 1.12, Math.PI * 1.88); c.stroke(); }
    if (m === "error") { c.save(); c.translate(x, y); c.rotate(sd * 0.42); rr(c, u(-0.045), u(-0.075), u(0.09), u(0.15), u(0.045)); c.fill(); c.restore(); }
  });
  if (m === "working") [-1, 0, 1].forEach((i) => { c.beginPath(); c.arc(u(i * 0.06), u(0.2), u(0.022), 0, Math.PI * 2); c.fill(); });
  c.restore();
};

const word = (c: Ctx, x: number, y: number, px: number, col: string | CanvasGradient, align: CanvasTextAlign = "left") => {
  c.font = `700 ${px}px "Poppins", "Segoe UI", sans-serif`; (c as unknown as { letterSpacing: string }).letterSpacing = `${-px * 0.035}px`;
  c.textAlign = align; c.textBaseline = "alphabetic"; c.fillStyle = col; c.fillText("autoagent", x, y);
  (c as unknown as { letterSpacing: string }).letterSpacing = "0px";
  return c.measureText("autoagent").width;
};
const tile = (c: Ctx, cx: number, cy: number, s: number, bg: string, mood: Mood = "idle", status = false) => {
  rr(c, cx - s / 2, cy - s / 2, s, s, s * 0.23); c.fillStyle = bg; c.fill();
  if (bg === "#ffffff") { c.strokeStyle = "rgba(20,21,42,0.08)"; c.lineWidth = 1.5; c.stroke(); }
  mark(c, cx, cy, s * 0.58, { bg, mood, status });
};
const caption = (c: Ctx, x: number, y: number, t: string, col = "rgba(20,21,42,0.5)", align: CanvasTextAlign = "left") => { c.font = `600 13px "Poppins", "Segoe UI", sans-serif`; c.textAlign = align; c.textBaseline = "alphabetic"; c.fillStyle = col; c.fillText(t.toUpperCase(), x, y); };

export const drawBrandSheet = (ctx: Ctx, _f: number, env: Env) => {
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  ctx.fillStyle = "#e9e9ef"; ctx.fillRect(0, 0, W, H);

  // 1. hero: the primary lockup on dark
  rr(ctx, 32, 32, 760, 540, 28); ctx.fillStyle = DARK; ctx.fill();
  ctx.save(); ctx.clip(); const halo = ctx.createRadialGradient(412, 260, 10, 412, 260, 360); halo.addColorStop(0, "rgba(255,79,123,0.20)"); halo.addColorStop(1, "rgba(255,79,123,0)"); ctx.fillStyle = halo; ctx.fillRect(32, 32, 760, 540); ctx.restore();
  mark(ctx, 412, 250, 200, { bg: DARK });
  word(ctx, 412, 450, 76, "#ffffff", "center");
  caption(ctx, 412, 540, "primary lockup  ·  on dark", "rgba(255,255,255,0.4)", "center");

  // 2. horizontal lockup on light
  rr(ctx, 816, 32, 752, 256, 28); ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.font = `700 76px "Poppins", "Segoe UI", sans-serif`; (ctx as unknown as { letterSpacing: string }).letterSpacing = `${-76 * 0.035}px`; const ww = ctx.measureText("autoagent").width; (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
  const total = 120 + 30 + ww, x0 = 1192 - total / 2; mark(ctx, x0 + 60, 158, 104, { bg: "#ffffff" }); word(ctx, x0 + 150, 186, 76, INK);
  caption(ctx, 840, 270, "horizontal lockup  ·  on light");

  // 3. monoline mark on navy, and the app icon tiles
  rr(ctx, 816, 312, 360, 260, 28); ctx.fillStyle = "#151834"; ctx.fill();
  mark(ctx, 996, 440, 150, { bg: "#151834", mono: true });
  caption(ctx, 840, 554, "monoline", "rgba(255,255,255,0.4)");
  rr(ctx, 1200, 312, 368, 260, 28); ctx.fillStyle = LIGHT; ctx.fill();
  tile(ctx, 1300, 432, 150, DARK); tile(ctx, 1468, 432, 150, "#ffffff");
  caption(ctx, 1224, 554, "app icon  ·  dark and light");

  // 4. the status family: one mark, five moods (the eyes and the antenna light change)
  rr(ctx, 32, 596, 760, 272, 28); ctx.fillStyle = "#ffffff"; ctx.fill();
  const moods: Mood[] = ["idle", "working", "waiting", "done", "error"], names = ["idle", "working", "needs you", "done", "error"];
  moods.forEach((m, i) => { const x = 112 + i * 150; tile(ctx, x, 712, 104, DARK, m, true); ctx.font = `700 15px "Poppins", "Segoe UI", sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = INK; ctx.fillText(names[i], x, 800); ctx.fillStyle = MC[m]; ctx.beginPath(); ctx.arc(x, 818, 4, 0, Math.PI * 2); ctx.fill(); });
  caption(ctx, 56, 852, "status icons  ·  the antenna light and the eyes carry the state");

  // 5. small sizes and the palette
  rr(ctx, 816, 596, 752, 272, 28); ctx.fillStyle = "#ffffff"; ctx.fill();
  [[64, 880], [40, 964], [24, 1028], [16, 1072]].forEach(([s, x]) => { tile(ctx, x, 690, s, DARK); ctx.font = `600 12px "Poppins", "Segoe UI", sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = "rgba(20,21,42,0.45)"; ctx.fillText(`${s}px`, x, 750); });
  const sw: [string, string][] = [["#ffae3d", "Sunrise"], ["#ff4f7b", "Signal"], ["#8a5cff", "Agent"], ["#4ff5c8", "Glow"], ["#0e0f1a", "Night"]];
  sw.forEach(([hex, n], i) => { const x = 1140 + i * 84; rr(ctx, x, 640, 68, 92, 16); ctx.fillStyle = hex; ctx.fill(); ctx.font = `700 13px "Poppins", "Segoe UI", sans-serif`; ctx.textAlign = "left"; ctx.fillStyle = INK; ctx.fillText(n, x + 2, 756); ctx.font = `500 11px "Segoe UI", sans-serif`; ctx.fillStyle = "rgba(20,21,42,0.5)"; ctx.fillText(hex, x + 2, 772); });
  rr(ctx, 1140, 790, 404, 22, 11); ctx.fillStyle = grad(ctx, 1140, 0, 1544, 0, WARM); ctx.fill();
  caption(ctx, 840, 852, "small sizes  ·  palette  ·  the warm gradient");
};

export const brandSheet: Film = {
  meta: { title: "brandSheet", W, H, fps: 30, bpm: 60, durationFrames: 1 },
  assets: { images: {} },
  shots: [{ id: "brandSheet", start: 0, end: 1, draw: drawBrandSheet }],
};
