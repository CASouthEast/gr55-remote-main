/**
 * Platform-specific GR55HWView component loader
 * This file conditionally loads the appropriate implementation based on platform
 */

import { Platform } from "react-native";

// Conditional platform-specific imports
let GR55HWView: any;

if (Platform.OS === "web") {
  // Dynamic import for web-specific implementation
  GR55HWView = require("./GR55HWView.web").GR55HWView;
} else {
  // Import native implementation for all other platforms
  GR55HWView = require("./GR55HWView.native").GR55HWView;
}

export { GR55HWView };
