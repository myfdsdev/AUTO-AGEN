# AutoAgent

A small companion that lives at the top of your screen (or in the Mac notch) and watches your AI coding agents, starting with Claude Code. It shows what each session is doing and lets you approve permission requests, answer the agent's questions and chat, without going back to the terminal. Windows and Mac first, from one codebase, with a backend for accounts.

> Early stage: the character, logo and design are being made. No app code yet.

## Folders

| Folder | What's in it |
|---|---|
| `frontend/design/character/` | The bot and the brand, drawn in code (anidoodle engine). Renders are in `out/`. |
| `frontend/` (later) | The desktop app: Tauri 2, Rust + TypeScript. |
| `server/` (later) | The backend: accounts, devices, settings sync. |

## Run the app

The desktop app's UI lives in `frontend/app/` (Tauri 2, Vite, vanilla TypeScript). It is UI only for now: every session, agent and account in it is mock data (`src/mock/data.ts`). Requires Node 20+ and Rust; on Windows also the Visual Studio C++ build tools and WebView2.

```
cd frontend/app
npm install
npm run tauri dev     # opens the island at the top of the screen and the settings window
npm run build         # type-check and build the web pages only
npm run dev           # the pages in a browser: http://localhost:1420/ and /island.html
```

In dev builds, the settings window's sidebar has an "island page" picker, and `[` / `]` step through the island's pages while it has focus. Closing the settings window quits the app (there is no tray yet).

## Designs so far

| File (`frontend/design/character/out/`) | What it is |
|---|---|
| `brandSheet.png` | Logo, wordmark, monoline mark, app icons, status icons, palette |
| `bot3d.png` | The bot as a 3D clay render, with its five moods |
| `glyphSheet.png` | Six minimal glyph-bot variations |
| `glyphAnim.mp4` | The jelly glyph bot animated through idle, working, needs you and done (8 s loop) |
| `botFlat.png`, `botMarker.png`, `buddyOptions.png` | Earlier concepts |

## Render the designs

Requires Node 20+ (and ffmpeg for video).

```
cd frontend/design/character
npm install --omit=optional
node tools/still.mjs brandSheet --out out/brandSheet.png
node tools/render.mjs glyphAnim --out out/glyphAnim.mp4
```

## Colours

| Name | Hex |
|---|---|
| Sunrise | `#ffae3d` |
| Signal | `#ff4f7b` |
| Agent | `#8a5cff` |
| Glow | `#4ff5c8` |
| Night | `#0e0f1a` |
