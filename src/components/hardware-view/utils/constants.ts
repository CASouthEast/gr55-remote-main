/**
 * Shared constants for GR55 Hardware View components
 * These constants define default configurations and styling values
 */

import { StyleButtonConfig, GR55State } from "../GR55HWView.types";

/**
 * Default style configurations for the GR55 hardware interface
 */
export const DEFAULT_STYLES: StyleButtonConfig[] = [
  { id: "LEAD", label: "LEAD", patch: "LEAD GUITAR" },
  { id: "RHYTHM", label: "RHYTHM", patch: "FUNK RHYTHM" },
  { id: "OTHER", label: "OTHER", patch: "STRINGS ENS" },
  { id: "USER", label: "USER", patch: "CUSTOM 01" },
];

/**
 * Default initial state for the GR55 hardware view
 */
export const DEFAULT_GR55_STATE: GR55State = {
  activePedal: 1,
  patchName: "LEAD GUITAR",
  activeStyle: "LEAD",
  bank: "01-1",
};

/**
 * Valid pedal numbers (1-4)
 */
export const VALID_PEDAL_NUMBERS = [1, 2, 3, 4] as const;

/**
 * Valid style types
 */
export const VALID_STYLE_TYPES = ["LEAD", "RHYTHM", "OTHER", "USER"] as const;

/**
 * Display configuration constants
 */
export const DISPLAY_CONFIG = {
  MAX_PATCH_NAME_LENGTH: 12,
  MAX_BANK_LENGTH: 4,
  LCD_ROWS: 2,
  LCD_COLS: 16,
} as const;

/**
 * Animation and interaction constants
 */
export const INTERACTION_CONFIG = {
  BUTTON_PRESS_DURATION: 150, // milliseconds
  DATA_WHEEL_SENSITIVITY: 1,
  PEDAL_PRESS_THRESHOLD: 0.5,
  ANIMATION_DURATION: 200, // milliseconds
} as const;

/**
 * Platform-specific feature flags
 */
export const PLATFORM_FEATURES = {
  WEB_ANIMATIONS: true,
  NATIVE_HAPTICS: true,
  ADVANCED_STYLING: true,
} as const;
