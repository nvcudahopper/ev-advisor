/**
 * Bundle API serverless functions with esbuild and place them
 * in the Vercel Build Output API structure.
 * 
 * Output structure:
 *   .vercel/output/functions/api/eval.func/index.js
 *   .vercel/output/functions/api/eval.func/.vc-config.json
 *   .vercel/output/functions/api/cars.func/index.js
 *   .vercel/output/functions/api/cars.func/.vc-config.json
 */
const { build } = require("esbuild");
const fs = require("fs");
const path = require("path");

const apiDir = path.join(__dirname, "..", "api");
const outputBase = path.join(__dirname, "..", ".vercel", "output");
const functionsDir = path.join(outputBase, "functions", "api");
const staticDir = path.join(outputBase, "static");

const vcConfig = JSON.stringify({
  runtime: "nodejs18.x",
  handler: "index.js",
  launcherType: "Nodejs",
  shouldAddHelpers: true,
  shouldAddSourcemapSupport: false
}, null, 2);

async function main() {
  const tsFiles = fs.readdirSync(apiDir).filter((f) => f.endsWith(".ts"));
  console.log("Bundling API functions for Vercel Build Output API...");

  // Create output directories
  fs.mkdirSync(functionsDir, { recursive: true });

  // Copy static files from dist/public to .vercel/output/static
  const distPublic = path.join(__dirname, "..", "dist", "public");
  if (fs.existsSync(distPublic)) {
    copyDirSync(distPublic, staticDir);
    console.log("  copied static files to .vercel/output/static/");
  }

  // Write config.json
  const configJson = {
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/api/(.*)", dest: "/api/$1" },
      { src: "/(.*)", dest: "/index.html" }
    ]
  };
  fs.writeFileSync(
    path.join(outputBase, "config.json"),
    JSON.stringify(configJson, null, 2)
  );

  for (const file of tsFiles) {
    const name = file.replace(".ts", "");
    const funcDir = path.join(functionsDir, name + ".func");
    fs.mkdirSync(funcDir, { recursive: true });

    await build({
      entryPoints: [path.join(apiDir, file)],
      bundle: true,
      platform: "node",
      target: "node18",
      format: "cjs",
      outfile: path.join(funcDir, "index.js"),
      external: [],
      footer: {
        js: '// Vercel expects module.exports to be the handler directly\nif (module.exports && module.exports.default) { module.exports = module.exports.default; }'
      },
    });

    fs.writeFileSync(path.join(funcDir, ".vc-config.json"), vcConfig);
    console.log("  bundled:", name);
  }

  console.log("Build Output API structure ready.");
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main().catch((err) => {
  console.error("Bundle failed:", err);
  process.exit(1);
});
