/**
 * Mock for react-native-safe-area-context in Jest tests
 */
import React from "react";

// Mock SafeAreaProvider
const SafeAreaProvider = ({ children }) => {
  return React.createElement(
    "div",
    { "data-testid": "safe-area-provider" },
    children
  );
};

// Mock SafeAreaView
const SafeAreaView = ({ children, ...props }) => {
  return React.createElement(
    "div",
    {
      ...props,
      "data-testid": "safe-area-view",
    },
    children
  );
};

// Mock useSafeAreaInsets hook
const useSafeAreaInsets = () => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

// Mock useSafeAreaFrame hook
const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: 375,
  height: 667,
});

// Mock initialWindowMetrics
const initialWindowMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 667 },
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
};

module.exports = {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
};
