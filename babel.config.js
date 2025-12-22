module.exports = function (api) {
  api.cache(true);

  const platform = process.env.EXPO_PLATFORM || "default";

  const plugins = ["@babel/plugin-proposal-logical-assignment-operators"];

  // Only include reanimated plugin for native platforms, not web
  if (platform !== "web") {
    plugins.push("react-native-reanimated/plugin");
  }

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
