// GLYPH POSE · the reference look (white robot head, short antenna with a ball, dark visor with two
// square eyes, three plain round-ended legs, flat mint ground), rebuilt from scratch with every part
// posable, plus nine animations as pure functions of time. Each animation loops in 4 s.
//   wave   lifts the right leg and waves hello, happy eyes
//   swim   jellyfish strokes: legs open and pull, the body rises on each pull
//   dance  sways to a beat, kicks left and right, music notes
//   work   focused squint, typing dots, legs tapping
//   alert  "needs you": two hops, wide eyes, a "!" and a pulsing antenna
//   done   jumps, spins once, lands with a squash, sparkles
//   sleep  eyes shut, slow breathing, drooping antenna, z's floating up
//   error  shakes, X eyes, a sweat drop
//   idle   floats, looks left and right, blinks
import type { Ctx } from "./core";

export type Anim = "wave" | "swim" | "dance" | "work" | "alert" | "done" | "sleep" | "error" | "idle";
export const ANIMS: Anim[] = ["wave", "swim", "dance", "work", "alert", "done", "sleep", "error", "idle"];
export const ANIM_LABEL: Record<Anim, string> = { wave: "Hello", swim: "Swim", dance: "Dance", work: "Working", alert: "Needs you", done: "Done", sleep: "Sleep", error: "Error", idle: "Look around" };
export const LOOP_S = 4;

type EyeKind = "sq" | "happy" | "closed" | "x";
type Leg = { ang: number; bend: number; len: number; bx?: number; by?: number }; // bx/by move the leg's root (a waving leg comes out from the side of the head)
export type Pose = { x: number; y: number; rot: number; sx: number; sy: number; legs: [Leg, Leg, Leg]; eye: EyeKind; ew: number; eh: number; look: number; blink: number; antenna: number; ring: number; dots: number };
type Extra = { kind: "bang" | "spark" | "z" | "note" | "drop" | "hi"; x: number; y: number; s: number; a: number; rot?: number };

const TAU = Math.PI * 2;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ss = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const seg = (t: number, a: number, b: number) => ss((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const LEGX = [-0.22, 0, 0.22];
const BASE: Leg[] = [{ ang: -0.16, bend: -0.55, len: 0.56 }, { ang: 0, bend: 0, len: 0.58 }, { ang: 0.12, bend: 0.28, len: 0.56 }];
const rest = (): Pose => ({ x: 0, y: 0, rot: 0, sx: 1, sy: 1, legs: BASE.map((l) => ({ ...l })) as [Leg, Leg, Leg], eye: "sq", ew: 0.13, eh: 0.13, look: 0, blink: 0, antenna: 0, ring: 0, dots: 0 });
const blinkAt = (t: number, times: number[]) => Math.max(0, ...times.map((b) => { const u = (t - b) / 0.16; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; }));

// ---------------------------------------------------------------- the nine animations
export const animate = (a: Anim, t: number): { pose: Pose; extras: Extra[] } => {
  const p = rest(), ex: Extra[] = [];
  const bob = Math.sin((TAU * t) / 2) * 0.02; p.y = bob;
  if (a === "wave") {
    const lift = seg(t, 0.25, 0.65) * (1 - seg(t, 3.15, 3.6)), w = Math.sin(TAU * 2.5 * t);
    p.legs[2] = { ang: lerp(0.12, 2.3, lift) + lift * 0.32 * w, bend: lerp(0.28, -0.7, lift) + lift * 0.35 * Math.sin(TAU * 2.5 * t + 1.1), len: lerp(0.56, 0.6, lift), bx: 0.2 * lift, by: -0.14 * lift };
    p.legs[0].ang = -0.16 - 0.1 * lift; p.rot = -0.07 * lift; p.x = -0.03 * lift;
    p.eye = lift > 0.5 ? "happy" : "sq"; p.antenna = 0.15 * lift * w;
    if (lift > 0.05) ex.push({ kind: "hi", x: -0.62, y: -0.62, s: lift, a: lift });
  }
  if (a === "swim") {
    const c = Math.sin((TAU * t) / 2), pull = Math.sin((TAU * t) / 2 - 0.9);
    p.legs = [{ ang: -0.2 - 0.45 * c, bend: -0.3 + 0.8 * c, len: 0.56 }, { ang: 0, bend: 0.35 * c, len: 0.6 }, { ang: 0.2 + 0.45 * c, bend: 0.3 - 0.8 * c, len: 0.56 }];
    p.y = -0.07 * pull; p.sy = 1 + 0.03 * c; p.sx = 1 - 0.03 * c; p.antenna = -0.12 * pull; p.blink = blinkAt(t, [1.4]);
  }
  if (a === "dance") {
    const b = Math.sin(TAU * t); // one sway per second
    p.rot = 0.14 * b; p.x = 0.05 * b; p.y = -0.05 * Math.abs(Math.sin(TAU * t));
    p.legs[0] = { ang: -0.16 - 0.7 * Math.max(0, -b), bend: -0.55 + 0.5 * Math.max(0, -b), len: 0.56 };
    p.legs[2] = { ang: 0.12 + 0.7 * Math.max(0, b), bend: 0.28 - 0.5 * Math.max(0, b), len: 0.56 };
    p.legs[1].bend = 0.25 * b; p.eye = "happy"; p.antenna = -0.25 * b;
    [0, 1].forEach((i) => { const k = ((t / 2 + i * 0.5) % 1); ex.push({ kind: "note", x: (i ? 0.62 : -0.66) + 0.08 * Math.sin(TAU * k), y: -0.2 - 0.55 * k, s: 0.9, a: Math.sin(Math.PI * k), rot: 0.2 * Math.sin(TAU * k) }); });
  }
  if (a === "work") {
    p.eye = "sq"; p.eh = 0.045; p.ew = 0.15; p.look = 0.5; p.dots = 1; p.y = 0.012 * Math.sin(TAU * 2 * t);
    p.legs.forEach((l, i) => { l.bend += 0.28 * Math.sin(TAU * 4 * t + i * 2.1); l.ang += 0.06 * Math.sin(TAU * 4 * t + i * 2.1 + 1); });
  }
  if (a === "alert") {
    const u = t % 2, hop = u < 0.7 ? Math.abs(Math.sin((Math.PI * u) / 0.35)) : 0;
    p.y = bob - 0.09 * hop; p.eye = "sq"; p.ew = 0.15; p.eh = 0.2; p.ring = 0.5 + 0.5 * Math.sin(TAU * 1.5 * t);
    p.legs[0].ang -= 0.3 * hop; p.legs[2].ang += 0.3 * hop; p.sy = 1 + 0.04 * hop; p.sx = 1 - 0.03 * hop;
    ex.push({ kind: "bang", x: 0.66, y: -0.56 + p.y, s: 1 + 0.12 * Math.sin(TAU * 1.5 * t), a: 1, rot: 0.14 });
  }
  if (a === "done") {
    const j = clamp((t - 0.3) / 0.6), up = t > 0.3 && t < 0.9 ? Math.sin(Math.PI * j) : 0, land = t > 0.9 && t < 1.15 ? Math.sin((Math.PI * (t - 0.9)) / 0.25) : 0;
    p.y = bob - 0.24 * up; p.rot = TAU * ss(j) * (t > 0.3 ? 1 : 0); p.sx = 1 + 0.08 * land; p.sy = 1 - 0.1 * land;
    p.legs[0] = { ang: -0.16 - 0.6 * up, bend: -0.55 + 0.9 * up, len: 0.56 }; p.legs[2] = { ang: 0.12 + 0.6 * up, bend: 0.28 - 0.9 * up, len: 0.56 };
    p.eye = t > 0.2 && t < 3.6 ? "happy" : "sq";
    if (t > 0.8 && t < 2.3) { const k = clamp((t - 0.8) / 1.5); for (let i = 0; i < 6; i++) { const ang = -Math.PI * (0.08 + 0.84 * (i / 5)); ex.push({ kind: "spark", x: Math.cos(ang) * (0.6 + 0.3 * ss(k)), y: -0.1 + Math.sin(ang) * (0.6 + 0.3 * ss(k)) * 0.85, s: Math.sin(Math.PI * k) * (i % 2 ? 0.7 : 1), a: 1 }); } }
  }
  if (a === "sleep") {
    p.eye = "closed"; p.y = 0.03 + 0.015 * Math.sin((TAU * t) / 4); p.sy = 1 + 0.025 * Math.sin((TAU * t) / 4); p.antenna = 0.45; p.rot = 0.05;
    p.legs = [{ ang: -0.3, bend: -0.7, len: 0.54 }, { ang: 0.05, bend: 0.2, len: 0.56 }, { ang: 0.3, bend: 0.5, len: 0.54 }];
    [0, 1, 2].forEach((i) => { const k = ((t / 4 + i / 3) % 1); ex.push({ kind: "z", x: 0.45 + 0.25 * k + 0.05 * Math.sin(TAU * k * 2), y: -0.5 - 0.5 * k, s: 0.6 + 0.6 * k, a: Math.sin(Math.PI * k) }); });
  }
  if (a === "error") {
    const u = t % 2, sh = u < 0.6 ? Math.sin(TAU * 10 * u) * (1 - u / 0.6) : 0;
    p.x = 0.045 * sh; p.rot = 0.04 * sh; p.eye = "x"; p.antenna = 0.2 * sh;
    p.legs = [{ ang: 0.22, bend: -0.2, len: 0.56 }, { ang: 0, bend: 0.1 * sh, len: 0.56 }, { ang: -0.22, bend: 0.2, len: 0.56 }];
    ex.push({ kind: "drop", x: 0.56, y: -0.42 + 0.04 * Math.sin((TAU * t) / 2), s: 1, a: 1 });
  }
  if (a === "idle") {
    p.look = -seg(t, 0.4, 0.7) + 2 * seg(t, 1.4, 1.7) - seg(t, 2.4, 2.7); p.blink = blinkAt(t, [0.95, 3.2]);
    p.rot = 0.04 * p.look; p.legs.forEach((l, i) => { l.bend += 0.12 * Math.sin((TAU * t) / 2 + i); });
  }
  return { pose: p, extras: ex };
};

// ---------------------------------------------------------------- drawing
const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); };
const legPath = (x0: number, l: Leg): [number, number][] => { const n = 22, st = l.len / (n - 1), out: [number, number][] = []; let x = x0 + (l.bx ?? 0), y = 0.28 + (l.by ?? 0); for (let i = 0; i < n; i++) { out.push([x, y]); const a = l.ang + l.bend * (i / (n - 1)); x += Math.sin(a) * st; y += Math.cos(a) * st; } return out; };
const strokeLeg = (c: Ctx, pts: [number, number][], w: number) => { c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); };

export const drawPosed = (c: Ctx, cx: number, cy: number, s: number, a: Anim, t: number, o: { visor: string; ground: string; accent?: string }) => {
  const { pose: p, extras } = animate(a, t), ink = "#ffffff";
  // ground shadow, smaller as the bot rises
  c.fillStyle = "rgba(0,40,40,0.14)"; c.beginPath(); c.ellipse(cx + p.x * s, cy + 0.98 * s, s * 0.34 * (1 + p.y * 1.5), s * 0.045 * (1 + p.y * 1.5), 0, 0, TAU); c.fill();
  c.save(); c.translate(cx + p.x * s, cy + p.y * s); c.rotate(p.rot); c.scale(s * p.sx, s * p.sy);
  c.fillStyle = ink; c.strokeStyle = ink;
  p.legs.forEach((l, i) => strokeLeg(c, legPath(LEGX[i], l), 0.11));
  // antenna: a stem that pivots at the head, a ball, an optional pulse ring
  c.save(); c.translate(0, -0.34); c.rotate(p.antenna);
  rr(c, -0.045, -0.17, 0.09, 0.19, 0.04); c.fill();
  if (p.ring > 0) { c.globalAlpha = 0.45 * p.ring; c.beginPath(); c.arc(0, -0.22, 0.085 + 0.09 * p.ring, 0, TAU); c.fill(); c.globalAlpha = 1; }
  c.beginPath(); c.arc(0, -0.22, 0.085, 0, TAU); c.fill(); c.restore();
  rr(c, -0.5, -0.36, 1, 0.68, 0.24); c.fill();
  c.fillStyle = o.visor; rr(c, -0.36, -0.21, 0.72, 0.4, 0.15); c.fill();
  // eyes
  c.fillStyle = ink; c.strokeStyle = ink; c.lineCap = "round";
  const lx = p.look * 0.065, hh = Math.max(0.014, p.eh * (1 - 0.9 * p.blink));
  [-1, 1].forEach((sd) => {
    const x = sd * 0.15 + lx, y = -0.01;
    if (p.eye === "sq") { rr(c, x - p.ew / 2, y - hh / 2, p.ew, hh, Math.min(0.035, hh / 2)); c.fill(); }
    if (p.eye === "happy") { c.lineWidth = 0.05; c.beginPath(); c.arc(x, y + 0.05, 0.065, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    if (p.eye === "closed") { c.lineWidth = 0.04; c.beginPath(); c.arc(x, y - 0.03, 0.06, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); }
    if (p.eye === "x") { c.lineWidth = 0.04; c.beginPath(); c.moveTo(x - 0.05, y - 0.05); c.lineTo(x + 0.05, y + 0.05); c.moveTo(x + 0.05, y - 0.05); c.lineTo(x - 0.05, y + 0.05); c.stroke(); }
  });
  if (p.dots) [-1, 0, 1].forEach((i) => { const b = Math.max(0, Math.sin(TAU * 2 * t - (i + 1) * 0.9)); c.beginPath(); c.arc(i * 0.07, 0.12 - b * 0.03, 0.022, 0, TAU); c.fill(); });
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
