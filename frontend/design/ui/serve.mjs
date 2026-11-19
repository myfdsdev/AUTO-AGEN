// A tiny static server for the prototype: node serve.mjs [port], then open http://localhost:5180
// (index.html also opens straight from disk; this is for browsers or previews that won't run scripts on file:// pages).
// It serves only this folder and only on this computer.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url)), PORT = Number(process.argv[2] ?? 5180);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[\\/]+/, "") || "index.html";
  const file = join(ROOT, path);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(file); res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" }).end(body); }
  catch { res.writeHead(404).end("not found"); }
}).listen(PORT, "127.0.0.1", () => console.log(`AutoAgent prototype on http://localhost:${PORT}`));
