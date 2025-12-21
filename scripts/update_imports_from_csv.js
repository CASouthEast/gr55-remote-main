const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();
const csvPath = path.join(repoRoot, "Docs", "src-path-mapping.csv");
if (!fs.existsSync(csvPath)) {
  console.error("CSV mapping not found at", csvPath);
  process.exit(1);
}

const lines = fs.readFileSync(csvPath, "utf8").split(/\r?\n/).filter(Boolean);
lines.shift(); // header

const map = Object.create(null);
for (const line of lines) {
  const parts = line.split(",");
  if (parts.length < 2) continue;
  const oldp = parts[0].trim();
  const newp = parts[1].trim();
  if (!oldp || !newp) continue;
  const base = path.basename(oldp).replace(/\.(tsx?|ts)$/i, "");
  map[base] = newp; // store new path relative to repo root
}

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

const files = walk(repoRoot);
let changed = 0;
for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const original = s;
  // replace import specifiers
  s = s.replace(/from\s+(['"])([^'"\n]+)\1/g, (m, q, spec) => {
    if (!spec.startsWith(".")) return m; // skip packages
    const base = path.basename(spec).replace(/\.(tsx?|ts|js|jsx)$/i, "");
    const mapping = map[base];
    if (!mapping) return m;
    const targetAbs = path.join(repoRoot, mapping);
    if (!fs.existsSync(targetAbs)) {
      // try adding extension
      const altTsx = targetAbs + "x";
      const altTs = targetAbs.replace(/\.tsx?$/, ".ts");
      // but mapping likely already has extension trimmed; we try variants
    }
    let rel = path.relative(path.dirname(file), targetAbs);
    rel = rel.replace(/\\/g, "/");
    rel = rel.replace(/\.tsx?$|\.js$|\.jsx$/i, "");
    if (!rel.startsWith(".")) rel = "./" + rel;
    return `from ${q}${rel}${q}`;
  });

  if (s !== original) {
    fs.writeFileSync(file, s, "utf8");
    changed++;
    console.log("Updated", path.relative(repoRoot, file));
  }
}
console.log("Done. Files updated:", changed);
process.exit(0);
