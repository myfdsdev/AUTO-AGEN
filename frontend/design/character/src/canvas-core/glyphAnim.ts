// GLYPH ANIM · the jelly glyph bot alive, 8 s seamless loop, 1080x1080.
// The reference app (Coucou) makes its character feel alive with idle breathing, blinks, eyes that
// look around and a colour tint per state. We do the same with our own bot and timings:
//   0.0  idle       floats, tentacles sway, looks left then right, blinks
//   2.4  working    eyes narrow into a focused squint, typing dots bounce on the visor, ground turns blue
//   4.4  needs you  eyes go wide, it hops twice, a "!" pops beside it, the antenna pulses, ground amber
//   6.0  done       happy eyes, a jump with squash on landing, sparkles, ground green
//   7.4  idle       settles back to frame 0 (the loop seam)
// Every value is a pure function of the frame: bob and sway have a 2 s period, so 8 s closes the loop.
import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import { POPPINS_BOLD } from "../../assets/fonts/poppinsBold";
import { registerFaces } from "./launchLook";
import { deep, drawGlyph, type Eyes } from "./glyphBot";
const rgbHex = (rgb: string) => "#" + rgb.match(/\d+/g)!.map((n) => Number(n).toString(16).padStart(2, "0")).join("");

registerFaces([{ family: "Poppins", file: { data: POPPINS_BOLD, format: "ttf", path: "Poppins-Bold.ttf" } } as never]);
const W = 1080, H = 1080, FPS = 30, N = 240, TAU = Math.PI * 2;

type St = "idle" | "working" | "waiting" | "done";
const SEGS: [number, St][] = [[0, "idle"], [2.4, "working"], [4.4, "waiting"], [6.0, "done"], [7.4, "idle"]];
const BG: Record<St, string> = { idle: "#3fe0c0", working: "#4c8dff", waiting: "#ffb020", done: "#33d17f" };
const LABEL: Record<St, string> = { idle: "Idle", working: "Working…", waiting: "Needs you", done: "Done!" };
const XF = 0.3; // crossfade between states, s

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ss = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const seg = (t: number, a: number, b: number) => ss((t - a) / (b - a));
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (ws: [string, number][]) => { const s = ws.reduce((a, [, w]) => a + w, 0) || 1; const c = [0, 1, 2].map((k) => Math.round(ws.reduce((a, [h, w]) => a + hex(h)[k] * w, 0) / s)); return `rgb(${c.join(",")})`; };

// state weights at time t: each segment fades in over XF from the one before
const weights = (t: number): Record<St, number> => {
  const w: Record<St, number> = { idle: 0, working: 0, waiting: 0, done: 0 };
  let i = 0; while (i + 1 < SEGS.length && t >= SEGS[i + 1][0]) i++;
  const [t0, s] = SEGS[i], k = i === 0 ? 1 : ss((t - t0) / XF);
  w[s] += k; if (i > 0) w[SEGS[i - 1][1]] += 1 - k;
  return w;
};
const blink = (t: number) => Math.max(...[1.2, 3.6, 5.2, 7.7].map((b) => { const u = (t - b) / 0.16; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; }));
const idleLook = (t: number) => -seg(t, 0.6, 0.95) + 2 * seg(t, 1.4, 1.75) - seg(t, 2.0, 2.3);

const sparkle = (c: Ctx, x: number, y: number, r: number) => { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); };

const frame = (c: Ctx, f: number, env: Env) => {
  const t = f / FPS, w = weights(t);
  c.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  // the ground takes the state's colour, with a soft light behind the bot
  c.fillStyle = mixHex((Object.keys(w) as St[]).map((s) => [BG[s], w[s]])); c.fillRect(0, 0, W, H);
  const halo = c.createRadialGradient(540, 470, 40, 540, 470, 560); halo.addColorStop(0, "rgba(255,255,255,0.22)"); halo.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = halo; c.fillRect(0, 0, W, H);

  // motion: bob (2 s), excited hops while waiting, a jump with squash when done
  const hop = w.waiting * Math.abs(Math.sin((Math.PI * (t - 4.4)) / 0.4)) * 0.07 * (t > 4.4 && t < 6.0 ? 1 : 0);
  const jump = t > 6.0 && t < 6.6 ? Math.sin((Math.PI * (t - 6.0)) / 0.6) * 0.15 : 0;
  const land = t > 6.6 && t < 6.85 ? Math.sin((Math.PI * (t - 6.6)) / 0.25) : 0;
  const S = 420, bob = Math.sin(Math.PI * t) * 0.022, y = 470 + (bob - hop - jump) * S;
  const eyes: Eyes = {
    h: 0.13 * w.idle + 0.045 * w.working + 0.19 * w.waiting + 0.13 * w.done,
    w: 0.13 * w.idle + 0.15 * w.working + 0.15 * w.waiting + 0.13 * w.done,
    look: idleLook(t) * w.idle + 0.55 * w.working, blink: blink(t), done: w.done, tilt: 0,
  };
  // shadow on the ground, shrinking as it rises
  const lift = (bob + 0.03 - hop - jump) * 2;
  c.fillStyle = "rgba(10,14,30,0.16)"; c.beginPath(); c.ellipse(540, 930, 150 * (1 - lift * 0.5), 18 * (1 - lift * 0.5), 0, 0, TAU); c.fill();

  c.save(); c.translate(540, y); c.scale(1 + 0.07 * land, 1 - 0.09 * land); c.translate(-540, -y);
  const ring = w.waiting * (0.5 + 0.5 * Math.sin(TAU * t * 1.6));
  const visor = mixHex((Object.keys(w) as St[]).map((s) => [rgbHex(deep(BG[s])), w[s]]));
  drawGlyph(c, 540, y, S, { variant: "jelly", t, eyes, antenna: "#ffffff", visor, wave: 1 + 0.7 * w.waiting + 0.3 * w.done, dots: w.working, ring });
  c.restore();

  // "!" pops beside the head while it needs you
  const pop = seg(t, 4.5, 4.68) * (1 - seg(t, 5.8, 5.98)), over = pop * (1 + 0.18 * Math.sin(Math.PI * clamp((t - 4.5) / 0.3)));
  if (pop > 0.01) { c.save(); c.translate(540 + 0.62 * S, y - 0.5 * S); c.rotate(0.12); c.scale(over, over); c.fillStyle = "#ffffff"; c.beginPath(); c.roundRect(-46, -46, 92, 92, 28); c.fill(); c.fillStyle = BG.waiting; c.beginPath(); c.roundRect(-9, -30, 18, 40, 9); c.fill(); c.beginPath(); c.arc(0, 24, 10, 0, TAU); c.fill(); c.restore(); }
  // sparkles burst outward when done
  if (t > 6.05 && t < 7.4) { const k = clamp((t - 6.05) / 1.25); c.fillStyle = "#ffffff"; for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.05 + 0.9 * (i / 7)), d = (0.55 + 0.35 * ss(k)) * S, r = 22 * Math.sin(Math.PI * k) * (i % 2 ? 0.7 : 1); if (r > 0.5) sparkle(c, 540 + Math.cos(a) * d, 470 - 0.1 * S + Math.sin(a) * d * 0.8, r); } }

  // the state, as the app would say it
  c.font = `700 34px "Poppins", "Segoe UI", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
  (Object.keys(w) as St[]).forEach((s) => { if (w[s] < 0.02 || (s === "idle" && w.idle < 0.02)) return; c.globalAlpha = w[s]; const tw = c.measureText(LABEL[s]).width + 64; c.fillStyle = "rgba(255,255,255,0.92)"; c.beginPath(); c.roundRect(540 - tw / 2, 990 - 32, tw, 64, 32); c.fill(); c.fillStyle = "#14152a"; c.fillText(LABEL[s], 540, 992); c.globalAlpha = 1; });
};

export const glyphAnim: Film = {
  meta: { title: "glyphAnim", W, H, fps: FPS, bpm: 60, durationFrames: N, kind: "loop" },
  assets: { images: {} },
  shots: [{ id: "glyphAnim", start: 0, end: N, draw: frame }],
};
