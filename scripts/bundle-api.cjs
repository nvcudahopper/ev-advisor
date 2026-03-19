/**
 * Bundle API serverless functions with esbuild (CommonJS script).
 * Produces self-contained .js files so Vercel has zero module resolution work.
 */
const { build } = require("esbuild");
const fs = require("fs");
const path = require("path");

const apiDir = path.join(__dirname, "..", "api");
const tsFiles = fs.readdirSync(apiDir).filter((f) => f.endsWith(".ts"));

console.log("Bundling API functions...");

Promise.all(
  tsFiles.map((file) => {
    const entry = path.join(apiDir, file);
    const outFile = path.join(apiDir, file.replace(".ts", ".js"));
    return build({
      entryPoints: [entry],
      bundle: true,
      platform: "node",
      target: "node18",
      format: "cjs",
      outfile: outFile,
      external: [],
    }).then(() => {
      fs.unlinkSync(entry);
      console.log("  bundled:", file, "->", file.replace(".ts", ".js"));
    });
  })
).then(() => {
  console.log("API functions bundled successfully.");
}).catch((err) => {
  console.error("Bundle failed:", err);
  process.exit(1);
});
