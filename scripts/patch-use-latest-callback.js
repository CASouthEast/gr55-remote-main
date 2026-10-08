#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// eslint-disable-next-line no-undef
const __dirname = path.dirname(__filename);
// eslint-disable-next-line no-undef
const filePath = path.join(
  __dirname,
  "../node_modules/use-latest-callback/lib/src/index.js"
);

try {
  let content = fs.readFileSync(filePath, "utf-8");

  // Check if already patched
  if (content.includes("module.exports.default")) {
    console.log("use-latest-callback is already patched");
    return;
  }

  // Replace the final export line to add .default property
  content = content.replace(
    "module.exports = useLatestCallback;",
    "module.exports = useLatestCallback;\nmodule.exports.default = useLatestCallback;"
  );

  fs.writeFileSync(filePath, content, "utf-8");
  console.log("Successfully patched use-latest-callback");
} catch (error) {
  console.error("Error patching use-latest-callback:", error.message);
  process.exit(1);
}
