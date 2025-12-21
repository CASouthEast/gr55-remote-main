const fs = require("fs");
const path = require("path");
const repoRoot = process.cwd();

function walk(dir, out = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    if (it.name === "node_modules" || it.name === ".git") continue;
    const full = path.join(dir, it.name);
    if (it.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(it.name)) out.push(full);
  }
  return out;
}

const libDir = path.join(repoRoot, "src", "lib");
if (!fs.existsSync(libDir)) {
  console.error("No src/lib directory found.");
  process.exit(1);
}

const files = walk(libDir);
let changed = 0;
for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const original = s;
  // For files under src/lib/roland-gr55, replace from "./lib/XXX" -> from "../XXX"
  if (file.includes(path.join("src", "lib", "roland-gr55"))) {
    s = s.replace(/from\s+(['"])\.\/lib\//g, (m, q) => `from ${q}../`);
    s = s.replace(
      /from\s+(['"])\.\.\/hooks\//g,
      (m, q) => `from ${q}../hooks/`
    );
  } else {
    // For other files under src/lib, replace from "./lib/XXX" -> from "./XXX"
    s = s.replace(/from\s+(['"])\.\/lib\//g, (m, q) => `from ${q}./`);
    // If importing hooks with "./hooks/" (wrong), change to "../hooks/"
    s = s.replace(/from\s+(['"])\.\/hooks\//g, (m, q) => `from ${q}../hooks/`);
  }

  if (s !== original) {
    fs.writeFileSync(file, s, "utf8");
    changed++;
    console.log("Fixed", path.relative(repoRoot, file));
  }
}
console.log("Done. Files fixed:", changed);
