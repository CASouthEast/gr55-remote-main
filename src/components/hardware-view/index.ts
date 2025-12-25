/**
 * Platform-specific exports for GR55 Hardware View
 * React Native will automatically resolve to .web.tsx or .native.tsx based on platform
 */

// Export the platform-specific component
// React Native's Metro bundler will automatically choose:
// - GR55HWView.web.tsx on web platform
// - GR55HWView.native.tsx on native platforms
export { GR55HWView } from "./GR55HWView";
export * from "./GR55HWView.types";

// Export the web-specific controller component
export { GR55Controller } from "./components/GR55Controller";

// Export utility functions and constants
export * from "./utils/constants";
export { cn } from "./utils/cn";
