// AUTOAGENT BOT · 3D clay-render character sheet.
// Reference (the person's image): a stylized 3D toy robot, a soft rounded box head in matte grey,
// a dark glossy screen for a face with two white rounded-square eyes, a side ear knob, a tiny body
// on stubby feet, soft studio light on a seamless grey-blue backdrop. We take the GENRE and the
// render (soft bevels, satin clay, glossy glass screen, one soft contact shadow, seamless studio
// sweep) and change the design so it is AutoAgent's own:
//   - warm white shell with tangerine details instead of all grey
//   - headphone dials on BOTH sides, orange, instead of one grey knob
//   - an antenna whose ball is the status light (mint idle, blue working, amber needs you, green
//     done, red error) and lights the top of the head
//   - no legs: a bean body that floats over a charging pad with a glowing ring (it drops out of
//     the top of the screen in the app, so it is never standing on anything)
//   - glowing mint eyes that change SHAPE per mood (pills, squints, wide, happy arcs, worried tilt)
// Hero three-quarter view on the left, the five moods in a row on the right, labels in 2D on top.
import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import * as THREE from "three";
import { draw3d, memo, rand } from "../three-core/stage";
import { studio, satin, contactShadow, grain, vignette } from "../three-core/look";
import { screenPx } from "../three-core/camera";

const W = 1600, H = 900;
type Mood = "idle" | "working" | "waiting" | "done" | "error";
const MOODS: Mood[] = ["idle", "working", "waiting", "done", "error"];
const MC: Record<Mood, string> = { idle: "#3fe0c0", working: "#4c8dff", waiting: "#ffb020", done: "#33d17f", error: "#ff4f5a" };
const ML: Record<Mood, string> = { idle: "Idle", working: "Working", waiting: "Needs you", done: "Done", error: "Error" };

const SHELL = "#f1ebe4", ORANGE = "#ff5a76", DARK = "#2a2e3a", EYE = "#62f5d0"; // details in the brand's Signal pink, eyes in Glow (brandSheet.ts)
const HW = 1.7, HH = 1.3, HD = 1.15, HY = 1.58; // head width, height, depth, centre height

// a soft box: a rounded rectangle extruded with a deep round bevel
const softBox = (w: number, h: number, d: number, r: number, b: number) => {
  const s = new THREE.Shape(), x = -(w - 2 * b) / 2, y = -(h - 2 * b) / 2, iw = w - 2 * b, ih = h - 2 * b, rr = Math.min(r, iw / 2, ih / 2);
  s.moveTo(x + rr, y); s.lineTo(x + iw - rr, y); s.quadraticCurveTo(x + iw, y, x + iw, y + rr); s.lineTo(x + iw, y + ih - rr); s.quadraticCurveTo(x + iw, y + ih, x + iw - rr, y + ih);
  s.lineTo(x + rr, y + ih); s.quadraticCurveTo(x, y + ih, x, y + ih - rr); s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 10, curveSegments: 24 });
  g.center(); g.computeVertexNormals(); return g;
};
const pillShape = (cx: number, cy: number, w: number, h: number) => { const s = new THREE.Shape(), r = Math.min(w, h) / 2; s.absarc(cx - w / 2 + r, cy - h / 2 + r, r, Math.PI, Math.PI * 1.5, false); s.absarc(cx + w / 2 - r, cy - h / 2 + r, r, Math.PI * 1.5, Math.PI * 2, false); s.absarc(cx + w / 2 - r, cy + h / 2 - r, r, 0, Math.PI / 2, false); s.absarc(cx - w / 2 + r, cy + h / 2 - r, r, Math.PI / 2, Math.PI, false); return s; };
const arcShape = (cx: number, cy: number, R: number, t: number) => { const s = new THREE.Shape(); s.absarc(cx, cy, R, 0.12, Math.PI - 0.12, false); s.absarc(cx, cy, R - t, Math.PI - 0.12, 0.12, true); return s; };
const glowMat = (c: string) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });

const eyes = (mood: Mood): THREE.Shape[] => {
  const out: THREE.Shape[] = [];
  [-1, 1].forEach((sd) => {
    const x = sd * 0.27;
    if (mood === "idle") out.push(pillShape(x, 0.03, 0.17, 0.27));
    if (mood === "working") out.push(pillShape(x + 0.06, -0.03, 0.2, 0.09));
    if (mood === "waiting") out.push(pillShape(x, 0.05, 0.23, 0.33));
    if (mood === "done") out.push(arcShape(x, -0.06, 0.13, 0.055));
    if (mood === "error") { const s = pillShape(0, 0, 0.15, 0.21); const pts = s.getPoints(24).map((p) => p.clone().rotateAround(new THREE.Vector2(0, 0), sd * 0.38).add(new THREE.Vector2(x, 0))); out.push(new THREE.Shape(pts)); }
  });
  return out;
};

const buildBot = (mood: Mood, seed: number) => {
  const col = MC[mood], g = new THREE.Group(), head = new THREE.Group();
  const shell = satin(SHELL), orange = satin(ORANGE), dark = satin(DARK);
  // the charging pad and its ring
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.09, 64), dark); pad.position.y = 0.045; g.add(pad);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.022, 16, 96), glowMat(col)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.095; g.add(ring);
  const sh = contactShadow(1.9, 0.75, { opacity: 0.5, color: "#3b3f52" }); sh.position.y = 0.002; g.add(sh);
  // the body: a bean on a lathe, floating a hand's width above the pad
  const prof = [[0, 0], [0.26, 0.02], [0.4, 0.13], [0.45, 0.33], [0.42, 0.53], [0.32, 0.67], [0.001, 0.73]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), shell); body.position.y = 0.2; g.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 16), glowMat(col)); chest.position.set(0, 0.62, 0.43); g.add(chest);
  // arms: a pivot at the shoulder, a small capsule hanging from it
  const armPose: Record<Mood, [[number, number], [number, number]]> = { idle: [[0, -0.28], [0, 0.28]], working: [[-1.15, -0.15], [-1.15, 0.15]], waiting: [[0, -0.3], [-0.2, 2.65]], done: [[0, -2.45], [0, 2.45]], error: [[-0.5, -2.15], [-0.5, 2.15]] };
  [-1, 1].forEach((sd, i) => { const pv = new THREE.Group(); pv.position.set(sd * 0.41, 0.72, 0); const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.2, 8, 16), shell); arm.position.y = -0.17; pv.add(arm); const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), orange); hand.position.y = -0.33; pv.add(hand); const [rx, rz] = armPose[mood][i]; pv.rotation.set(rx, 0, rz); g.add(pv); });
  // head
  head.position.y = HY; g.add(head);
  head.add(new THREE.Mesh(softBox(HW, HH, HD, 0.42, 0.24), shell));
  const scr = new THREE.Mesh(softBox(1.3, 0.9, 0.1, 0.3, 0.045), new THREE.MeshPhysicalMaterial({ color: "#0f121c", roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 }));
  scr.position.z = HD / 2 + 0.005; head.add(scr);
  const eyeMesh = new THREE.Mesh(new THREE.ShapeGeometry(eyes(mood), 24), glowMat(EYE)); eyeMesh.position.z = HD / 2 + 0.058; head.add(eyeMesh);
  if (mood === "working") [-0.1, 0, 0.1].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.028, 20), glowMat(i === 1 ? "#ffffff" : col)); d.position.set(x, -0.25, HD / 2 + 0.058); head.add(d); });
  [-1, 1].forEach((sd) => { const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.13, 48), orange); dial.rotation.z = Math.PI / 2; dial.position.x = sd * (HW / 2 + 0.03); head.add(dial); const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.15, 40), shell); cap.rotation.z = Math.PI / 2; cap.position.x = sd * (HW / 2 + 0.05); head.add(cap); });
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.34, 16), dark); stalk.position.set(0.22, HH / 2 + 0.16, 0); head.add(stalk);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 32, 20), glowMat(col)); bulb.position.set(0.22, HH / 2 + 0.38, 0); head.add(bulb);
  const lamp = new THREE.PointLight(col, 1.4, 1.6, 2); lamp.position.copy(bulb.position); head.add(lamp);
  // head attitude per mood: a curious tilt does most of the acting
  const att: Record<Mood, [number, number, number]> = { idle: [0, 0, 0.04], working: [0.12, -0.22, -0.05], waiting: [-0.1, 0.12, 0.08], done: [-0.06, 0, 0.1], error: [0.06, 0.1, -0.16] };
  head.rotation.set(...att[mood]);
  // mood props
  if (mood === "waiting") { const bang = new THREE.Group(); const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.2, 8, 16), satin(MC.waiting)); bar.position.y = 0.12; const dot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 20, 14), satin(MC.waiting)); dot.position.y = -0.14; bang.add(bar, dot); bang.position.set(0.82, 2.42, 0.2); bang.rotation.z = -0.18; g.add(bang); }
  if (mood === "error") { const drop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 14), new THREE.MeshPhysicalMaterial({ color: "#9fd9ff", roughness: 0.1, transmission: 0.2, clearcoat: 1 })); drop.scale.set(1, 1.35, 1); drop.position.set(0.98, 2.02, 0.3); g.add(drop); }
  if (mood === "done") { const r = rand(seed), cols = [MC.done, MC.waiting, MC.working, ORANGE, "#c86bff"]; for (let i = 0; i < 14; i++) { const a = Math.PI * (0.1 + 0.8 * r()), d = 0.95 + r() * 0.3, piece = new THREE.Mesh(i % 3 ? new THREE.BoxGeometry(0.1, 0.04, 0.04) : new THREE.TetrahedronGeometry(0.06), satin(cols[i % 5])); piece.position.set(Math.cos(a) * d, 1.9 + Math.sin(a) * d * 0.7, (r() - 0.5) * 0.6); piece.rotation.set(r() * 3, r() * 3, r() * 3); g.add(piece); } }
  return g;
};

const HERO_POS: [number, number, number] = [-1.7, 0, 0.35], ROW_Z = -0.8, ROW_X = [0.15, 1.5, 2.85, 4.2, 5.55], ROW_K = 0.56;

const build = () => {
  const scene = new THREE.Scene();
  const rig = studio({ intensity: 1.05, at: { x: 0.8, y: 1, z: 0 } }); scene.add(rig.group);
  const hero = buildBot("idle", 3); hero.position.set(...HERO_POS); hero.scale.setScalar(1.12); hero.rotation.y = 0.5; scene.add(hero);
  MOODS.forEach((m, i) => { const b = buildBot(m, 20 + i); b.position.set(ROW_X[i], 0, ROW_Z); b.scale.setScalar(ROW_K); b.rotation.y = -0.12; scene.add(b); });
  const cam = new THREE.PerspectiveCamera(24, W / H, 0.1, 100);
  return { scene, cam };
};

const sheet = (ctx: Ctx, f: number, env: Env) => {
  const { scene, cam } = memo(env, "bot3d", build);
  cam.position.set(1.35, 2.25, 13.2); cam.lookAt(1.35, 1.2, 0);
  // the seamless studio sweep, painted in 2D under the render
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#e6eaef"); bg.addColorStop(0.62, "#d3d9e0"); bg.addColorStop(1, "#c4ccd5"); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(420, 430, 40, 420, 430, 520); glow.addColorStop(0, "rgba(255,255,255,0.55)"); glow.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  draw3d(ctx, env, scene, cam, { clear: null, ss: 2, exposure: 1.05 });
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  // labels under each mood, placed from the 3D positions
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "700 19px 'Segoe UI', system-ui, sans-serif";
  MOODS.forEach((m, i) => {
    const [x, y] = screenPx(cam, [ROW_X[i], -0.32, ROW_Z], env); const w = ctx.measureText(ML[m]).width + 40;
    ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 17, w, 34, 17); ctx.fill();
    ctx.fillStyle = MC[m]; ctx.beginPath(); ctx.arc(x - w / 2 + 16, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1e2342"; ctx.fillText(ML[m], x + 8, y + 1);
  });
  vignette(ctx, env, 0.18, "#5a6478");
  grain(ctx, env, f, 0.02, 11);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.font = "800 30px 'Segoe UI', system-ui, sans-serif"; ctx.fillStyle = "#1e2342"; ctx.fillText("AutoAgent", 48, 860); const tw = ctx.measureText("AutoAgent").width;
  ctx.font = "500 19px 'Segoe UI', system-ui, sans-serif"; ctx.fillStyle = "#596079"; ctx.fillText("bot concept  ·  3D clay render", 48 + tw + 16, 859);
};

export const bot3d: Film = {
  meta: { title: "bot3d", W, H, fps: 30, bpm: 60, durationFrames: 1,
    checks: { none: { "3d": "a still character sheet: nothing moves, nothing is held, nothing travels" } } },
  assets: { images: {} },
  shots: [{ id: "bot3d", start: 0, end: 1, draw: sheet }],
};
