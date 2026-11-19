// The settings window's UI state. MOCK: it lives in memory only and resets when the app restarts;
// nothing is saved, synced or sent anywhere yet.
import type { FaceItem, Outfit } from "../bot/glyphPose";
import type { BotState } from "../mock/data";

export const ui = {
  hooksInstalled: false,
  reviewOpen: true,
  toggles: { login: true, hover: true, sounds: false, sync: true, subscription: false, autoUpdate: true } as Record<string, boolean>,
  position: "centre" as "centre" | "right",
  preview: "ready" as BotState,
  face: "blush" as FaceItem,
  outfit: "party" as Outfit,
};

let toastTimer = 0;
/** A short message at the bottom of the window, also read out by screen readers. */
export const toast = (text: string) => {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  document.body.append(el);
  const status = document.getElementById("appStatus");
  if (status) status.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.remove(), 2600);
};
