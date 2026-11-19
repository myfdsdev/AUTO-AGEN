// Settings → Your bot (SettingsBot board): a live preview drawn by drawPosed, state swatches, face items
// and outfits. The look is sent to the island so its bots wear it too (in memory only).
import type { FaceItem, Outfit } from "../../../bot/glyphPose";
import { botCanvas, esc } from "../../../lib/dom";
import { sendBotLook } from "../../../lib/tauri";
import { FACES, OUTFITS, STATE_ORDER, STATES, type BotState } from "../../../mock/data";
import { ui } from "../../state";
import type { Section } from "./section";

export const bot: Section = {
  label: "Your bot",
  lede: "Dress it up. The island, the tray and every card use it.",
  body: () => {
    const st = STATES[ui.preview];
    return `<div class="bot-page">
    <div class="bot-preview">
      ${botCanvas({ anim: st.anim, ground: st.color, bg: st.color, face: ui.face, outfit: ui.outfit, label: `Your bot, ${st.label}` })}
      <div class="swatches" role="group" aria-label="Preview a state">${STATE_ORDER.map((k) => `<button type="button" class="swatch" style="--sw:${STATES[k].color}" data-preview="${k}" aria-pressed="${ui.preview === k}" aria-label="${esc(STATES[k].label)}" title="${esc(STATES[k].label)}"></button>`).join("")}</div>
      <span class="note">Previewing: <b style="color: var(--color-text)">${esc(st.label)}</b></span>
    </div>
    <div class="bot-picks">
      <h2 id="faceTitle">Face item</h2>
      <div class="picks" role="group" aria-labelledby="faceTitle">${FACES.map(([k, l]) => `<button type="button" class="pick" data-face="${k}" aria-pressed="${ui.face === k}">${esc(l)}</button>`).join("")}</div>
      <h2 id="outfitTitle">Outfit</h2>
      <div class="picks" role="group" aria-labelledby="outfitTitle">${OUTFITS.map(([k, l]) => `<button type="button" class="pick" data-outfit="${k}" aria-pressed="${ui.outfit === k}">${esc(l)}</button>`).join("")}</div>
    </div>
  </div>`;
  },
  click: (el) => {
    const d = el.dataset;
    if (d.preview) { ui.preview = d.preview as BotState; return true; }
    if (d.face) ui.face = d.face as FaceItem;
    else if (d.outfit) ui.outfit = d.outfit as Outfit;
    else return;
    void sendBotLook({ face: ui.face, outfit: ui.outfit });
    return true;
  },
};
