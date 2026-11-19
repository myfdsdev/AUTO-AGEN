// GLYPH SHEET · six variations of the minimal glyph bot, one per app-icon tile (glyphBot.ts).
import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import { POPPINS_BOLD } from "../../assets/fonts/poppinsBold";
import { registerFaces } from "./launchLook";
import { EYES_IDLE, deep, drawGlyph, type Variant } from "./glyphBot";

registerFaces([{ family: "Poppins", file: { data: POPPINS_BOLD, format: "ttf", path: "Poppins-Bold.ttf" } } as never]);
const W = 1600, H = 900;
const TILES: [Variant, string, string | [string, string], string][] = [
  ["jelly", "Jelly", "#3fe0c0", "#3fe0c0"],
  ["squid", "Squid", "#8a5cff", "#4ff5c8"],
  ["drone", "Drone", "#3aa2ff", "#ffffff"],
  ["ghost", "Ghost", "#ff4f7b", "#ffe08a"],
  ["rocket", "Rocket", "#0e0f1a", "#4ff5c8"],
  ["buddy", "Buddy", ["#ffae3d", "#ff4f7b"], "#ffffff"],
];

export const drawGlyphSheet = (c: Ctx, _f: number, env: Env) => {
  c.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  c.fillStyle = "#f2f2f6"; c.fillRect(0, 0, W, H);
  c.font = `700 30px "Poppins", "Segoe UI", sans-serif`; c.fillStyle = "#14152a"; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText("autoagent", 64, 76);
  c.font = `600 16px "Poppins", "Segoe UI", sans-serif`; c.fillStyle = "rgba(20,21,42,0.5)"; c.fillText("glyph bot  ·  six variations on one head", 236, 75);
  const S = 300, G = 60, x0 = (W - (3 * S + 2 * G)) / 2, y0 = 120;
  TILES.forEach(([v, name, bg, ant], i) => {
    const x = x0 + (i % 3) * (S + G), y = y0 + Math.floor(i / 3) * (S + 80);
    c.beginPath(); c.roundRect(x, y, S, S, 70);
    if (Array.isArray(bg)) { const g = c.createLinearGradient(x, y, x + S, y + S); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); c.fillStyle = g; } else c.fillStyle = bg;
    c.fill();
    const tall = v === "squid" || v === "ghost" || v === "rocket" ? 0.02 : 0;
    drawGlyph(c, x + S / 2, y + S * (0.44 - tall), S * 0.46, { variant: v, t: 0.35, eyes: EYES_IDLE, antenna: v === "jelly" ? "#ffffff" : ant, visor: v === "rocket" ? "#2a2f52" : deep(Array.isArray(bg) ? bg[1] : bg) });
    c.font = `700 18px "Poppins", "Segoe UI", sans-serif`; c.fillStyle = "#14152a"; c.textAlign = "center"; c.fillText(name, x + S / 2, y + S + 34);
  });
};

export const glyphSheet: Film = {
  meta: { title: "glyphSheet", W, H, fps: 30, bpm: 60, durationFrames: 1 },
  assets: { images: {} },
  shots: [{ id: "glyphSheet", start: 0, end: 1, draw: drawGlyphSheet }],
};
