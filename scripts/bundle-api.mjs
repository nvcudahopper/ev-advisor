/**
 * Bundle API serverless functions with esbuild.
 * 
 * Resolves all relative imports (shared/, server/) at build time,
 * producing self-contained .mjs files that Vercel can run directly
 * without any module resolution at runtime.
 */
import { build } from "esbuild";
import { readdirSync, unlinkSync } from "fs";

const apiDir = "api";
const tsFiles = readdirSync(apiDir).filter((f) => f.endsWith(".ts"));

console.log("Bundling API functions...");

for (const file of tsFiles) {
  const entry = `${apiDir}/${file}`;
  const outName = file.replace(".ts", ".mjs");
  const outFile = `${apiDir}/${outName}`;

  await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    target: "node18",
    format: "esm",
    outfile: outFile,
    // @vercel/node types are dev-only; not needed at runtime
    external: [],
  });

  // Remove the original .ts source so Vercel doesn't double-process it
  unlinkSync(entry);
  console.log(`  ✓ ${outFile}`);
}

console.log("Done — API functions ready for Vercel.");
