// GLYPH STYLES · the bot's colour per app state, its face items and its outfits, one sheet.
// The visor is a hole, so it always shows the tile's colour: every state colour recolours the face too.
import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import { POPPINS_BOLD } from "../../assets/fonts/poppinsBold";
import { registerFaces } from "./launchLook";
import { FACE_ITEMS, OUTFITS, drawPosed, type Anim, type FaceItem, type Outfit } from "./glyphPose";

registerFaces([{ family: "Poppins", file: { data: POPPINS_BOLD, format: "ttf", path: "Poppins-Bold.ttf" } } as never]);
const W = 1600, H = 980, MINT = "#1af1d6", INK = "#0f2d2a";

export const STATE_COLOURS: [string, string, Anim, number][] = [
  ["Idle", MINT, "idle", 0], ["Working", "#4c8dff", "work", 0.3], ["Needs you", "#ffb020", "alert", 1.0], ["Success", "#2fd27a", "done", 1.6],
  ["Error", "#ff5a5f", "error", 1.0], ["Sleeping", "#8a5cff", "sleep", 1.0], ["Chatting", "#ff6fa5", "wave", 1.3], ["Offline", "#9aa3b5", "idle", 1.03],
];
const FACE_LABEL: Record<FaceItem, string> = { none: "None", glasses: "Glasses", shades: "Shades", blush: "Blush", hearts: "Heart eyes", stars: "Star eyes", moustache: "Moustache" };
const OUTFIT_LABEL: Record<Outfit, string> = { none: "None", party: "Party hat", beanie: "Beanie", crown: "Crown", wizard: "Wizard", bow: "Bow", headphones: "Headphones", bowtie: "Bow tie", scarf: "Scarf" };

const T = 172, G = 18;
const row = (n: number) => (W - (n * T + (n - 1) * G)) / 2;
const font = (w: number, px: number) => `${w} ${px}px "Poppins", "Segoe UI", sans-serif`;
const tile = (c: Ctx, x: number, y: number, bg: string, label: string, draw: (cx: number, cy: number) => void, sub?: string) => {
  c.save(); c.beginPath(); c.roundRect(x, y, T, T, 40); c.fillStyle = bg; c.fill(); c.clip(); draw(x + T / 2, y + 82); c.restore();
  c.font = font(700, 16); c.fillStyle = INK; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.fillText(label, x + T / 2, y + T + 26);
  if (sub) { c.font = font(600, 12); c.fillStyle = "rgba(15,45,42,0.45)"; c.fillText(sub, x + T / 2, y + T + 44); }
};
const section = (c: Ctx, y: number, title: string, note: string) => {
  c.font = font(700, 20); c.fillStyle = INK; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText(title, row(8), y); const w = c.measureText(title).width;
  c.font = font(600, 14); c.fillStyle = "rgba(15,45,42,0.45)"; c.fillText(note, row(8) + w + 14, y - 1);
};

export const drawGlyphStyles = (c: Ctx, _f: number, env: Env) => {
  c.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  c.fillStyle = "#eefbf8"; c.fillRect(0, 0, W, H);
  c.font = font(700, 30); c.fillStyle = INK; c.textAlign = "left"; c.fillText("autoagent", row(8), 58);
  c.font = font(600, 16); c.fillStyle = "rgba(15,45,42,0.5)"; c.fillText("bot  ·  state colours, face items, outfits", row(8) + 172, 57);

  section(c, 112, "State colours", "the ground and the visor take the state's colour");
  STATE_COLOURS.forEach(([label, col, anim, t], i) => tile(c, row(8) + i * (T + G), 128, col, label, (cx, cy) => drawPosed(c, cx, cy, 85, anim, t, { ground: col }), col));

  section(c, 432, "Face items", "worn on the visor, any state");
  FACE_ITEMS.forEach((f, i) => tile(c, row(6) + i * (T + G), 448, MINT, FACE_LABEL[f], (cx, cy) => drawPosed(c, cx, cy, 85, "idle", 0, { ground: MINT, face: f })));

  section(c, 732, "Outfits", "hats take the antenna's place; the rest wear with it");
  OUTFITS.forEach((w, i) => tile(c, row(8) + i * (T + G), 748, MINT, OUTFIT_LABEL[w], (cx, cy) => drawPosed(c, cx, cy, 85, "idle", 0, { ground: MINT, outfit: w })));
};

export const glyphStyles: Film = {
  meta: { title: "glyphStyles", W, H, fps: 30, bpm: 60, durationFrames: 1 },
  assets: { images: {} },
  shots: [{ id: "glyphStyles", start: 0, end: 1, draw: drawGlyphStyles }],
};
