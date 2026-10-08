#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      walk(full, cb);
    } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) cb(full);
  }
}

function processFile(file) {
  let s = fs.readFileSync(file, "utf8");
  const orig = s;

  // Replace `import * as React from 'react';` with default import
  s = s.replace(
    /import \* as React from ['"]react['"];?/g,
    "import React from 'react';"
  );

  // Merge separate imports: import React from 'react';\nimport { useState } from 'react'; -> import React, { useState } from 'react';
  s = s.replace(
    /import React from ['"]react['"];?\s*import \{([\s\S]*?)\} from ['"]react['"];?/g,
    (m, inner) => {
      // Normalize whitespace
      const clean = inner.replace(/\s+/g, " ").trim();
      return `import React, { ${clean} } from 'react';`;
    }
  );

  if (s !== orig) {
    fs.writeFileSync(file, s, "utf8");
    console.log("Updated", file);
  }
}

const root = path.resolve(process.cwd(), "src");
if (!fs.existsSync(root)) {
  console.error("src/ not found; run from repository root");
  process.exit(1);
}

walk(root, processFile);
console.log("React import upgrade finished.");
