import fs from "node:fs";
import path from "node:path";

const assetsDir = path.join(process.cwd(), "dist", "client", "assets");

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
  const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

  if (jsFile) {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LovePixels — Curated Gaming & Creative Community</title>
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}">` : ""}
  </head>
  <body class="bg-background text-foreground antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>`;

    fs.writeFileSync(path.join(process.cwd(), "dist", "client", "index.html"), htmlContent);
    console.log(
      `[PostBuild] Successfully generated dist/client/index.html with JS: ${jsFile}, CSS: ${cssFile}`,
    );
  } else {
    console.error("[PostBuild] Could not locate index-*.js bundle in dist/client/assets");
  }
} else {
  console.error("[PostBuild] dist/client/assets directory does not exist");
}
