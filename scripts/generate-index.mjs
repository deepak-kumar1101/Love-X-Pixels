/**
 * generate-index.mjs
 *
 * Post-build script: imports the built SSR server using pathToFileURL (compatible with Node ESM on Windows & Linux),
 * renders the root route to produce the complete HTML shell with $_TSR router hydration state,
 * and writes dist/client/index.html.
 *
 * This ensures static hosts (Cloudflare Pages/Workers, Netlify, Vercel) have a fully valid index.html
 * containing both the prerendered HTML and TanStack Start hydration state, preventing "Invariant failed" white screen errors.
 *
 * Run via: node scripts/generate-index.mjs
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "dist", "client", "index.html");

console.log("🔄 Generating dist/client/index.html from SSR server render...");

try {
  const serverPath = path.join(root, "dist", "server", "server.js");
  const serverUrl = pathToFileURL(serverPath).href;
  const serverModule = await import(serverUrl);
  const server = serverModule.default ?? serverModule;

  const response = await server.fetch(new Request("http://localhost/"));
  if (!response.ok && response.status !== 200) {
    throw new Error(`Server returned HTTP ${response.status}`);
  }

  let html = await response.text();

  writeFileSync(outputPath, html, "utf-8");
  console.log(`✅ dist/client/index.html generated (${html.length} bytes)`);
} catch (err) {
  console.error("❌ Failed to generate index.html:", err);
  process.exit(1);
}
