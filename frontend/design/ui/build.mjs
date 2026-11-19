// Builds the prototype's two generated files from the design sources, so index.html opens straight
// from disk with no server:
//   bot.js     the bot's drawing and animation code (character/src/canvas-core/glyphPose.ts), bundled
//              as a browser script exposing window.AABot
//   fonts.css  Poppins Bold and Instrument Sans (both SIL OFL, character/assets/fonts) inlined as
//              base64, because browsers refuse font files on file:// pages
// Run: node build.mjs   (needs `npm install` done in ../character once, for esbuild)
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url)), CHAR = join(HERE, "../character");
const require = createRequire(join(CHAR, "package.json"));
const { build } = require("esbuild");

await build({ entryPoints: [join(CHAR, "src/canvas-core/glyphPose.ts")], bundle: true, format: "iife", globalName: "AABot", target: "chrome110", outfile: join(HERE, "bot.js"), logLevel: "warning" });

const face = (family, file, weight) => `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/ttf;base64,${readFileSync(join(CHAR, "assets/fonts", file)).toString("base64")}) format("truetype")}`;
writeFileSync(join(HERE, "fonts.css"), [face("Poppins", "Poppins-Bold.ttf", 700), face("Instrument Sans", "InstrumentSans-Regular.ttf", 400), face("Instrument Sans", "InstrumentSans-Bold.ttf", 700)].join("\n") + "\n");
console.log("built bot.js and fonts.css");
