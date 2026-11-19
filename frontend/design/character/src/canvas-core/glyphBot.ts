// GLYPH BOT · the AutoAgent bot as a minimal one-colour glyph, the way an app icon draws it.
// Reference (the person's image): a white robot head with a short antenna and a dark visor with two
// square eyes, over three plain tentacles, on a flat mint ground. We keep that GENRE (white glyph,
// dark visor, square eyes, a body that is not legs) and make six of our own bodies, all on one head:
//   jelly   three tentacles that taper and CURL at the tips (the reference's are straight sticks)
//   squid   four longer wavy tentacles with round tips
//   drone   no antenna: a spinning rotor on top, three dots falling below like a hover trail
//   ghost   the head runs down into a wavy sheet
//   rocket  a nozzle and a three-tongue flame in the brand's warm colours
//   buddy   a little bean body with two arms, like the 3D bot
// Everything is a pure function of the params, so the same drawing makes the still sheet and every
// frame of the animation.
import type { Ctx } from "./core";

export type Variant = "jelly" | "squid" | "drone" | "ghost" | "rocket" | "buddy";
export type Eyes = { h: number; w: number; look: number; blink: number; done: number; tilt: number };
export type BotParams = { variant: Variant; t: number; eyes: Eyes; antenna: string; ink?: string; visor?: string; wave?: number; dots?: number; ring?: number };
export const EYES_IDLE: Eyes = { h: 0.13, w: 0.13, look: 0, blink: 0, done: 0, tilt: 0 };
// the visor is the ground colour taken deep, the way the reference's dark-teal visor sits on mint
export const deep = (hex: string, k = 0.55) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)), d = [12, 14, 34]; return `rgb(${c.map((v, i) => Math.round(v + (d[i] - v) * k)).join(",")})`; };

const TAU = Math.PI * 2;
const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); };

// a tapered, curling limb as one filled polygon with a round tip
const limb = (c: Ctx, pts: [number, number][], w0: number, w1: number) => {
  const L: [number, number][] = [], R: [number, number][] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
    L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]);
  });
  c.beginPath(); c.moveTo(L[0][0], L[0][1]); L.forEach((p) => c.lineTo(p[0], p[1])); for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath(); c.fill();
  const e = pts[pts.length - 1]; c.beginPath(); c.arc(e[0], e[1], w1 / 2, 0, TAU); c.fill();
  const s = pts[0]; c.beginPath(); c.arc(s[0], s[1], w0 / 2, 0, TAU); c.fill();
};
const tentacle = (x0: number, len: number, amp: number, phase: number, curl: number, n = 26): [number, number][] => Array.from({ length: n }, (_, i) => { const s = i / (n - 1); return [x0 + amp * Math.sin(phase - s * 2.6) * s + curl * s ** 3 * 0.16, 0.3 + s * len] as [number, number]; });

const body = (c: Ctx, p: BotParams) => {
  const t = p.t, wv = p.wave ?? 1, ph = Math.PI * t; // one sway every 2 s
  if (p.variant === "jelly") ([[-0.24, -1, 0], [0, 0.7, 0.9], [0.24, 1, 1.8]] as [number, number, number][]).forEach(([x, cd, o]) => limb(c, tentacle(x, 0.62, 0.07 * wv, ph + o, cd), 0.11, 0.05));
  if (p.variant === "squid") [-0.3, -0.1, 0.1, 0.3].forEach((x, i) => limb(c, tentacle(x, 0.78, 0.1 * wv, ph + i * 0.8, 0), 0.09, 0.07));
  if (p.variant === "drone") [0, 1, 2].forEach((i) => { const k = (((t / 2) * 3 + i / 3) % 1); c.globalAlpha = 1 - k; c.beginPath(); c.arc(0, 0.46 + k * 0.42, 0.06 * (1 - k * 0.5), 0, TAU); c.fill(); c.globalAlpha = 1; });
  if (p.variant === "ghost") { c.beginPath(); c.moveTo(-0.5, 0.1); c.lineTo(-0.5, 0.72); for (let i = 0; i <= 40; i++) { const u = i / 40, x = -0.5 + u, y = 0.72 + Math.sin(u * TAU * 2 + ph) * 0.05 * wv; c.lineTo(x, y); } c.lineTo(0.5, 0.1); c.closePath(); c.fill(); }
  if (p.variant === "rocket") {
    rr(c, -0.2, 0.3, 0.4, 0.14, 0.05); c.fill();
    const ink = c.fillStyle;
    const fl = (x: number, len: number, col: string, o: number) => { const l = len * (1 + 0.15 * Math.sin(ph * 4 + o)); c.fillStyle = col; c.beginPath(); c.moveTo(x - 0.08, 0.44); c.quadraticCurveTo(x - 0.07, 0.44 + l * 0.6, x, 0.44 + l); c.quadraticCurveTo(x + 0.07, 0.44 + l * 0.6, x + 0.08, 0.44); c.closePath(); c.fill(); };
    fl(0, 0.42, "#ff4f7b", 0); fl(-0.1, 0.26, "#ffae3d", 1); fl(0.1, 0.26, "#ffae3d", 2); fl(0, 0.22, "#ffe08a", 3); c.fillStyle = ink;
  }
  if (p.variant === "buddy") { rr(c, -0.26, 0.38, 0.52, 0.36, 0.18); c.fill(); c.lineCap = "round"; c.lineWidth = 0.08; c.strokeStyle = c.fillStyle as string; c.beginPath(); c.moveTo(-0.26, 0.48); c.quadraticCurveTo(-0.4, 0.52 + 0.04 * Math.sin(ph), -0.38, 0.66); c.moveTo(0.26, 0.48); c.quadraticCurveTo(0.4, 0.52 - 0.04 * Math.sin(ph), 0.38, 0.66); c.stroke(); }
};

export const drawGlyph = (c: Ctx, cx: number, cy: number, s: number, p: BotParams) => {
  const ink = p.ink ?? "#ffffff", visor = p.visor ?? "rgba(10,14,30,0.55)", e = p.eyes, t = p.t;
  c.save(); c.translate(cx, cy); c.scale(s, s);
  c.fillStyle = ink;
  body(c, p);
  // antenna (or rotor), then the head
  if (p.variant === "drone") { const sp = Math.cos(TAU * t * 3); rr(c, -0.035, -0.5, 0.07, 0.16, 0.03); c.fill(); c.beginPath(); c.ellipse(0, -0.52, 0.34 * Math.abs(sp) + 0.04, 0.035, 0, 0, TAU); c.fill(); }
  else {
    rr(c, -0.05, -0.5, 0.1, 0.18, 0.04); c.fill();
    if (p.ring) { c.globalAlpha = 0.35 * p.ring; c.fillStyle = p.antenna; c.beginPath(); c.arc(0, -0.56, 0.085 + 0.08 * p.ring, 0, TAU); c.fill(); c.globalAlpha = 1; }
    c.fillStyle = p.antenna; c.beginPath(); c.arc(0, -0.56, 0.085, 0, TAU); c.fill(); c.fillStyle = ink;
  }
  rr(c, -0.5, -0.36, 1, 0.72, 0.26); c.fill();
  // the visor and the eyes on it
  c.fillStyle = visor; rr(c, -0.36, -0.2, 0.72, 0.42, 0.16); c.fill();
  c.fillStyle = ink; c.strokeStyle = ink; c.lineCap = "round";
  const lx = e.look * 0.06, hh = Math.max(0.012, e.h * (1 - 0.9 * e.blink));
  [-1, 1].forEach((sd) => {
    const x = sd * 0.15 + lx, y = 0.01;
    if (e.done < 1) { c.globalAlpha = 1 - e.done; c.save(); c.translate(x, y); c.rotate(sd * e.tilt); rr(c, -e.w / 2, -hh / 2, e.w, hh, Math.min(0.04, hh / 2)); c.fill(); c.restore(); }
    if (e.done > 0) { c.globalAlpha = e.done; c.lineWidth = 0.045; c.beginPath(); c.arc(x, y + 0.05, 0.065, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    c.globalAlpha = 1;
  });
  if (p.dots) [-1, 0, 1].forEach((i) => { const b = Math.max(0, Math.sin(TAU * t - (i + 1) * 0.9)); c.globalAlpha = p.dots!; c.beginPath(); c.arc(i * 0.07, 0.14 - b * 0.03, 0.022, 0, TAU); c.fill(); c.globalAlpha = 1; });
  c.restore();
};
