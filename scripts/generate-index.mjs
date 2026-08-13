/**
 * generate-index.mjs
 *
 * Post-build script: imports the built SSR server, renders the root route,
 * and writes dist/client/index.html so Netlify/Vercel static hosting works.
 *
 * Run via: node scripts/generate-index.mjs
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "dist", "client", "index.html");

console.log("🔄 Generating dist/client/index.html from SSR render...");

try {
  // Import the built SSR server entry (use file:// URL for Windows ESM compatibility)
  const serverUrl = pathToFileURL(path.join(root, "dist", "server", "server.js")).href;
  const serverModule = await import(serverUrl);
  const server = serverModule.default;

  // Render the homepage
  const response = await server.fetch(new Request("http://localhost/"));
  let html = await response.text();

  // Write the full SSR-rendered HTML as index.html
  writeFileSync(outputPath, html, "utf-8");
  console.log(`✅ dist/client/index.html generated (${html.length} bytes)`);
} catch (err) {
  console.error("❌ Failed to generate index.html:", err.message);
  process.exit(1);
}
