// Jest setup - mock react-native-worklets before babel tries to load it
const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  if (id === "react-native-worklets/plugin") {
    // Return an empty object instead of trying to load the missing module
    return { default: {}, ...{} };
  }
  return originalRequire.apply(this, arguments);
};
