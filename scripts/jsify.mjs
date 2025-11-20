#!/usr/bin/env node
/**
 * Simple TS -> JS converter for this repo:
 * - Renames .ts to .js under src/
 * - Strips type annotations, interfaces, enums (basic cases)
 * - Converts 'import type' to nothing
 *
 * Usage:
 *   node scripts/jsify.mjs
 */
import fs from "fs";
import path from "path";

const SRC = path.resolve("src");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}

function stripTypes(code) {
  // Remove 'import type'
  code = code.replace(/^\s*import\s+type\s+\{[^}]*\}\s+from[^;]*;\s*$/gm, "");
  // Remove interfaces and type aliases (basic heuristics)
  code = code.replace(/^\s*export?\s*interface\s+[^{]+\{[\s\S]*?\}\s*$/gm, "");
  code = code.replace(/^\s*type\s+[^=]+=[\s\S]*?;\s*$/gm, "");
  // Remove : Type annotations (basic)
  code = code.replace(/: \s*[A-Za-z_][A-Za-z0-9_<>,\[\]\|\s.?]*\b/g, "");
  // Remove 'as Type' casts
  code = code.replace(/\s+as\s+[A-Za-z_][A-Za-z0-9_<>,\[\]\|\s.?]*/g, "");
  // Convert simple enums to Object.freeze
  code = code.replace(/enum\s+(\w+)\s*\{([\s\S]*?)\}/g, (m, name, body) => {
    const entries = body
      .split(/,\s*/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [k, v] = line.split("=");
        if (!k) return null;
        const key = k.trim();
        const val = v ? v.trim() : `\"${key}\"`;
        return `${JSON.stringify(key)}: ${val}`;
      })
      .filter(Boolean)
      .join(", ");
    return `const ${name} = Object.freeze({ ${entries} });`;
  });
  return code;
}

function jsifyFile(tsPath) {
  const jsPath = tsPath.replace(/\.ts$/, ".js");
  let code = fs.readFileSync(tsPath, "utf8");
  code = stripTypes(code);
  fs.writeFileSync(jsPath, code, "utf8");
  fs.rmSync(tsPath);
  console.log(`Converted: ${tsPath} -> ${jsPath}`);
}

if (!fs.existsSync(SRC)) {
  console.error("No src/ directory found. Run from repo root.");
  process.exit(1);
}

const files = walk(SRC).filter(f => f.endsWith(".ts"));
if (files.length === 0) {
  console.log("No .ts files found under src/. Nothing to convert.");
  process.exit(0);
}

for (const f of files) jsifyFile(f);

try {
  fs.rmSync("tsconfig.json");
  console.log("Removed tsconfig.json");
} catch {}
console.log("\nDone. Next steps:");
console.log("  npm install");
console.log("  npm run build");
