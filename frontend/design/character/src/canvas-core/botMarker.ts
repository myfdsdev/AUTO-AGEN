import { rng, type Ctx, type Env } from "./core";
import type { Film } from "./film";
import { CARDS, CARD_H, CARD_W, MOOD_COLOR, MOOD_LABEL, SHEET_MOODS, drawBot, notchTab, roundedCard, type Box, type Style } from "./autoBot";

// MARKER COMIC · the AutoAgent bot, character sheet. Same character as botFlat, different marks.
// MEDIUM: alcohol markers on bleed-proof paper, then a brush pen. A flat is laid in parallel
// chisel streaks that overlap where the marker went over twice (the streaks stay visible); the
// shadow is a second, darker marker with a HARD edge, never a blend; white gel pen for glints;
// last, one heavy ink contour that thickens on the side away from the light (lower right).
// ORDER per form: flat, shadow, streaks, glints, ink. Panels: comic boxes with a hard drop shadow.

const INK = "#1b1833", PAPER = "#fbf6ec", A = Math.atan2(0.78, 0.62);

const streaks = (c: Ctx, p: Path2D, box: Box, col: string, seed: number, alpha: number) => {
  const [x0, y0, x1, y1] = box, r = rng(seed), w = Math.max(8, (x1 - x0) / 9);
  c.save(); c.clip(p); c.strokeStyle = col; c.lineCap = "butt"; c.globalAlpha = alpha; c.lineWidth = w;
  const d = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ang = -0.55, ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
  for (let t = -d / 2; t < d / 2; t += w * 0.82) { const j = (r() - 0.5) * w * 0.3, a0 = -d / 2 + r() * w, a1 = d / 2 - r() * w; c.beginPath(); c.moveTo(cx + vx * (t + j) + ux * a0, cy + vy * (t + j) + uy * a0); c.lineTo(cx + vx * (t + j) + ux * a1, cy + vy * (t + j) + uy * a1); c.stroke(); }
  c.restore();
};

const markerStyle: Style = {
  lineW: 4,
  form(c, p, base, shade, o) {
    c.fillStyle = base; c.fill(p);
    streaks(c, p, o.box, shade, o.seed, 0.16);
    // the hard shadow: everything of the form NOT covered by itself nudged toward the light
    c.save(); c.clip(p); const sh = o.shift ?? [-10, -8]; c.beginPath(); c.rect(o.box[0] - 40, o.box[1] - 40, o.box[2] - o.box[0] + 80, o.box[3] - o.box[1] + 80); c.translate(sh[0] * 1.1, sh[1] * 1.1); c.fillStyle = shade; const inv = new Path2D(); inv.rect(o.box[0] - 60, o.box[1] - 60, o.box[2] - o.box[0] + 120, o.box[3] - o.box[1] + 120); inv.addPath(p); c.fill(inv, "evenodd"); c.restore();
    if (o.hi) { c.save(); c.clip(p); c.globalAlpha = 0.75; c.fillStyle = "#fff"; c.fill(o.hi); c.restore(); }
    // gel-pen glints near the light
    const [x0, y0, x1, y1] = o.box, gx = x0 + (x1 - x0) * 0.22, gy = y0 + (y1 - y0) * 0.2, s = (x1 - x0) / 300;
    if (o.hi && x1 - x0 > 60) { c.save(); c.clip(p); c.strokeStyle = "#fff"; c.lineCap = "round"; c.lineWidth = Math.max(3, 7 * s); c.beginPath(); c.moveTo(gx, gy + 26 * s); c.quadraticCurveTo(gx + 4 * s, gy + 4 * s, gx + 26 * s, gy - 2 * s); c.stroke(); c.restore(); }
  },
  flat(c, p, col, o) { c.fillStyle = col; c.fill(p); if (o.box[2] - o.box[0] > 70 && !col.startsWith("rgba")) streaks(c, p, o.box, "#000", o.seed, 0.06); },
  thick(c, build, w, col) { const p = new Path2D(); build(p); c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = INK; c.lineWidth = w + this.lineW * 1.6; c.stroke(p); c.strokeStyle = col; c.lineWidth = w; c.stroke(p); },
  ink(c, p, [cx, cy]) {
    c.lineJoin = "round"; c.strokeStyle = INK; c.lineWidth = this.lineW; c.stroke(p);
    // the heavier side, away from the light
    c.save(); c.translate(cx, cy); c.rotate(A - Math.PI / 2); c.beginPath(); c.rect(-4000, 6, 8000, 4000); c.rotate(-(A - Math.PI / 2)); c.translate(-cx, -cy); c.clip();
    c.lineWidth = this.lineW * 2.1; c.stroke(p); c.restore();
  },
  glow(c, col) { [[46, 100, 312, "66"], [40, 78, 282, "44"], [34, 58, 256, "33"]].forEach(([t, b, y, a]) => { c.fillStyle = col + a; c.beginPath(); c.moveTo(-(t as number), 226); c.lineTo(t as number, 226); c.lineTo(b as number, y as number); c.lineTo(-(b as number), y as number); c.closePath(); c.fill(); }); },
  extraLines(c, mood) {
    c.strokeStyle = INK; c.lineCap = "round"; c.lineWidth = this.lineW * 0.9;
    const arc = (x: number, y: number, r: number, a0: number, a1: number) => { c.beginPath(); c.arc(x, y, r, a0, a1); c.stroke(); };
    if (mood === "greet") { arc(212, 34, 46, -1.25, -0.25); arc(212, 34, 62, -1.15, -0.4); }
    if (mood === "waiting") { arc(196, -40, 44, -1.4, -0.5); }
    if (mood === "done") { for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.15 + 0.7 * (i / 6)), r0 = 150, r1 = 182; c.beginPath(); c.moveTo(Math.cos(a) * r0 * 1.15, Math.sin(a) * r0 - 30); c.lineTo(Math.cos(a) * r1 * 1.15, Math.sin(a) * r1 - 30); c.stroke(); } }
    if (mood === "error") { c.beginPath(); c.moveTo(-40, -150); for (let i = 0; i < 6; i++) c.lineTo(-40 + i * 14 + 7, i % 2 ? -150 : -162); c.stroke(); }
  },
};

const label = (c: Ctx, x: number, y: number, text: string, col: string) => {
  c.font = "900 22px 'Segoe UI Black', 'Segoe UI', system-ui, sans-serif"; c.textBaseline = "middle"; c.textAlign = "center";
  const w = c.measureText(text).width + 34, p = roundedCard(x - w / 2, y - 19, w, 38, 19);
  c.fillStyle = col; c.fill(p); c.strokeStyle = INK; c.lineWidth = 3; c.stroke(p);
  c.fillStyle = INK; c.fillText(text.toUpperCase(), x, y + 1);
};

export const drawBotMarker = (ctx: Ctx, _frame: number, env: Env) => {
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, env.W, env.H);
  // the hero's backdrop: a pale marker swatch laid in streaks, then a halftone of dots behind it
  const blob = new Path2D(); blob.moveTo(120, 300); blob.bezierCurveTo(120, 160, 260, 110, 400, 120); blob.bezierCurveTo(560, 130, 690, 230, 680, 420); blob.bezierCurveTo(670, 610, 560, 760, 380, 770); blob.bezierCurveTo(200, 780, 90, 640, 100, 480); blob.bezierCurveTo(104, 400, 120, 360, 120, 300); blob.closePath();
  ctx.save(); ctx.clip(blob); ctx.fillStyle = "#ffe9d6"; ctx.fill(blob); ctx.fillStyle = "#f9c9a5"; for (let y = 130; y < 780; y += 16) for (let x = 100 + ((y / 16) % 2) * 8; x < 690; x += 16) { const rr = 1 + 3 * Math.max(0, (x - 120) / 600) * Math.max(0, (y - 140) / 640); ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
  ctx.fillStyle = INK; ctx.fill(notchTab(390, 250, 46));
  markerStyle.lineW = 4; drawBot(ctx, markerStyle, 390, 412, 1.12, "greet");

  SHEET_MOODS.forEach((m, i) => {
    const [x, y] = CARDS[i];
    ctx.fillStyle = INK; ctx.fill(roundedCard(x + 8, y + 8, CARD_W, CARD_H, 18));
    const card = roundedCard(x, y, CARD_W, CARD_H, 18); ctx.fillStyle = "#fffdf8"; ctx.fill(card);
    ctx.save(); ctx.clip(card); ctx.fillStyle = MOOD_COLOR[m] + "30"; ctx.fill(roundedCard(x, y, CARD_W, 210, 0)); drawBot(ctx, markerStyle, x + CARD_W / 2, y + 140, 0.5, m); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(card);
    label(ctx, x + CARD_W / 2, y + CARD_H - 30, MOOD_LABEL[m], MOOD_COLOR[m]);
  });
  ctx.font = "900 30px 'Segoe UI Black', 'Segoe UI', system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = INK; ctx.fillText("AutoAgent", 48, 858); const tw = ctx.measureText("AutoAgent").width;
  ctx.font = "600 19px 'Segoe UI', system-ui, sans-serif"; ctx.fillStyle = "#5d5a73"; ctx.fillText("bot concept  ·  marker comic", 48 + tw + 16, 857);
};

export const botMarker: Film = {
  meta: { title: "botMarker", W: 1600, H: 900, fps: 30, bpm: 60, durationFrames: 1 },
  assets: { images: {} },
  shots: [{ id: "botMarker", start: 0, end: 1, draw: drawBotMarker }],
};
