/**
 * Mock for React Native components in Jest tests
 */
import React from "react";

// Mock React Native components as simple divs/spans for testing
const mockComponent = (name) => {
  const MockedComponent = React.forwardRef((props, ref) => {
    return React.createElement(name.toLowerCase(), {
      ...props,
      ref,
      "data-testid": name,
    });
  });
  MockedComponent.displayName = `Mocked${name}`;
  return MockedComponent;
};

// Mock StyleSheet
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
  absoluteFill: {},
  absoluteFillObject: {},
  hairlineWidth: 1,
};

// Mock Platform
const Platform = {
  OS: "ios", // Use iOS instead of web for native component testing
  Version: "15.0",
  select: (obj) => obj.ios || obj.native || obj.default,
  isPad: false,
  isTVOS: false,
};

// Mock Dimensions
const Dimensions = {
  get: () => ({ width: 375, height: 667 }),
  addEventListener: () => {},
  removeEventListener: () => {},
};

// Export all the mocked components
module.exports = {
  // Core components
  View: mockComponent("View"),
  Text: mockComponent("Text"),
  ScrollView: mockComponent("ScrollView"),
  TouchableOpacity: mockComponent("TouchableOpacity"),
  TouchableHighlight: mockComponent("TouchableHighlight"),
  TouchableWithoutFeedback: mockComponent("TouchableWithoutFeedback"),
  Image: mockComponent("Image"),
  TextInput: mockComponent("TextInput"),
  FlatList: mockComponent("FlatList"),
  SectionList: mockComponent("SectionList"),

  // Utilities
  StyleSheet,
  Platform,
  Dimensions,

  // Mock other commonly used APIs
  Alert: {
    alert: jest.fn(),
  },

  // Mock Animated
  Animated: {
    View: mockComponent("AnimatedView"),
    Text: mockComponent("AnimatedText"),
    ScrollView: mockComponent("AnimatedScrollView"),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      interpolate: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
    sequence: jest.fn(() => ({
      start: jest.fn(),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
    })),
    createAnimatedComponent: (Component) => Component,
  },

  // Mock other APIs that might be used
  AppState: {
    currentState: "active",
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};
