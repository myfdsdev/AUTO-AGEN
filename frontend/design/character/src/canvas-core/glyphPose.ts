// GLYPH POSE · the reference bot, matched shape for shape (measured on the reference enlarged 6x),
// with every part posable and nine animations as pure functions of time (each loops in 4 s).
// THE LOOK, in head widths (head = 1.0 wide):
//   head     a wide squircle-oval, 1.0 x 0.61, all white
//   visor    a squircle HOLE through the head, 0.66 x 0.36: it shows the ground colour, not a dark screen
//   eyes     two small white rounded shapes high in the visor, a little wider than tall
//   antenna  a short thick stem and a big ball (0.18 across) on top
//   legs     three chunky white pills that FLOAT apart from the head: a long tapering middle one and
//            two short side ones tilted outward. No ground shadow.
// THE MOVES: wave (a side leg floats up and waves), swim, dance, work, alert, done, sleep, error, idle.
import type { Ctx } from "./core";

export type Anim = "wave" | "swim" | "dance" | "work" | "alert" | "done" | "sleep" | "error" | "idle";
export const ANIMS: Anim[] = ["wave", "swim", "dance", "work", "alert", "done", "sleep", "error", "idle"];
export const ANIM_LABEL: Record<Anim, string> = { wave: "Hello", swim: "Swim", dance: "Dance", work: "Working", alert: "Needs you", done: "Done", sleep: "Sleep", error: "Error", idle: "Look around" };
export const LOOP_S = 4;

type EyeKind = "sq" | "happy" | "closed" | "x";
// a leg: root point, direction (0 = straight down, + = toward +x), bend along its length, length, widths at root and tip
type Leg = { x: number; y: number; ang: number; bend: number; len: number; w0: number; w1: number };
export type Pose = { x: number; y: number; rot: number; sx: number; sy: number; legs: [Leg, Leg, Leg]; eye: EyeKind; ew: number; eh: number; look: number; blink: number; antenna: number; ring: number; dots: number };
type Extra = { kind: "bang" | "spark" | "z" | "note" | "drop" | "hi"; x: number; y: number; s: number; a: number; rot?: number };

const TAU = Math.PI * 2;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ss = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const seg = (t: number, a: number, b: number) => ss((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// the rest pose, measured off the reference: side legs start just under the head's lower corners and tilt out ~36°
const L0: Leg = { x: -0.245, y: 0.475, ang: -0.7, bend: 0, len: 0.24, w0: 0.2, w1: 0.19 };
const M0: Leg = { x: 0, y: 0.53, ang: 0, bend: 0, len: 0.34, w0: 0.25, w1: 0.15 };
const R0: Leg = { ...L0, x: 0.245, ang: 0.7 };
const rest = (): Pose => ({ x: 0, y: 0, rot: 0, sx: 1, sy: 1, legs: [{ ...L0 }, { ...M0 }, { ...R0 }], eye: "sq", ew: 0.17, eh: 0.12, look: 0, blink: 0, antenna: 0, ring: 0, dots: 0 });
const blinkAt = (t: number, times: number[]) => Math.max(0, ...times.map((b) => { const u = (t - b) / 0.16; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; }));

// ---------------------------------------------------------------- the nine animations
export const animate = (a: Anim, t: number): { pose: Pose; extras: Extra[] } => {
  const p = rest(), ex: Extra[] = [], [lg, md, rg] = p.legs;
  const bob = Math.sin((TAU * t) / 2) * 0.02; p.y = bob;
  // every leg floats a little on its own, a beat behind the head
  p.legs.forEach((l, i) => { l.y += 0.012 * Math.sin((TAU * t) / 2 - 0.8 - i * 0.4); });
  if (a === "wave") {
    const lift = seg(t, 0.25, 0.65) * (1 - seg(t, 3.15, 3.6)), w = Math.sin(TAU * 2.5 * t);
    rg.x = lerp(0.25, 0.6, lift); rg.y = lerp(0.42, 0.05, lift); rg.ang = lerp(0.62, 2.55, lift) + lift * 0.42 * w; rg.len = lerp(0.2, 0.24, lift);
    lg.ang = -0.62 - 0.1 * lift; p.rot = -0.06 * lift; p.x = -0.03 * lift;
    p.eye = lift > 0.5 ? "happy" : "sq"; p.antenna = 0.15 * lift * w;
    if (lift > 0.05) ex.push({ kind: "hi", x: -0.6, y: -0.62, s: lift, a: lift });
  }
  if (a === "swim") {
    const c = Math.sin((TAU * t) / 2), pull = Math.sin((TAU * t) / 2 - 0.9);
    lg.ang = -0.62 - 0.38 * c; rg.ang = 0.62 + 0.38 * c; lg.x = -0.25 - 0.04 * c; rg.x = 0.25 + 0.04 * c; md.bend = 0.25 * c; md.len = 0.4 + 0.04 * c;
    p.y = -0.07 * pull; p.sy = 1 + 0.03 * c; p.sx = 1 - 0.03 * c; p.antenna = -0.12 * pull; p.blink = blinkAt(t, [1.4]);
  }
  if (a === "dance") {
    const b = Math.sin(TAU * t); // one sway per second
    p.rot = 0.14 * b; p.x = 0.05 * b; p.y = -0.05 * Math.abs(Math.sin(TAU * t));
    lg.ang = -0.62 - 0.75 * Math.max(0, -b); rg.ang = 0.62 + 0.75 * Math.max(0, b); md.ang = 0.18 * b; md.bend = -0.2 * b;
    p.eye = "happy"; p.antenna = -0.25 * b;
    [0, 1].forEach((i) => { const k = ((t / 2 + i * 0.5) % 1); ex.push({ kind: "note", x: (i ? 0.66 : -0.7) + 0.08 * Math.sin(TAU * k), y: -0.2 - 0.55 * k, s: 0.9, a: Math.sin(Math.PI * k), rot: 0.2 * Math.sin(TAU * k) }); });
  }
  if (a === "work") {
    p.eh = 0.045; p.ew = 0.16; p.look = 0.5; p.dots = 1; p.y = 0.012 * Math.sin(TAU * 2 * t);
    p.legs.forEach((l, i) => { l.ang += 0.12 * Math.sin(TAU * 4 * t + i * 2.1); l.y += 0.02 * Math.max(0, Math.sin(TAU * 4 * t + i * 2.1)); });
  }
  if (a === "alert") {
    const u = t % 2, hop = u < 0.7 ? Math.abs(Math.sin((Math.PI * u) / 0.35)) : 0;
    p.y = bob - 0.09 * hop; p.ew = 0.16; p.eh = 0.17; p.ring = 0.5 + 0.5 * Math.sin(TAU * 1.5 * t);
    lg.ang -= 0.35 * hop; rg.ang += 0.35 * hop; md.y += 0.03 * hop; p.sy = 1 + 0.04 * hop; p.sx = 1 - 0.03 * hop;
    ex.push({ kind: "bang", x: 0.68, y: -0.56 + p.y, s: 1 + 0.12 * Math.sin(TAU * 1.5 * t), a: 1, rot: 0.14 });
  }
  if (a === "done") {
    const j = clamp((t - 0.3) / 0.6), up = t > 0.3 && t < 0.9 ? Math.sin(Math.PI * j) : 0, land = t > 0.9 && t < 1.15 ? Math.sin((Math.PI * (t - 0.9)) / 0.25) : 0;
    p.y = bob - 0.24 * up; p.rot = TAU * ss(j) * (t > 0.3 ? 1 : 0); p.sx = 1 + 0.08 * land; p.sy = 1 - 0.1 * land;
    lg.ang = -0.62 - 0.7 * up; rg.ang = 0.62 + 0.7 * up; md.y += 0.06 * up;
    p.eye = t > 0.2 && t < 3.6 ? "happy" : "sq";
    if (t > 0.8 && t < 2.3) { const k = clamp((t - 0.8) / 1.5); for (let i = 0; i < 6; i++) { const ang = -Math.PI * (0.08 + 0.84 * (i / 5)); ex.push({ kind: "spark", x: Math.cos(ang) * (0.62 + 0.3 * ss(k)), y: -0.1 + Math.sin(ang) * (0.62 + 0.3 * ss(k)) * 0.85, s: Math.sin(Math.PI * k) * (i % 2 ? 0.7 : 1), a: 1 }); } }
  }
  if (a === "sleep") {
    p.eye = "closed"; p.y = 0.04 + 0.015 * Math.sin((TAU * t) / 4); p.sy = 1 + 0.025 * Math.sin((TAU * t) / 4); p.antenna = 0.45; p.rot = 0.05;
    lg.ang = -0.3; rg.ang = 0.3; lg.y += 0.03; rg.y += 0.03; md.y += 0.02;
    [0, 1, 2].forEach((i) => { const k = ((t / 4 + i / 3) % 1); ex.push({ kind: "z", x: 0.5 + 0.25 * k + 0.05 * Math.sin(TAU * k * 2), y: -0.5 - 0.5 * k, s: 0.6 + 0.6 * k, a: Math.sin(Math.PI * k) }); });
  }
  if (a === "error") {
    const u = t % 2, sh = u < 0.6 ? Math.sin(TAU * 10 * u) * (1 - u / 0.6) : 0;
    p.x = 0.045 * sh; p.rot = 0.04 * sh; p.eye = "x"; p.antenna = 0.2 * sh;
    lg.ang = 0.15; rg.ang = -0.15; md.ang = 0.08 * sh; // knees together
    ex.push({ kind: "drop", x: 0.6, y: -0.42 + 0.04 * Math.sin((TAU * t) / 2), s: 1, a: 1 });
  }
  if (a === "idle") {
    p.look = -seg(t, 0.4, 0.7) + 2 * seg(t, 1.4, 1.7) - seg(t, 2.4, 2.7); p.blink = blinkAt(t, [0.95, 3.2]);
    p.rot = 0.04 * p.look; p.legs.forEach((l, i) => { l.ang += 0.07 * Math.sin((TAU * t) / 2 + i); });
  }
  return { pose: p, extras: ex };
};

// ---------------------------------------------------------------- drawing
const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); };
// a squircle-oval (superellipse): flatter sides than an ellipse, rounder than a rounded box
const squircle = (c: Ctx, cx: number, cy: number, a: number, b: number, n: number) => {
  c.beginPath();
  for (let i = 0; i <= 96; i++) { const th = (i / 96) * TAU, co = Math.cos(th), si = Math.sin(th), x = cx + a * Math.sign(co) * Math.abs(co) ** (2 / n), y = cy + b * Math.sign(si) * Math.abs(si) ** (2 / n); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.closePath();
};
// a leg: a pill that tapers from w0 to w1, round at both ends
const pill = (c: Ctx, l: Leg) => {
  const n = 16, st = l.len / (n - 1), pts: [number, number][] = []; let x = l.x, y = l.y;
  for (let i = 0; i < n; i++) { pts.push([x, y]); const a = l.ang + l.bend * (i / (n - 1)); x += Math.sin(a) * st; y += Math.cos(a) * st; }
  const L: [number, number][] = [], R: [number, number][] = [];
  pts.forEach((pt, i) => { const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)], dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy) || 1, w = (l.w0 + (l.w1 - l.w0) * (i / (n - 1))) / 2; L.push([pt[0] - (dy / d) * w, pt[1] + (dx / d) * w]); R.push([pt[0] + (dy / d) * w, pt[1] - (dx / d) * w]); });
  c.beginPath(); L.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); for (let i = n - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath(); c.fill();
  [[pts[0], l.w0], [pts[n - 1], l.w1]].forEach(([q, w]) => { const [qx, qy] = q as [number, number]; c.beginPath(); c.arc(qx, qy, (w as number) / 2, 0, TAU); c.fill(); });
};

// ---------------------------------------------------------------- face items and outfits
export type FaceItem = "none" | "glasses" | "shades" | "blush" | "hearts" | "stars" | "moustache";
export type Outfit = "none" | "party" | "beanie" | "crown" | "wizard" | "bow" | "headphones" | "bowtie" | "scarf";
export const FACE_ITEMS: FaceItem[] = ["glasses", "shades", "blush", "hearts", "stars", "moustache"];
export const OUTFITS: Outfit[] = ["party", "beanie", "crown", "wizard", "bow", "headphones", "bowtie", "scarf"];
const HATS: Outfit[] = ["party", "beanie", "crown", "wizard"]; // these sit where the antenna is, so it hides
const PINK = "#ff6fa5", GOLD = "#ffd23f", NAVY = "#1d2340", RED = "#ff5a5f", PURPLE = "#7b5cff";
const heart = (c: Ctx, x: number, y: number, r: number) => { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.45); c.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); c.fill(); };
const star = (c: Ctx, x: number, y: number, r: number) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.fill(); };
const bow = (c: Ctx, x: number, y: number, r: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - r * 1.3, y - r * 1.1, x - r * 1.2, y); c.quadraticCurveTo(x - r * 1.3, y + r * 1.1, x, y); c.quadraticCurveTo(x + r * 1.3, y - r * 1.1, x + r * 1.2, y); c.quadraticCurveTo(x + r * 1.3, y + r * 1.1, x, y); c.fill(); c.beginPath(); c.arc(x, y, r * 0.32, 0, TAU); c.fill(); };

const wearFace = (c: Ctx, f: FaceItem, lx: number) => {
  c.lineCap = "round"; c.lineJoin = "round";
  if (f === "glasses" || f === "shades") {
    [-1, 1].forEach((sd) => { const x = sd * 0.155 + lx; rr(c, x - 0.12, -0.11, 0.24, 0.19, 0.075); if (f === "shades") { c.fillStyle = NAVY; c.fill(); c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 0.018; c.beginPath(); c.moveTo(x - 0.07, -0.06); c.lineTo(x - 0.02, -0.08); c.stroke(); } else { c.strokeStyle = NAVY; c.lineWidth = 0.032; c.stroke(); } });
    c.strokeStyle = NAVY; c.lineWidth = 0.03; c.beginPath(); c.moveTo(-0.035 + lx, -0.04); c.quadraticCurveTo(lx, -0.07, 0.035 + lx, -0.04); c.stroke();
  }
  if (f === "blush") { c.fillStyle = PINK; [-1, 1].forEach((sd) => { c.beginPath(); c.ellipse(sd * 0.415, 0.13, 0.055, 0.032, 0, 0, TAU); c.fill(); }); }
  if (f === "hearts") { c.fillStyle = PINK; [-1, 1].forEach((sd) => heart(c, sd * 0.155 + lx, -0.01, 0.075)); }
  if (f === "stars") { c.fillStyle = GOLD; [-1, 1].forEach((sd) => star(c, sd * 0.155 + lx, -0.005, 0.085)); }
  if (f === "moustache") { c.fillStyle = "#ffffff"; c.save(); c.translate(0, 0.1); c.scale(1.45, 1.45); c.translate(0, -0.1); [-1, 1].forEach((sd) => { c.beginPath(); c.moveTo(0, 0.085); c.bezierCurveTo(sd * 0.05, 0.06, sd * 0.13, 0.07, sd * 0.16, 0.11); c.bezierCurveTo(sd * 0.17, 0.13, sd * 0.14, 0.14, sd * 0.12, 0.12); c.bezierCurveTo(sd * 0.08, 0.13, sd * 0.03, 0.13, 0, 0.11); c.fill(); }); c.restore(); }
};
const wearOutfit = (c: Ctx, w: Outfit) => {
  if (w === "party") { c.save(); c.translate(0.1, -0.28); c.rotate(0.22); c.beginPath(); c.moveTo(-0.15, 0); c.lineTo(0, -0.38); c.lineTo(0.15, 0); c.closePath(); c.fillStyle = PINK; c.fill(); c.clip(); c.fillStyle = GOLD; [-0.08, -0.2].forEach((y) => c.fillRect(-0.2, y - 0.03, 0.4, 0.05)); c.restore(); c.save(); c.translate(0.1, -0.28); c.rotate(0.22); c.fillStyle = GOLD; c.beginPath(); c.arc(0, -0.39, 0.055, 0, TAU); c.fill(); c.restore(); }
  if (w === "beanie") { c.fillStyle = RED; c.beginPath(); c.moveTo(-0.43, -0.19); c.bezierCurveTo(-0.42, -0.5, 0.42, -0.5, 0.43, -0.19); c.closePath(); c.fill(); c.fillStyle = "#e0444f"; rr(c, -0.46, -0.26, 0.92, 0.1, 0.05); c.fill(); c.strokeStyle = "rgba(255,255,255,0.25)"; c.lineWidth = 0.02; [-0.3, -0.15, 0, 0.15, 0.3].forEach((x) => { c.beginPath(); c.moveTo(x, -0.25); c.lineTo(x, -0.17); c.stroke(); }); c.fillStyle = "#ffffff"; c.beginPath(); c.arc(0, -0.45, 0.075, 0, TAU); c.fill(); }
  if (w === "crown") { c.fillStyle = GOLD; c.beginPath(); c.moveTo(-0.2, -0.27); c.lineTo(-0.22, -0.47); c.lineTo(-0.11, -0.37); c.lineTo(0, -0.5); c.lineTo(0.11, -0.37); c.lineTo(0.22, -0.47); c.lineTo(0.2, -0.27); c.closePath(); c.fill(); c.fillStyle = RED; c.beginPath(); c.arc(0, -0.33, 0.032, 0, TAU); c.fill(); c.fillStyle = PURPLE; [-0.12, 0.12].forEach((x) => { c.beginPath(); c.arc(x, -0.32, 0.022, 0, TAU); c.fill(); }); }
  if (w === "wizard") { c.fillStyle = PURPLE; c.beginPath(); c.ellipse(0, -0.29, 0.33, 0.055, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-0.19, -0.3); c.quadraticCurveTo(-0.02, -0.6, 0.14, -0.78); c.quadraticCurveTo(0.08, -0.55, 0.19, -0.3); c.closePath(); c.fill(); c.fillStyle = GOLD; star(c, -0.02, -0.42, 0.045); star(c, 0.07, -0.58, 0.03); }
  if (w === "bow") bow(c, -0.26, -0.3, 0.13, PINK);
  if (w === "headphones") { c.strokeStyle = NAVY; c.lineWidth = 0.055; c.lineCap = "round"; c.beginPath(); c.arc(0, -0.02, 0.52, Math.PI * 1.04, Math.PI * 1.96); c.stroke(); [-1, 1].forEach((sd) => { c.fillStyle = NAVY; rr(c, sd > 0 ? 0.46 : -0.6, -0.14, 0.14, 0.28, 0.07); c.fill(); c.fillStyle = PINK; rr(c, sd > 0 ? 0.48 : -0.58, -0.09, 0.05, 0.18, 0.025); c.fill(); }); }
  if (w === "bowtie") bow(c, 0, 0.385, 0.11, RED);
  if (w === "scarf") { c.fillStyle = RED; rr(c, -0.4, 0.22, 0.8, 0.13, 0.065); c.fill(); c.save(); c.translate(0.24, 0.3); c.rotate(-0.18); rr(c, -0.06, 0, 0.12, 0.24, 0.04); c.fill(); c.restore(); c.fillStyle = "rgba(255,255,255,0.85)"; [-0.22, 0, 0.22].forEach((x) => c.fillRect(x - 0.025, 0.225, 0.05, 0.125)); }
};

export const drawPosed = (c: Ctx, cx: number, cy: number, s: number, a: Anim, t: number, o: { ground: string; accent?: string; visor?: string; face?: FaceItem; outfit?: Outfit; ink?: string }) => {
  const { pose: p, extras } = animate(a, t), ink = o.ink ?? "#ffffff", hole = o.ground, face = o.face ?? "none", outfit = o.outfit ?? "none";
  c.save(); c.translate(cx + p.x * s, cy + p.y * s); c.rotate(p.rot); c.scale(s * p.sx, s * p.sy);
  c.fillStyle = ink; c.strokeStyle = ink;
  p.legs.forEach((l) => pill(c, l));
  // antenna: a short thick stem that pivots on the head, and a big ball (a hat takes its place)
  if (!HATS.includes(outfit)) {
    c.save(); c.translate(0, -0.28); c.rotate(p.antenna);
    rr(c, -0.04, -0.1, 0.08, 0.12, 0.03); c.fill();
    if (p.ring > 0) { c.globalAlpha = 0.4 * p.ring; c.beginPath(); c.arc(0, -0.14, 0.094 + 0.09 * p.ring, 0, TAU); c.fill(); c.globalAlpha = 1; }
    c.beginPath(); c.arc(0, -0.14, 0.094, 0, TAU); c.fill(); c.restore();
  }
  // the head, and the visor as a hole that shows the ground
  squircle(c, 0, 0, 0.5, 0.31, 2.7); c.fill();
  c.fillStyle = hole; squircle(c, 0, 0.01, 0.345, 0.21, 2.6); c.fill();
  // eyes: high in the visor
  c.fillStyle = ink; c.strokeStyle = ink; c.lineCap = "round";
  const lx = p.look * 0.06, hh = Math.max(0.014, p.eh * (1 - 0.9 * p.blink));
  [-1, 1].forEach((sd) => {
    const x = sd * 0.155 + lx, y = -0.01;
    if (face === "hearts" || face === "stars") return; // these face items replace the eyes
    if (p.eye === "sq") { rr(c, x - p.ew / 2, y - hh / 2, p.ew, hh, Math.min(0.045, hh / 2)); c.fill(); }
    if (p.eye === "happy") { c.lineWidth = 0.05; c.beginPath(); c.arc(x, y + 0.05, 0.065, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    if (p.eye === "closed") { c.lineWidth = 0.04; c.beginPath(); c.arc(x, y - 0.03, 0.06, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); }
    if (p.eye === "x") { c.lineWidth = 0.04; c.beginPath(); c.moveTo(x - 0.05, y - 0.045); c.lineTo(x + 0.05, y + 0.045); c.moveTo(x + 0.05, y - 0.045); c.lineTo(x - 0.05, y + 0.045); c.stroke(); }
  });
  if (p.dots) [-1, 0, 1].forEach((i) => { const b = Math.max(0, Math.sin(TAU * 2 * t - (i + 1) * 0.9)); c.beginPath(); c.arc(i * 0.07, 0.09 - b * 0.025, 0.022, 0, TAU); c.fill(); });
  if (face !== "none") wearFace(c, face, lx);
  if (outfit !== "none") wearOutfit(c, outfit);
  c.restore();
  // extras, upright around the bot
  extras.forEach((e) => {
    c.save(); c.translate(cx + e.x * s, cy + e.y * s); c.rotate(e.rot ?? 0); c.globalAlpha = clamp(e.a); const k = s * 0.01 * e.s;
    if (k <= 0) { c.restore(); return; }
    c.fillStyle = ink; c.strokeStyle = ink; c.lineCap = "round"; c.lineJoin = "round";
    if (e.kind === "bang") { rr(c, -11 * k, -11 * k, 22 * k, 22 * k, 7 * k); c.fill(); c.fillStyle = o.accent ?? "#ffb020"; rr(c, -2.2 * k, -7 * k, 4.4 * k, 9 * k, 2.2 * k); c.fill(); c.beginPath(); c.arc(0, 5.2 * k, 2.4 * k, 0, TAU); c.fill(); }
    if (e.kind === "spark") { const r = 6 * k; c.beginPath(); c.moveTo(0, -r); c.quadraticCurveTo(0, 0, r, 0); c.quadraticCurveTo(0, 0, 0, r); c.quadraticCurveTo(0, 0, -r, 0); c.quadraticCurveTo(0, 0, 0, -r); c.fill(); }
    if (e.kind === "z") { c.lineWidth = 2 * k; c.beginPath(); c.moveTo(-4 * k, -4 * k); c.lineTo(4 * k, -4 * k); c.lineTo(-4 * k, 4 * k); c.lineTo(4 * k, 4 * k); c.stroke(); }
    if (e.kind === "note") { c.beginPath(); c.ellipse(-3 * k, 6 * k, 3.6 * k, 2.8 * k, -0.4, 0, TAU); c.fill(); c.lineWidth = 1.8 * k; c.beginPath(); c.moveTo(0, 6 * k); c.lineTo(0, -8 * k); c.quadraticCurveTo(4 * k, -6 * k, 6 * k, -2 * k); c.stroke(); }
    if (e.kind === "drop") { c.fillStyle = "#cfefff"; c.beginPath(); c.moveTo(0, -8 * k); c.bezierCurveTo(3 * k, -3 * k, 5 * k, 0, 5 * k, 3 * k); c.bezierCurveTo(5 * k, 6 * k, -5 * k, 6 * k, -5 * k, 3 * k); c.bezierCurveTo(-5 * k, 0, -3 * k, -3 * k, 0, -8 * k); c.fill(); }
    if (e.kind === "hi") { rr(c, -14 * k, -9 * k, 28 * k, 18 * k, 9 * k); c.fill(); c.beginPath(); c.moveTo(6 * k, 7 * k); c.lineTo(12 * k, 14 * k); c.lineTo(1 * k, 8 * k); c.fill(); c.fillStyle = o.ground; c.font = `700 ${11 * k}px "Poppins", "Segoe UI", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("hi!", 0, 0.8 * k); }
    c.restore();
  });
};
