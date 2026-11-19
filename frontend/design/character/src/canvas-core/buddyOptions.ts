import { rng, type Ctx, type Env } from "./core";
import type { Film } from "./film";

// AUTOAGENT BUDDY · three ORIGINAL options, flat vector, one sheet to pick from.
// Brief: the person wants a companion in the same GENRE as Coucou's Mochi (a soft, minimal shape
// whose eyes do all the acting, no robot parts), but Mochi itself is reserved by its author
// (LICENSE-ASSETS.md), so none of these reuse its look: Mochi is a pale grey squircle, wider than
// tall, with dark pill eyes, blush and little hands. Each option here changes the silhouette, the
// colour and the eyes, and has no hands:
//   A BUBBLE  a speech bubble with a tail (it is the thing that talks to your agent); violet,
//             glowing white eyes.
//   B DROP    a gumdrop, taller than wide, with a two-leaf sprout; peach, big navy eyes with glints.
//   C PUFF    a little cloud of scallops; mint, tiny dot eyes, round cheeks, one curl on top.
// MEDIUM: flat vector, pen-tool paths, a shade shape under a base nudged toward the light (upper
// left), grain on the shade side only, no outlines. Mood shows in the eyes, a soft glow behind in
// the state colour, and one small sign (typing dots, "!", sparkles, a sweat drop).

type Mood = "idle" | "working" | "waiting" | "done" | "error";
type Opt = "A" | "B" | "C";
const MOODS: Mood[] = ["idle", "working", "waiting", "done", "error"];
const MC: Record<Mood, string> = { idle: "#3fd9b8", working: "#4c8dff", waiting: "#ffb020", done: "#33cf7f", error: "#ff5a5f" };
const ML: Record<Mood, string> = { idle: "Idle", working: "Working", waiting: "Needs you", done: "Done", error: "Error" };
const NAVY = "#1e2342", WHITE = "#ffffff";

const OPT: Record<Opt, { name: string; base: string; shade: string; light: string; eye: string; glint: boolean; eyeY: number; eyeSp: number; cheek?: string }> = {
  A: { name: "A  ·  Bubble", base: "#7a6cff", shade: "#5c4de0", light: "#a69cff", eye: WHITE, glint: false, eyeY: -14, eyeSp: 44 },
  B: { name: "B  ·  Drop", base: "#ff9d76", shade: "#ec7a55", light: "#ffc2a6", eye: NAVY, glint: true, eyeY: 18, eyeSp: 40, cheek: "#ff6f8e" },
  C: { name: "C  ·  Puff", base: "#5fd8c0", shade: "#3dbaa3", light: "#9cefdf", eye: NAVY, glint: true, eyeY: 14, eyeSp: 46, cheek: "#ff8fa3" },
};

const P = (f: (p: Path2D) => void) => { const p = new Path2D(); f(p); return p; };
const body = (o: Opt) => {
  if (o === "A") return P((p) => { p.moveTo(-60, 92); p.lineTo(-62, 92); p.bezierCurveTo(-112, 92, -134, 66, -134, 20); p.lineTo(-134, -30); p.bezierCurveTo(-134, -80, -104, -104, -54, -104); p.lineTo(54, -104); p.bezierCurveTo(104, -104, 134, -80, 134, -30); p.lineTo(134, 20); p.bezierCurveTo(134, 66, 112, 92, 62, 92); p.lineTo(-14, 92); p.bezierCurveTo(-30, 112, -56, 132, -84, 140); p.bezierCurveTo(-70, 124, -62, 108, -60, 92); p.closePath(); });
  if (o === "B") return P((p) => { p.moveTo(0, -128); p.bezierCurveTo(46, -128, 124, -46, 124, 40); p.bezierCurveTo(124, 104, 74, 130, 0, 130); p.bezierCurveTo(-74, 130, -124, 104, -124, 40); p.bezierCurveTo(-124, -46, -46, -128, 0, -128); p.closePath(); });
  return P((p) => { // C: scallops over a soft base, one path (nonzero fill unions the subpaths)
    p.roundRect(-128, -6, 256, 104, 48);
    ([[-74, -6, 62], [-4, -50, 76], [74, -16, 64], [112, 30, 44], [-112, 30, 42]] as [number, number, number][]).forEach(([x, y, r]) => { p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); });
  });
};
const BOX: Record<Opt, [number, number, number, number]> = { A: [-134, -104, 134, 140], B: [-124, -128, 124, 130], C: [-132, -126, 132, 98] };
const TOP: Record<Opt, number> = { A: -104, B: -128, C: -126 }, BOTTOM: Record<Opt, number> = { A: 140, B: 130, C: 98 };

const grain = (c: Ctx, p: Path2D, [x0, y0, x1, y1]: number[], seed: number) => {
  const r = rng(seed), n = Math.round(((x1 - x0) * (y1 - y0)) / 50), lo = x0 * 0.62 + y0 * 0.78, hi = x1 * 0.62 + y1 * 0.78;
  c.save(); c.clip(p, "nonzero"); c.fillStyle = "rgba(20,20,60,0.13)";
  for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), t = (x * 0.62 + y * 0.78 - lo) / (hi - lo); if (r() > Math.pow(Math.max(0, t), 2.2)) continue; c.fillRect(x, y, 1.7, 1.7); }
  c.restore();
};

const stroke = (c: Ctx, f: (c: Ctx) => void, w: number, col: string) => { c.beginPath(); f(c); c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = col; c.stroke(); };
const fillE = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); c.fillStyle = col; c.fill(); };
const pill = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, Math.min(w, h) / 2); c.fillStyle = col; c.fill(); };

const face = (c: Ctx, o: Opt, m: Mood) => {
  const d = OPT[o], E = d.eye, y = d.eyeY, sp = d.eyeSp;
  // eye size by option: A tall pills, B big ovals, C small dots
  const ew = o === "A" ? 26 : o === "B" ? 30 : 20, eh = o === "A" ? 40 : o === "B" ? 38 : 22;
  const glint = (x: number, yy: number, s: number) => { if (d.glint) fillE(c, x - s * 0.35, yy - s * 0.4, s * 0.28, s * 0.28, WHITE); };
  if (d.cheek && m !== "error") [-1, 1].forEach((s) => fillE(c, s * (sp + 30), y + 30, 16, 10, d.cheek + "77"));
  [-1, 1].forEach((s) => {
    const x = s * sp;
    if (m === "idle") { o === "A" ? pill(c, x, y, ew, eh, E) : fillE(c, x, y, ew / 2, eh / 2, E); glint(x, y, ew); }
    if (m === "working") { // eyes down at the work, a lid across the top
      if (o === "A") pill(c, x, y + 8, ew, eh * 0.55, E); else fillE(c, x, y + 6, ew / 2, eh * 0.32, E);
      c.fillStyle = d.base; c.fillRect(x - ew, y - eh, ew * 2, eh * 0.95);
    }
    if (m === "waiting") { const k = 1.25; o === "A" ? pill(c, x, y - 4, ew * k, eh * k, E) : fillE(c, x, y - 4, (ew / 2) * k, (eh / 2) * k, E); glint(x, y - 4, ew * k); if (!d.glint) fillE(c, x - 5, y - 14, 4.5, 4.5, "#c9c3ff"); }
    if (m === "done") stroke(c, (c) => { c.moveTo(x - ew * 0.75, y + 6); c.quadraticCurveTo(x, y - eh * 0.75, x + ew * 0.75, y + 6); }, o === "C" ? 8 : 10, E);
    if (m === "error") { // worried: inner brow ends raised, eyes a little smaller
      o === "A" ? pill(c, x, y + 4, ew * 0.85, eh * 0.8, E) : fillE(c, x, y + 4, ew * 0.42, eh * 0.4, E); glint(x, y + 4, ew * 0.85);
      stroke(c, (c) => { c.moveTo(x + s * 18, y - eh * 0.75); c.lineTo(x - s * 6, y - eh * 0.75 - 12); }, 6, E);
    }
  });
  // mouths
  const my = y + (o === "A" ? 34 : 30);
  if (m === "idle") stroke(c, (c) => { c.moveTo(-9, my); c.quadraticCurveTo(0, my + 7, 9, my); }, 5, E);
  if (m === "working") stroke(c, (c) => { c.moveTo(-6, my + 2); c.lineTo(6, my + 2); }, 5, E);
  if (m === "waiting") fillE(c, 0, my + 3, 6, 7, E);
  if (m === "done") { c.beginPath(); c.moveTo(-14, my - 2); c.quadraticCurveTo(0, my + 20, 14, my - 2); c.closePath(); c.fillStyle = E; c.fill(); }
  if (m === "error") stroke(c, (c) => { c.moveTo(-12, my + 4); c.lineTo(-6, my); c.lineTo(0, my + 4); c.lineTo(6, my); c.lineTo(12, my + 4); }, 4.5, E);
};

const sign = (c: Ctx, o: Opt, m: Mood) => {
  const tx = 118, ty = TOP[o] - 4, col = MC[m];
  if (m === "working") { c.beginPath(); c.roundRect(tx - 36, ty - 26, 72, 40, 20); c.fillStyle = "#e4ebff"; c.fill(); [-16, 0, 16].forEach((dx, i) => fillE(c, tx + dx, ty - 6, 6, 6, i === 1 ? col : col + "88")); }
  if (m === "waiting") { c.beginPath(); c.roundRect(tx - 24, ty - 34, 48, 48, 16); c.fillStyle = col; c.fill(); pill(c, tx, ty - 16, 9, 22, WHITE); fillE(c, tx, ty + 3, 5, 5, WHITE); }
  if (m === "done") { const r = rng(5); for (let i = 0; i < 5; i++) { const a = -Math.PI * (0.12 + 0.76 * (i / 4)), d = 172 + r() * 26, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.85 - 10, s = 9 + r() * 7; c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s); c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s); c.fillStyle = i % 2 ? col : "#ffcf3a"; c.fill(); } }
  if (m === "error") { c.beginPath(); c.moveTo(tx - 8, ty - 30); c.bezierCurveTo(tx + 2, ty - 14, tx + 8, ty - 6, tx + 8, ty + 2); c.bezierCurveTo(tx + 8, ty + 12, tx - 24, ty + 12, tx - 24, ty + 2); c.bezierCurveTo(tx - 24, ty - 6, tx - 18, ty - 14, tx - 8, ty - 30); c.fillStyle = "#9fd9ff"; c.fill(); }
};

const extras = (c: Ctx, o: Opt) => {
  if (o === "B") { // the sprout, behind the face, in front of nothing
    stroke(c, (c) => { c.moveTo(0, -126); c.quadraticCurveTo(-2, -146, 4, -160); }, 7, "#3c9a5f");
    c.fillStyle = "#57c27b"; c.beginPath(); c.moveTo(4, -158); c.bezierCurveTo(14, -184, 46, -186, 56, -172); c.bezierCurveTo(40, -156, 18, -152, 4, -158); c.fill();
    c.fillStyle = "#43a866"; c.beginPath(); c.moveTo(2, -154); c.bezierCurveTo(-8, -172, -34, -176, -42, -164); c.bezierCurveTo(-30, -150, -12, -148, 2, -154); c.fill();
  }
  if (o === "C") stroke(c, (c) => { c.moveTo(-4, -124); c.bezierCurveTo(-10, -150, 18, -162, 22, -144); c.bezierCurveTo(24, -132, 8, -132, 10, -142); }, 7, OPT.C.shade);
};

const buddy = (c: Ctx, o: Opt, m: Mood, x: number, y: number, k: number, seed: number) => {
  const d = OPT[o], b = body(o);
  c.save(); c.translate(x, y); c.scale(k, k);
  fillE(c, 0, BOTTOM[o] + 34, 96, 12, "rgba(30,35,66,0.13)"); // floating shadow
  fillE(c, 0, 0, 176, 168, MC[m] + "24"); // the state glow behind
  extras(c, o);
  c.fillStyle = d.shade; c.fill(b);
  c.save(); c.clip(b); c.translate(-20, -16); c.fillStyle = d.base; c.fill(b); c.restore();
  c.save(); c.clip(b); c.fillStyle = d.light; c.beginPath(); c.ellipse(BOX[o][0] + 58, BOX[o][1] + 50, 40, 20, -0.6, 0, Math.PI * 2); c.fill(); c.restore();
  grain(c, b, BOX[o], seed);
  face(c, o, m);
  sign(c, o, m);
  c.restore();
};

export const drawBuddyOptions = (ctx: Ctx, _f: number, env: Env) => {
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  ctx.fillStyle = "#f6efe4"; ctx.fillRect(0, 0, env.W, env.H);
  const font = (w: number, s: number) => `${w} ${s}px 'Segoe UI', system-ui, sans-serif`;
  const cols = [560, 760, 960, 1160, 1360];
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  MOODS.forEach((m, i) => { ctx.font = font(700, 19); const w = ctx.measureText(ML[m]).width; ctx.fillStyle = MC[m]; ctx.beginPath(); ctx.arc(cols[i] - w / 2 - 12, 40, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = NAVY; ctx.fillText(ML[m], cols[i] + 4, 41); });
  (["A", "B", "C"] as Opt[]).forEach((o, r) => {
    const y = 72 + r * 262;
    ctx.fillStyle = r % 2 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.roundRect(24, y, env.W - 48, 246, 26); ctx.fill();
    ctx.textAlign = "left"; ctx.font = font(800, 24); ctx.fillStyle = NAVY; ctx.fillText(OPT[o].name, 56, y + 36); ctx.textAlign = "center";
    buddy(ctx, o, "idle", 250, y + 136, 0.5, 10 + r);
    MOODS.forEach((m, i) => buddy(ctx, o, m, cols[i], y + 132, 0.42, 20 + r * 10 + i));
  });
  ctx.textAlign = "left"; ctx.font = font(800, 22); ctx.fillStyle = NAVY; ctx.fillText("AutoAgent", 48, 873); const tw = ctx.measureText("AutoAgent").width;
  ctx.font = font(500, 17); ctx.fillStyle = "#6b6f8c"; ctx.fillText("buddy options  ·  original characters, flat vector", 48 + tw + 14, 873);
};

export const buddyOptions: Film = {
  meta: { title: "buddyOptions", W: 1600, H: 900, fps: 30, bpm: 60, durationFrames: 1 },
  assets: { images: {} },
  shots: [{ id: "buddyOptions", start: 0, end: 1, draw: drawBuddyOptions }],
};
