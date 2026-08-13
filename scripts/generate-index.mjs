/**
 * generate-index.mjs
 *
 * Post-build script: scans dist/client/assets for the main JS and CSS bundles
 * and writes dist/client/index.html so Netlify/Vercel/Cloudflare Pages static
 * hosting works without needing a Node.js SSR server at runtime.
 *
 * This approach does NOT import the SSR server (which uses Cloudflare Workers
 * globals unavailable in Node.js). Instead it creates a minimal but complete
 * SPA shell that loads the client bundle and lets TanStack Router handle all
 * routing client-side.
 *
 * Run via: node scripts/generate-index.mjs
 */

import { writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const assetsDir = path.join(root, "dist", "client", "assets");
const outputPath = path.join(root, "dist", "client", "index.html");

// ── Validate assets directory exists ──────────────────────────────────────────
if (!existsSync(assetsDir)) {
  console.error("❌ dist/client/assets not found. Run `npm run build` first.");
  process.exit(1);
}

// ── Find main entry JS and CSS ────────────────────────────────────────────────
const assetFiles = readdirSync(assetsDir);

// The main bundle is the largest JS file starting with "index-" or "Section-"
// TanStack Start names the root client entry "index-<hash>.js"
const mainJs = assetFiles.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const mainCss = assetFiles.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

// Also find any preloadable lazy chunks (for modulepreload hints)
const lazyChunks = assetFiles.filter(
  (f) => f.endsWith(".js") && f !== mainJs && !f.endsWith(".map")
);

if (!mainJs) {
  console.error("❌ Could not find main JS entry (index-*.js) in dist/client/assets/");
  process.exit(1);
}

// ── Build modulepreload hints for key chunks ─────────────────────────────────
const preloadLinks = lazyChunks
  .slice(0, 8) // limit to avoid too many preloads
  .map((f) => `  <link rel="modulepreload" href="/assets/${f}" />`)
  .join("\n");

// ── Generate the HTML shell ──────────────────────────────────────────────────
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LovePixels — A soft, luxurious Discord community</title>
    <meta name="description" content="A gently moderated Discord community for creatives: quiet nights, curated events, seasonal galleries and monthly creator payouts." />
    <meta name="author" content="LovePixels" />
    <meta property="og:title" content="LovePixels — A soft, luxurious Discord community" />
    <meta property="og:description" content="Quiet nights, creative circles and rewarded presence." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@LovePixels" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Quicksand:wght@400;500;600;700&display=swap" />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    ${mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}" />` : ""}
${preloadLinks}
  </head>
  <body>
    <script type="module" src="/assets/${mainJs}"></script>
  </body>
</html>
`;

writeFileSync(outputPath, html, "utf-8");
console.log(`✅ dist/client/index.html generated`);
console.log(`   JS entry : /assets/${mainJs}`);
if (mainCss) console.log(`   CSS entry: /assets/${mainCss}`);
console.log(`   Preloads : ${lazyChunks.length} lazy chunks`);
