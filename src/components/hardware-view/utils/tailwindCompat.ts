/**
 * Tailwind to React Native compatibility utilities
 * Provides platform-specific handling for web-only features
 */

import React from "react";
import { Platform } from "react-native";

/**
 * Checks if the current platform supports web-specific features
 */
export const isWeb = Platform.OS === "web";

/**
 * Conditionally applies web-only styles or animations
 * Returns the value for web platforms, undefined for native platforms
 */
export function webOnly<T>(value: T): T | undefined {
  return isWeb ? value : undefined;
}

/**
 * Conditionally applies native-only styles or animations
 * Returns the value for native platforms, undefined for web platforms
 */
export function nativeOnly<T>(value: T): T | undefined {
  return !isWeb ? value : undefined;
}

/**
 * Platform-specific style object that merges web and native styles
 */
export function platformStyles(webStyles: any, nativeStyles: any = {}) {
  return isWeb ? webStyles : nativeStyles;
}

/**
 * Conditional framer-motion import wrapper
 * Returns motion components for web, regular React Native components for native
 */
export function getMotionComponent(componentType: "div" | "button" = "div") {
  if (isWeb) {
    try {
      // Use dynamic import instead of require
      const { View } = require("react-native");
      return View; // Fallback to View for now
    } catch {
      // Fallback to React Native View if framer-motion is not available
      const { View } = require("react-native");
      return View;
    }
  }
  // For native platforms, return React Native components
  const { View } = require("react-native");
  return View;
}

/**
 * Conditional lucide-react icon import wrapper
 * Returns the icon component for web, a fallback for native
 */
export function getLucideIcon(
  iconName: string
): React.ComponentType<any> | null {
  // Simplified - just return null for now
  // TODO: Implement actual lucide-react icon loading for web
  return null;
}

/**
 * Web-specific CSS properties that need special handling
 */
export const webOnlyStyles = {
  backdropFilter: webOnly("blur(10px)"),
  WebkitBackdropFilter: webOnly("blur(10px)"),
  backgroundImage: (gradient: string) => webOnly(gradient),
  boxShadow: (shadow: string) => webOnly(shadow),
  filter: (filter: string) => webOnly(filter),
};
