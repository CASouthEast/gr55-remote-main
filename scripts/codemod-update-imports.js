const fs = require("fs");
const glob = require("glob");
const path = require("path");

const repoRoot = process.cwd();

function buildMapping() {
  const mapping = {}; // originalBasename -> srcModulePath (without extension)
  const srcFiles = glob.sync("src/**/*.{ts,tsx,js,jsx}", { nodir: true });
  srcFiles.forEach((f) => {
    const content = fs.readFileSync(f, "utf8");
    // look for export from "../../SomeFile" or "../SomeFile" etc.
    const re =
      /export\s+(?:\*|\{[^}]*\}|\{\s*default\s*\})\s+from\s+['"](\.\.\/.+?)['"]/g;
    let m;
    while ((m = re.exec(content))) {
      const target = m[1];
      const base = path.basename(target);
      // remove ./ or ../ parts
      const originalBase = base.replace(/\.\//g, "");
      const key = originalBase; // e.g., PatchListView
      // compute module path for this src file
      const modulePath = f.replace(/\.(tsx|ts|js|jsx)$/, "");
      mapping[key] = modulePath;
    }
    // also handle export * from "../../SomeFile" where target may be like "../..../Foo"
    const re2 = /export\s+\*\s+from\s+['"](\.\.\/.+?)['"]/g;
    while ((m = re2.exec(content))) {
      const target = m[1];
      const base = path.basename(target);
      const key = base;
      const modulePath = f.replace(/\.(tsx|ts|js|jsx)$/, "");
      mapping[key] = modulePath;
    }
  });
  return mapping;
}

function updateImports(mapping) {
  const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
    ignore: [
      "node_modules/**",
      "Docs/**",
      "DocsDesign/**",
      "scripts/**",
      "public/**",
      "assets/**",
    ],
    nodir: true,
  });
  files.forEach((file) => {
    // skip files under src that are our stubs? we'll update them later
    const abs = path.resolve(file);
    let content = fs.readFileSync(abs, "utf8");
    let changed = false;
    // match import/export from '...';
    const importRe =
      /(from\s+|import\s+\(?.*?\)\s*from\s+|require\()\s*['"]([^'"\)]+)['"]/g;
    content = content.replace(importRe, (full, prefix, spec) => {
      // skip absolute or already src paths
      if (
        spec.startsWith("src/") ||
        spec.startsWith("@") ||
        spec.startsWith("/") ||
        spec.startsWith("./src/")
      )
        return full;
      // we only handle bare relative imports that end with a basename (no path separators beyond ./ or ../ and filename)
      const parts = spec.split("/");
      const last = parts[parts.length - 1];
      const candidate = last.replace(/\.tsx?$|\.jsx?$/, "");
      if (mapping[candidate]) {
        // compute relative path from this file's dir to mapping[candidate]
        const fromDir = path.dirname(abs);
        const toModuleAbs = path.resolve(mapping[candidate]);
        let rel = path.relative(fromDir, toModuleAbs);
        if (!rel.startsWith(".")) rel = "./" + rel;
        // convert Windows backslashes
        rel = rel.split(path.sep).join("/");
        changed = true;
        return prefix + '"' + rel + '"';
      }
      return full;
    });
    if (changed) {
      fs.writeFileSync(abs, content, "utf8");
      console.log("Updated imports in", file);
    }
  });
}

function removeTrivialStubs() {
  const srcFiles = glob.sync("src/**/*.{ts,tsx,js,jsx}", { nodir: true });
  srcFiles.forEach((f) => {
    const content = fs.readFileSync(f, "utf8").trim();
    // detect single-line trivial re-export
    if (
      /^export\s+(?:\*|\{[^}]*\}|\{\s*default\s*\})\s+from\s+['"].+['"];?$/.test(
        content
      )
    ) {
      // remove file
      fs.unlinkSync(f);
      console.log("Removed stub", f);
    }
  });
}

function main() {
  console.log("Building mapping from src stubs...");
  const mapping = buildMapping();
  console.log("Mapping entries:", Object.keys(mapping).length);
  updateImports(mapping);
  console.log("Removing trivial src re-export stubs...");
  removeTrivialStubs();
  console.log("Done. Run `npx tsc --noEmit` to verify.");
}

main();
