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

const files = walk(path.join(repoRoot, "src"));
let changed = 0;
for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const original = s;
  const relPath = path.relative(path.join(repoRoot, "src"), file);

  // Replace ./lib/ with ../lib/ for files not in src/lib
  if (!file.includes(path.join("src", "lib"))) {
    s = s.replace(/from\s+(['"])\.\/lib\//g, (m, q) => `from ${q}../lib/`);
  }

  // Fix hooks imports
  if (file.includes(path.join("src", "lib", "roland-gr55"))) {
    s = s.replace(
      /from\s+(['"])\.\/hooks\//g,
      (m, q) => `from ${q}../../hooks/`
    );
  } else if (file.includes(path.join("src", "lib"))) {
    s = s.replace(/from\s+(['"])\.\/hooks\//g, (m, q) => `from ${q}../hooks/`);
  } else if (
    file.includes(path.join("src", "screens")) ||
    file.includes(path.join("src", "components")) ||
    file.includes(path.join("src", "hooks")) ||
    file.includes(path.join("src", "services"))
  ) {
    s = s.replace(/from\s+(['"])\.\/hooks\//g, (m, q) => `from ${q}../hooks/`);
  }

  // Fix modules/midi-hardware-manager imports in screens
  if (file.includes(path.join("src", "screens"))) {
    s = s.replace(
      /from\s+(['"])\.\/modules\/midi-hardware-manager/g,
      (m, q) => `from ${q}../modules/modules/midi-hardware-manager`
    );
    s = s.replace(
      /from\s+(['"])\.\/modules\/midi-hardware-manager\/src\//g,
      (m, q) => `from ${q}../modules/modules/midi-hardware-manager/src/`
    );
  }

  if (s !== original) {
    fs.writeFileSync(file, s, "utf8");
    changed++;
    console.log("Patched", path.relative(repoRoot, file));
  }
}
console.log("Done. Patched files:", changed);
