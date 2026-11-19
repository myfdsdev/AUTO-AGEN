import { rng, type Ctx } from "./core";

// AUTO, the AutoAgent bot. One geometry, drawn by two hands (flat vector, marker comic) through
// the Style hooks below, so the character is identical in both and only the marks change.
//
// DESIGN (original, deliberately unlike Coucou's Mochi, a soft squircle whose whole body is a face):
// a small robot with a HEAD() that is a helmet with a dark VISOR() screen (the face is light on the
// screen, so its eyes can change shape per state), two EAR PODS like headphones, an ANTENNA whose
// bulb is the status light, a cup-shaped BODY() with a chest light, mitten ARMS, and no legs: it
// hovers on a glow, because it pops down out of the top of the screen.
// Construction: hand-placed cubic paths for every form (no ellipses for the forms; circles only
// for the bulb, the chest light and the mitts, which are round objects). One light, upper left.
// Proportions: head 316 wide x 238 tall, body 168 wide, head:body about 3:2 (baby schema: the
// big head and small body read as young and friendly at 16 px as well as at 600 px).

export type Mood = "greet" | "idle" | "working" | "waiting" | "done" | "error";
export const MOOD_COLOR: Record<Mood, string> = { greet: "#3fd9b8", idle: "#3fd9b8", working: "#4c8dff", waiting: "#ffb020", done: "#33cf7f", error: "#ff5a5f" };
export const MOOD_LABEL: Record<Mood, string> = { greet: "Hello", idle: "Idle", working: "Working", waiting: "Needs you", done: "Done", error: "Error" };

export const PAL = {
  shell: "#ff8a4c", shellS: "#dd6436", shellL: "#ffb184", belly: "#fff1e2", bellyS: "#f2d6bd",
  visor: "#1e2342", visorS: "#151830", visorL: "#39407a", ear: "#2b3160", earS: "#1c2146", earL: "#4a5296",
  stalk: "#2b3160", eye: "#7ff5e1", tablet: "#2b3160", tabletS: "#1c2146", white: "#ffffff", drop: "#9fd9ff",
};

export type Box = [number, number, number, number];
export interface Style {
  // a solid form: shade colour under, base colour shifted toward the light, optional highlight
  form(c: Ctx, p: Path2D, base: string, shade: string, o: { box: Box; seed: number; hi?: Path2D; hiCol?: string; shift?: [number, number] }): void;
  // a flat accent (eyes, lights, chest panel)
  flat(c: Ctx, p: Path2D, col: string, o: { box: Box; seed: number }): void;
  // a stroke-built shape (antenna stalk, arms, happy-eye arcs): drawn by build() as an open path
  thick(c: Ctx, build: (p: Path2D) => void, w: number, col: string, seed: number): void;
  // the outline pass for a form (marker comic only; flat vector has no lines)
  ink(c: Ctx, p: Path2D, centre: [number, number]): void;
  glow(c: Ctx, col: string): void; // the hover glow under the body
  extraLines(c: Ctx, mood: Mood): void; // motion lines etc. (marker only)
  lineW: number; // contour width in local units, set per bot by drawBot
}

const once = <T,>(f: () => T) => { let v: T | undefined; return () => (v ??= f()); };
const path = (f: (p: Path2D) => void) => { const p = new Path2D(); f(p); return p; };
const pill = (cx: number, cy: number, w: number, h: number) => path((p) => { const r = Math.min(w, h) / 2; p.roundRect(cx - w / 2, cy - h / 2, w, h, r); });
const disc = (cx: number, cy: number, r: number) => path((p) => { p.moveTo(cx + r, cy); p.arc(cx, cy, r, 0, Math.PI * 2); });

// ---------------------------------------------------------------- the forms (head-centred units)
const HEAD = once(() => path((p) => { p.moveTo(0, -122); p.bezierCurveTo(95, -124, 152, -110, 158, -40); p.bezierCurveTo(162, 30, 150, 96, 96, 108); p.bezierCurveTo(50, 116, -50, 116, -96, 108); p.bezierCurveTo(-150, 96, -162, 30, -158, -40); p.bezierCurveTo(-152, -110, -95, -124, 0, -122); p.closePath(); }));
const HEAD_HI = once(() => path((p) => { p.moveTo(-128, -58); p.bezierCurveTo(-124, -96, -88, -112, -40, -114); p.bezierCurveTo(-76, -100, -102, -84, -112, -50); p.closePath(); }));
const VISOR = once(() => path((p) => { p.moveTo(0, -76); p.bezierCurveTo(82, -78, 122, -66, 124, -10); p.bezierCurveTo(126, 42, 104, 64, 0, 66); p.bezierCurveTo(-104, 64, -126, 42, -124, -10); p.bezierCurveTo(-122, -66, -82, -78, 0, -76); p.closePath(); }));
const VISOR_SHINE = once(() => path((p) => { p.moveTo(-108, -42); p.bezierCurveTo(-100, -62, -72, -68, -40, -68); p.lineTo(-62, -48); p.bezierCurveTo(-82, -46, -96, -42, -106, -30); p.closePath(); }));
const ear = (s: number) => path((p) => { p.moveTo(148 * s, -44); p.bezierCurveTo(178 * s, -50, 196 * s, -30, 196 * s, 0); p.bezierCurveTo(196 * s, 30, 178 * s, 50, 148 * s, 44); p.closePath(); });
const earKnob = (s: number) => pill(184 * s, 0, 8, 34);
const BODY = once(() => path((p) => { p.moveTo(-84, 100); p.bezierCurveTo(-92, 168, -58, 230, 0, 234); p.bezierCurveTo(58, 230, 92, 168, 84, 100); p.closePath(); }));
const CHEST = once(() => path((p) => { p.moveTo(-40, 142); p.bezierCurveTo(-40, 130, 40, 130, 40, 142); p.lineTo(36, 180); p.bezierCurveTo(34, 194, -34, 194, -36, 180); p.closePath(); }));
const BULB = once(() => disc(12, -192, 19)), BULB_SHINE = once(() => disc(5, -199, 5.5));
const MITT = (x: number, y: number, thumbDx: number) => path((p) => { p.moveTo(x + 21, y); p.arc(x, y, 21, 0, Math.PI * 2); p.moveTo(x + thumbDx + 9, y - 14); p.arc(x + thumbDx, y - 14, 9, 0, Math.PI * 2); });
const TABLET = once(() => path((p) => { p.roundRect(-70, 168, 140, 66, 12); }));
const TABLET_SCREEN = once(() => path((p) => { p.roundRect(-58, 178, 116, 46, 7); }));
const BUBBLE = once(() => path((p) => { p.roundRect(128, -232, 62, 62, 20); p.moveTo(140, -176); p.lineTo(128, -150); p.lineTo(158, -172); p.closePath(); }));
const DROP = once(() => path((p) => { p.moveTo(130, -104); p.bezierCurveTo(140, -88, 146, -80, 146, -71); p.bezierCurveTo(146, -62, 139, -56, 130, -56); p.bezierCurveTo(121, -56, 114, -62, 114, -71); p.bezierCurveTo(114, -80, 120, -88, 130, -104); p.closePath(); }));

const HEAD_BOX: Box = [-162, -124, 162, 116], BODY_BOX: Box = [-92, 100, 92, 234];
// arms: shoulder -> elbow control -> hand, per mood (left, right)
const ARMS: Record<Mood, [[number, number], [number, number]][]> = {
  idle: [[[-96, 190], [-108, 214]], [[96, 190], [108, 214]]],
  greet: [[[-96, 190], [-108, 214]], [[176, 128], [212, 34]]],
  working: [[[-96, 196], [-70, 212]], [[96, 196], [70, 212]]],
  waiting: [[[-96, 190], [-108, 214]], [[166, 108], [196, -40]]],
  done: [[[-170, 120], [-206, 46]], [[170, 120], [206, 46]]],
  error: [[[-150, 150], [-134, 96]], [[150, 150], [134, 96]]],
};

const eyes = (c: Ctx, s: Style, mood: Mood) => {
  const E = PAL.eye;
  const smile = (y: number, w: number) => s.thick(c, (p) => { p.moveTo(-w, y); p.quadraticCurveTo(0, y + w * 0.7, w, y); }, 7, E, 41);
  if (mood === "idle") { [-44, 44].forEach((x, i) => s.flat(c, pill(x, -12, 28, 42), E, { box: [x - 14, -33, x + 14, 9], seed: 30 + i })); smile(28, 12); }
  if (mood === "greet" || mood === "done") { [-44, 44].forEach((x, i) => s.thick(c, (p) => { p.moveTo(x - 19, -2); p.quadraticCurveTo(x, -38, x + 19, -2); }, 11, E, 32 + i)); s.flat(c, path((p) => { p.moveTo(-18, 22); p.quadraticCurveTo(0, 46, 18, 22); p.closePath(); }), E, { box: [-18, 22, 18, 40], seed: 35 }); }
  if (mood === "working") {
    [-44, 44].forEach((x, i) => s.flat(c, path((p) => { p.moveTo(x - 16, -14); p.lineTo(x + 16, -14); p.lineTo(x + 16, -2); p.bezierCurveTo(x + 16, 12, x - 16, 12, x - 16, -2); p.closePath(); }), E, { box: [x - 16, -14, x + 16, 10], seed: 36 + i }));
    [-22, 0, 22].forEach((x, i) => s.flat(c, disc(x, 34, 5.5), i === 1 ? PAL.white : E, { box: [x - 6, 28, x + 6, 40], seed: 38 + i }));
  }
  if (mood === "waiting") { [-44, 44].forEach((x, i) => { s.flat(c, pill(x, -12, 36, 50), E, { box: [x - 18, -37, x + 18, 13], seed: 42 + i }); s.flat(c, disc(x - 7, -24, 5.5), PAL.white, { box: [x - 13, -30, x - 1, -18], seed: 44 + i }); }); s.flat(c, pill(0, 34, 12, 14), E, { box: [-6, 27, 6, 41], seed: 46 }); }
  if (mood === "error") {
    [-44, 44].forEach((x, i) => {
      s.flat(c, pill(x, -8, 28, 38), E, { box: [x - 14, -27, x + 14, 11], seed: 47 + i });
      const o = x < 0 ? -1 : 1; // the lid drops on the OUTER side: a worried brow, inner ends raised
      c.fillStyle = PAL.visor; c.beginPath(); c.moveTo(x - 20, -40); c.lineTo(x + 20, -40); c.lineTo(x + 20, o > 0 ? -2 : -26); c.lineTo(x - 20, o > 0 ? -26 : -2); c.closePath(); c.fill();
    });
    s.thick(c, (p) => { p.moveTo(-18, 34); p.lineTo(-9, 28); p.lineTo(0, 34); p.lineTo(9, 28); p.lineTo(18, 34); }, 6, E, 49);
  }
};

// ---------------------------------------------------------------- the whole bot
export const drawBot = (c: Ctx, s: Style, x: number, y: number, k: number, mood: Mood) => {
  const col = MOOD_COLOR[mood];
  c.save(); c.translate(x, y); c.scale(k, k);
  s.lineW = (2.4 + 2.4 * k) / k;

  // ground shadow, then the hover glow it floats on
  s.flat(c, path((p) => { p.ellipse(0, 344, 92, 13, 0, 0, Math.PI * 2); }), "rgba(30,35,66,0.16)", { box: [-92, 331, 92, 357], seed: 1 });
  s.glow(c, col);

  // the body, with the head's cast shadow across its shoulders
  s.form(c, BODY(), PAL.shell, PAL.shellS, { box: BODY_BOX, seed: 2, shift: [-18, -10] });
  c.save(); c.clip(BODY()); c.translate(10, 16); c.fillStyle = "rgba(120,40,20,0.28)"; c.fill(HEAD()); c.restore();
  s.ink(c, BODY(), [0, 170]);
  s.form(c, CHEST(), PAL.belly, PAL.bellyS, { box: [-40, 130, 40, 194], seed: 3, shift: [-6, -4] }); s.ink(c, CHEST(), [0, 162]);
  s.flat(c, disc(0, 162, 11), col, { box: [-11, 151, 11, 173], seed: 4 }); s.flat(c, disc(-3, 158, 3.5), PAL.white, { box: [-7, 154, 1, 162], seed: 5 });

  // a tablet held in front while working
  if (mood === "working") { s.form(c, TABLET(), PAL.tablet, PAL.tabletS, { box: [-70, 168, 70, 234], seed: 6, shift: [-6, -6] }); s.ink(c, TABLET(), [0, 200]); s.flat(c, TABLET_SCREEN(), "#5d9bff", { box: [-58, 178, 58, 224], seed: 7 }); [190, 202, 214].forEach((ly, i) => s.flat(c, pill(-30 + i * 6, ly, 52 - i * 14, 5), "#cfe0ff", { box: [-56, ly - 3, 26, ly + 3], seed: 8 + i })); }

  // ear pods, then the head over them
  [-1, 1].forEach((sd, i) => { s.form(c, ear(sd), PAL.ear, PAL.earS, { box: sd > 0 ? [148, -50, 196, 50] : [-196, -50, -148, 50], seed: 10 + i, shift: [-6, -6] }); s.ink(c, ear(sd), [172 * sd, 0]); s.flat(c, earKnob(sd), PAL.earL, { box: [180 * sd - 4, -17, 188 * sd + 4, 17], seed: 12 + i }); });
  s.thick(c, (p) => { p.moveTo(0, -116); p.quadraticCurveTo(3, -150, 11, -176); }, 11, PAL.stalk, 13);
  s.form(c, HEAD(), PAL.shell, PAL.shellS, { box: HEAD_BOX, seed: 14, shift: [-24, -18], hi: HEAD_HI(), hiCol: PAL.shellL });
  s.ink(c, HEAD(), [0, -4]);
  s.form(c, VISOR(), PAL.visor, PAL.visorS, { box: [-126, -78, 126, 66], seed: 15, shift: [-10, -8] });
  s.flat(c, VISOR_SHINE(), "rgba(90,100,180,0.55)", { box: [-108, -68, -40, -30], seed: 16 });
  s.ink(c, VISOR(), [0, -6]);
  eyes(c, s, mood);

  // the status light
  const rings = mood === "waiting" ? [46, 32] : mood === "error" ? [34] : [30];
  rings.forEach((r, i) => s.flat(c, disc(12, -192, r), col + (i === 0 ? "33" : "55"), { box: [12 - r, -192 - r, 12 + r, -192 + r], seed: 17 + i }));
  s.flat(c, BULB(), col, { box: [-7, -211, 31, -173], seed: 19 }); s.ink(c, BULB(), [12, -192]); s.flat(c, BULB_SHINE(), "rgba(255,255,255,0.85)", { box: [0, -205, 11, -193], seed: 20 });

  // arms over everything else they reach across, mitts last
  ARMS[mood].forEach(([ctl, hand], i) => {
    const sd = i === 0 ? -1 : 1, sh: [number, number] = [80 * sd, 142];
    s.thick(c, (p) => { p.moveTo(sh[0], sh[1]); p.quadraticCurveTo(ctl[0], ctl[1], hand[0], hand[1]); }, 22, PAL.shellS, 21 + i);
    const m = MITT(hand[0], hand[1], -10 * sd);
    s.form(c, m, PAL.shell, PAL.shellS, { box: [hand[0] - 30, hand[1] - 30, hand[0] + 30, hand[1] + 24], seed: 23 + i, shift: [-6, -6] });
    s.ink(c, m, hand);
  });

  // mood extras
  if (mood === "waiting") { s.form(c, BUBBLE(), MOOD_COLOR.waiting, "#e0950c", { box: [128, -232, 190, -150], seed: 25, shift: [-5, -5] }); s.ink(c, BUBBLE(), [159, -200]); s.flat(c, pill(159, -206, 10, 26), PAL.white, { box: [154, -219, 164, -193], seed: 26 }); s.flat(c, disc(159, -184, 5.5), PAL.white, { box: [153, -190, 165, -178], seed: 27 }); }
  if (mood === "error") { s.form(c, DROP(), PAL.drop, "#6fb7e8", { box: [114, -104, 146, -56], seed: 28, shift: [-4, -4] }); s.ink(c, DROP(), [130, -72]); }
  if (mood === "done") {
    const r = rng(9), cols = [MOOD_COLOR.done, MOOD_COLOR.waiting, MOOD_COLOR.working, PAL.shell, "#c86bff"];
    for (let i = 0; i < 16; i++) { const a = -Math.PI * (0.08 + 0.84 * (i / 15)) + (r() - 0.5) * 0.2, d = 168 + r() * 52, px = Math.cos(a) * d * 1.05, py = Math.sin(a) * d * 0.8 - 70, rot = r() * Math.PI; c.save(); c.translate(px, py); c.rotate(rot); const piece = i % 3 === 0 ? path((p) => { p.moveTo(0, -8); p.lineTo(8, 6); p.lineTo(-8, 6); p.closePath(); }) : pill(0, 0, 16, 7); s.flat(c, piece, cols[i % cols.length], { box: [-8, -8, 8, 8], seed: 60 + i }); c.restore(); }
  }
  s.extraLines(c, mood);
  c.restore();
};

export const roundedCard = (x: number, y: number, w: number, h: number, r: number) => path((p) => p.roundRect(x, y, w, h, r));
export const notchTab = (cx: number, w: number, h: number) => path((p) => { p.moveTo(cx - w / 2 - 18, 0); p.quadraticCurveTo(cx - w / 2, 0, cx - w / 2, 18); p.lineTo(cx - w / 2, h - 26); p.quadraticCurveTo(cx - w / 2, h, cx - w / 2 + 26, h); p.lineTo(cx + w / 2 - 26, h); p.quadraticCurveTo(cx + w / 2, h, cx + w / 2, h - 26); p.lineTo(cx + w / 2, 18); p.quadraticCurveTo(cx + w / 2, 0, cx + w / 2 + 18, 0); p.closePath(); });
export const SHEET_MOODS: Mood[] = ["idle", "working", "waiting", "done", "error"];
// the sheet layout shared by both hands: hero on the left under a notch, five mood cards right
export const CARDS: [number, number][] = [[800, 70], [1060, 70], [1320, 70], [930, 470], [1190, 470]];
export const CARD_W = 236, CARD_H = 360;
