# AutoAgent

A small companion that lives at the top of your screen (or in the Mac notch) and watches your AI coding agents, starting with Claude Code. It shows what each session is doing and lets you approve permission requests, answer the agent's questions and chat, without going back to the terminal. Windows and Mac first, from one codebase, with a backend for accounts.

> Early stage: the character, logo and design are being made. No app code yet.

## Folders

| Folder | What's in it |
|---|---|
| `frontend/design/character/` | The bot and the brand, drawn in code (anidoodle engine). Renders are in `out/`. |
| `frontend/` (later) | The desktop app: Tauri 2, Rust + TypeScript. |
| `server/` (later) | The backend: accounts, devices, settings sync. |

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
