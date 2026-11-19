// Draws every <canvas class="bot"> on the page with the bot's own code (glyphPose.ts), animated with
// requestAnimationFrame. The loop stops while the page is hidden, and with prefers-reduced-motion the bot
// is drawn as a still frame only when something changes.
//
// A canvas says what to draw through data attributes:
//   data-anim     idle | work | alert | done | error | sleep | wave | swim | dance
//   data-ground   the colour seen through the visor (the surface behind the bot)
//   data-bg       a colour to fill the canvas with first; omit for a transparent canvas
//   data-ink      the bot's body colour (default white)
//   data-face     a face item (glasses, shades, blush, hearts, stars, moustache)
//   data-outfit   an outfit (party, beanie, crown, wizard, bow, headphones, bowtie, scarf)
import { drawPosed, LOOP_S, type Anim, type FaceItem, type Outfit } from "./glyphPose";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let frame = 0;

const drawOne = (cv: HTMLCanvasElement, t: number) => {
  const w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return;
  const dpr = window.devicePixelRatio || 1;
  const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
  if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
  const c = cv.getContext("2d");
  if (!c) return;
  const d = cv.dataset;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (d.bg) { c.fillStyle = d.bg; c.fillRect(0, 0, w, h); } else c.clearRect(0, 0, w, h);
  const s = Math.min(w / 1.45, h / 1.78);
  drawPosed(c, w / 2, h * 0.47, s, (d.anim as Anim) || "idle", t, {
    ground: d.ground || d.bg || "#000000",
    ink: d.ink || undefined,
    face: (d.face as FaceItem) || "none",
    outfit: (d.outfit as Outfit) || "none",
  });
};

const drawAll = (t: number) => {
  document.querySelectorAll<HTMLCanvasElement>("canvas.bot").forEach((cv) => drawOne(cv, t));
};

// a calm still frame for reduced motion: past the first blink and hop of every animation
const STILL_T = 1.2;

const tick = (now: number) => {
  frame = 0;
  if (document.hidden) return;
  if (reducedMotion.matches) { drawAll(STILL_T); return; }
  drawAll((now / 1000) % LOOP_S);
  frame = requestAnimationFrame(tick);
};

const start = () => { if (!frame) frame = requestAnimationFrame(tick); };

/** Call after the page's markup changes, so new or changed bots are drawn (needed with reduced motion). */
export const refreshBots = () => start();

/** Starts the loop for this page; it pauses while the window is hidden. */
export const startBots = () => {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start();
  });
  reducedMotion.addEventListener("change", start);
  window.addEventListener("resize", start);
  start();
};
