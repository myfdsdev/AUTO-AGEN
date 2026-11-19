// The only bridge to the Rust side. Each call is a no-op when the page runs in a plain browser
// (`npm run dev` without Tauri), so the UI can be worked on in any browser too.
// All calls are local IPC to this app's own commands; nothing here reaches the network.
import { invoke, isTauri } from "@tauri-apps/api/core";
import { emitTo, listen, type UnlistenFn } from "@tauri-apps/api/event";

export const inTauri = () => isTauri();

const call = async (cmd: string, args?: Record<string, unknown>) => {
  if (!inTauri()) return;
  try { await invoke(cmd, args); } catch (err) { console.warn(`[tauri] ${cmd} failed`, err); }
};

/** Sizes the island window to its content (logical pixels) and keeps it at the top centre. */
export const resizeIsland = (width: number, height: number) => call("island_resize", { width, height });

/** Lets the island take keyboard focus (for its text field and N/Y/A keys) or gives it back. */
export const setIslandFocusable = (focusable: boolean) => call("island_set_focusable", { focusable });

/** Shows the settings window, optionally on a route like "#/settings/bot". */
export const openMainWindow = async (route?: string) => {
  if (!inTauri()) return;
  if (route) await emitTo("main", "main:route", route).catch(() => {});
  await call("open_main");
};
export const onMainRoute = (fn: (route: string) => void): Promise<UnlistenFn | void> =>
  inTauri() ? listen<string>("main:route", (e) => fn(e.payload)) : Promise.resolve();

/** Dev demo: the settings window steps the island through its pages. */
export const sendIslandDemo = (view: string) => (inTauri() ? emitTo("island", "demo:view", view).catch(() => {}) : Promise.resolve());
export const onIslandDemo = (fn: (view: string) => void): Promise<UnlistenFn | void> =>
  inTauri() ? listen<string>("demo:view", (e) => fn(e.payload)) : Promise.resolve();
