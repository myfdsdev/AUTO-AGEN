// GLYPH WAVE · the posable glyph bot waving hello, full frame on mint, 4 s loop.
import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import { POPPINS_BOLD } from "../../assets/fonts/poppinsBold";
import { registerFaces } from "./launchLook";
import { deep } from "./glyphBot";
import { LOOP_S, drawPosed } from "./glyphPose";

registerFaces([{ family: "Poppins", file: { data: POPPINS_BOLD, format: "ttf", path: "Poppins-Bold.ttf" } } as never]);
const W = 1080, H = 1080, FPS = 30, MINT = "#37e2c8";

const draw = (c: Ctx, f: number, env: Env) => {
  c.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  c.fillStyle = MINT; c.fillRect(0, 0, W, H);
  drawPosed(c, 540, 470, 420, "wave", f / FPS, { visor: deep(MINT, 0.6), ground: MINT });
};

export const glyphWave: Film = {
  meta: { title: "glyphWave", W, H, fps: FPS, bpm: 60, durationFrames: LOOP_S * FPS, kind: "loop" },
  assets: { images: {} },
  shots: [{ id: "glyphWave", start: 0, end: LOOP_S * FPS, draw }],
};
