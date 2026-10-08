/**
 * Mock for react-native-svg in Jest tests
 */
import React from "react";

// Mock SVG components as simple divs for testing
const mockSvgComponent = (name) => {
  const MockedComponent = React.forwardRef((props, ref) => {
    return React.createElement("div", {
      ...props,
      ref,
      "data-testid": `svg-${name.toLowerCase()}`,
    });
  });
  MockedComponent.displayName = `MockedSvg${name}`;
  return MockedComponent;
};

// Export all the mocked SVG components
module.exports = {
  default: mockSvgComponent("Svg"),
  Svg: mockSvgComponent("Svg"),
  Circle: mockSvgComponent("Circle"),
  Ellipse: mockSvgComponent("Ellipse"),
  G: mockSvgComponent("G"),
  Text: mockSvgComponent("Text"),
  TSpan: mockSvgComponent("TSpan"),
  TextPath: mockSvgComponent("TextPath"),
  Path: mockSvgComponent("Path"),
  Polygon: mockSvgComponent("Polygon"),
  Polyline: mockSvgComponent("Polyline"),
  Line: mockSvgComponent("Line"),
  Rect: mockSvgComponent("Rect"),
  Use: mockSvgComponent("Use"),
  Image: mockSvgComponent("Image"),
  Symbol: mockSvgComponent("Symbol"),
  Defs: mockSvgComponent("Defs"),
  LinearGradient: mockSvgComponent("LinearGradient"),
  RadialGradient: mockSvgComponent("RadialGradient"),
  Stop: mockSvgComponent("Stop"),
  ClipPath: mockSvgComponent("ClipPath"),
  Pattern: mockSvgComponent("Pattern"),
  Mask: mockSvgComponent("Mask"),
};
