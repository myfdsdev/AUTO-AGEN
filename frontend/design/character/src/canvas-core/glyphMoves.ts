// GLYPH MOVES · all nine animations of the posable glyph bot at once, a 3x3 grid, 4 s loop.
import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import { POPPINS_BOLD } from "../../assets/fonts/poppinsBold";
import { registerFaces } from "./launchLook";
import { deep } from "./glyphBot";
import { ANIMS, ANIM_LABEL, LOOP_S, drawPosed } from "./glyphPose";

registerFaces([{ family: "Poppins", file: { data: POPPINS_BOLD, format: "ttf", path: "Poppins-Bold.ttf" } } as never]);
const W = 1080, H = 1080, FPS = 30, MINT = "#37e2c8";

const draw = (c: Ctx, f: number, env: Env) => {
  const t = f / FPS;
  c.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  c.fillStyle = "#e6f8f4"; c.fillRect(0, 0, W, H);
  const G = 14, S = (W - 4 * G) / 3;
  ANIMS.forEach((a, i) => {
    const x = G + (i % 3) * (S + G), y = G + Math.floor(i / 3) * (S + G);
    c.save(); c.beginPath(); c.roundRect(x, y, S, S, 28); c.fillStyle = MINT; c.fill(); c.clip();
    drawPosed(c, x + S / 2, y + S * 0.42, S * 0.4, a, t, { visor: deep(MINT, 0.6), ground: MINT });
    c.restore();
    c.font = `700 19px "Poppins", "Segoe UI", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    const tw = c.measureText(ANIM_LABEL[a]).width + 30; c.fillStyle = "rgba(255,255,255,0.95)"; c.beginPath(); c.roundRect(x + S / 2 - tw / 2, y + S - 46, tw, 32, 16); c.fill();
    c.fillStyle = "#0f3b36"; c.fillText(ANIM_LABEL[a], x + S / 2, y + S - 29);
  });
};

export const glyphMoves: Film = {
  meta: { title: "glyphMoves", W, H, fps: FPS, bpm: 60, durationFrames: LOOP_S * FPS, kind: "loop" },
  assets: { images: {} },
  shots: [{ id: "glyphMoves", start: 0, end: LOOP_S * FPS, draw }],
};
