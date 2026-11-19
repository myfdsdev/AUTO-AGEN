import { rng, type Ctx, type Env } from "./core";
import type { Film } from "./film";
import { CARDS, CARD_H, CARD_W, MOOD_COLOR, MOOD_LABEL, SHEET_MOODS, drawBot, notchTab, roundedCard, type Box, type Style } from "./autoBot";

// FLAT VECTOR · the AutoAgent bot, character sheet.
// MEDIUM: pen-tool paths in a vector app. Every form is a closed path filled with ONE flat colour;
// no strokes as outlines anywhere, an edge is only where two fills meet. Form is a shade shape
// under a base shape nudged toward the light (upper left), so the shade reads as a crisp crescent
// on the lower right. Texture is a grain brush: a speckle painted only over the shade side,
// clipped to the form. Glow is a transparency ramp, the one gradient the medium allows.
// ORDER: background planes, the notch, the hero, the mood cards, the grain, the labels.

const BG = "#f6efe4", BLOB = "#fde0cb", CARD = "#fffdf9", NAVY = "30,35,66";
const N: [number, number] = [0.62, 0.78]; // away from the light

const grain = (c: Ctx, p: Path2D, box: Box, seed: number) => {
  const [x0, y0, x1, y1] = box, r = rng(seed), n = Math.round(((x1 - x0) * (y1 - y0)) / 55);
  const lo = x0 * N[0] + y0 * N[1], hi = x1 * N[0] + y1 * N[1];
  c.save(); c.clip(p); c.fillStyle = "rgba(70,25,10,0.16)";
  for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), t = (x * N[0] + y * N[1] - lo) / (hi - lo || 1); if (r() > Math.pow(Math.max(0, t), 2.2)) continue; c.fillRect(x, y, 1.6, 1.6); }
  c.restore();
};

const flatStyle: Style = {
  lineW: 0,
  form(c, p, base, shade, o) {
    c.fillStyle = shade; c.fill(p);
    c.save(); c.clip(p); c.translate(...(o.shift ?? [-10, -8])); c.fillStyle = base; c.fill(p); c.restore();
    if (o.hi) { c.save(); c.clip(p); c.fillStyle = o.hiCol ?? "#fff"; c.fill(o.hi); c.restore(); }
    grain(c, p, o.box, o.seed);
  },
  flat(c, p, col) { c.fillStyle = col; c.fill(p); },
  thick(c, build, w, col) { const p = new Path2D(); build(p); c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = col; c.stroke(p); },
  ink() {},
  glow(c, col) { const g = c.createLinearGradient(0, 228, 0, 312); g.addColorStop(0, col + "88"); g.addColorStop(1, col + "00"); c.fillStyle = g; c.beginPath(); c.moveTo(-46, 226); c.lineTo(46, 226); c.lineTo(100, 312); c.lineTo(-100, 312); c.closePath(); c.fill(); },
  extraLines() {},
};

const label = (c: Ctx, x: number, y: number, text: string, col: string) => {
  c.font = "700 21px 'Segoe UI', system-ui, sans-serif"; c.textBaseline = "middle"; c.textAlign = "left";
  const w = c.measureText(text).width, x0 = x - (w + 26) / 2;
  c.fillStyle = col; c.beginPath(); c.arc(x0 + 7, y, 7, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#1e2342"; c.fillText(text, x0 + 22, y + 1);
};

export const drawBotFlat = (ctx: Ctx, _frame: number, env: Env) => {
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  ctx.fillStyle = BG; ctx.fillRect(0, 0, env.W, env.H);
  // the hero's backdrop: one soft organic plane, then the notch the bot drops out of
  const blob = new Path2D(); blob.moveTo(120, 300); blob.bezierCurveTo(120, 160, 260, 110, 400, 120); blob.bezierCurveTo(560, 130, 690, 230, 680, 420); blob.bezierCurveTo(670, 610, 560, 760, 380, 770); blob.bezierCurveTo(200, 780, 90, 640, 100, 480); blob.bezierCurveTo(104, 400, 120, 360, 120, 300); blob.closePath();
  ctx.fillStyle = BLOB; ctx.fill(blob);
  ctx.fillStyle = "#14172b"; ctx.fill(notchTab(390, 250, 46));
  drawBot(ctx, flatStyle, 390, 412, 1.12, "greet");

  // the five moods, one card each; the long flat card shadow is its own shape
  SHEET_MOODS.forEach((m, i) => {
    const [x, y] = CARDS[i];
    ctx.fillStyle = `rgba(${NAVY},0.08)`; ctx.fill(roundedCard(x + 10, y + 12, CARD_W, CARD_H, 26));
    const card = roundedCard(x, y, CARD_W, CARD_H, 26); ctx.fillStyle = CARD; ctx.fill(card);
    ctx.save(); ctx.clip(card); ctx.fillStyle = MOOD_COLOR[m] + "1f"; ctx.fill(roundedCard(x, y, CARD_W, 210, 0)); drawBot(ctx, flatStyle, x + CARD_W / 2, y + 140, 0.5, m); ctx.restore();
    label(ctx, x + CARD_W / 2, y + CARD_H - 28, MOOD_LABEL[m], MOOD_COLOR[m]);
  });
  ctx.font = "800 30px 'Segoe UI', system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#1e2342"; ctx.fillText("AutoAgent", 48, 858); const tw = ctx.measureText("AutoAgent").width;
  ctx.font = "500 19px 'Segoe UI', system-ui, sans-serif"; ctx.fillStyle = "#6b6f8c"; ctx.fillText("bot concept  ·  flat vector", 48 + tw + 16, 857);
};

export const botFlat: Film = {
  meta: { title: "botFlat", W: 1600, H: 900, fps: 30, bpm: 60, durationFrames: 1 },
  assets: { images: {} },
  shots: [{ id: "botFlat", start: 0, end: 1, draw: drawBotFlat }],
};
