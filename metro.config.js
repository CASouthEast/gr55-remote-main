/* eslint-env node */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Cross-platform helper: escape special regex characters in filesystem paths.
// Needed because paths may contain backslashes (Windows) or other regex metacharacters.
// Escaping must happen before forward-slash normalization.
const escapeRegExpSpecialChars = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Cross-platform helper: normalize path separators to forward slashes for RegExp patterns.
// Forward slashes work in RegExp patterns on all platforms (Windows, macOS, Linux) and prevent
// Windows backslashes from being interpreted as escape sequences within the RegExp.
const normalizePathForRegExp = (fsPath) => fsPath.replace(/\\/g, "/");

// npm v7+ will install ../node_modules/react-native because of peerDependencies.
// To prevent the incompatible react-native bewtween ./node_modules/react-native and ../node_modules/react-native,
// excludes the one from the parent folder when bundling.
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  new RegExp(
    normalizePathForRegExp(
      escapeRegExpSpecialChars(
        path.join(
          "@motiz88",
          "react-native-midi",
          "node_modules",
          "react-native"
        )
      )
    ) + "/"
  ),
];

// Exclude worklets from web builds
if (process.env.EXPO_PLATFORM === "web") {
  config.resolver.blockList.push(
    /react-native-worklets/,
    /react-native-reanimated/
  );
}

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "./node_modules"),
  path.resolve(__dirname, "./assets"),
];

// Alias problematic packages to local shims when needed
// Note: no custom aliasing required currently

const LINKABLE_PACKAGES = ["@motiz88/react-native-midi"];

// Hack to make Metro follow symlinks to certain packages if they exist.
// Cross-platform path handling: watchFolders uses native filesystem paths (each OS handles
// separators automatically), while blockList RegExp patterns are normalized to forward slashes.
config.watchFolders = [];

for (const packageName of LINKABLE_PACKAGES) {
  const localPath = path.resolve(__dirname, "node_modules", packageName);
  if (fs.lstatSync(localPath).isSymbolicLink()) {
    const realPath = fs.realpathSync(localPath);
    // Use native path format for filesystem operations—each platform gets correct separators automatically.
    config.watchFolders.push(realPath);

    // Just in case the linked package has its own react-native installed.
    // TODO: Invert this and force-resolve `react-native` to a single copy instead.
    config.resolver.blockList.push(
      new RegExp(
        normalizePathForRegExp(
          escapeRegExpSpecialChars(path.join(realPath, "node_modules", "react-native"))
        ) + "/"
      )
    );
  }
}

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
