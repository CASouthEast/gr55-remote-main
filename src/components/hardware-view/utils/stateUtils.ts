/**
 * Utility functions for GR55 Hardware View state management
 * These functions provide common operations for managing GR55 state
 */

import { GR55State, StyleButtonConfig } from "../GR55HWView.types";
import {
  DEFAULT_GR55_STATE,
  DEFAULT_STYLES,
  VALID_PEDAL_NUMBERS,
  VALID_STYLE_TYPES,
} from "./constants";

/**
 * Creates a new GR55 state with default values merged with provided partial state
 */
export function createGR55State(partialState?: Partial<GR55State>): GR55State {
  return {
    ...DEFAULT_GR55_STATE,
    ...partialState,
  };
}

/**
 * Validates if a pedal number is valid (1-4)
 */
export function isValidPedalNumber(pedal: number): pedal is 1 | 2 | 3 | 4 {
  return VALID_PEDAL_NUMBERS.includes(pedal as any);
}

/**
 * Validates if a style type is valid
 */
export function isValidStyleType(
  style: string
): style is GR55State["activeStyle"] {
  return VALID_STYLE_TYPES.includes(style as any);
}

/**
 * Gets the style configuration for a given style type
 */
export function getStyleConfig(
  styleType: GR55State["activeStyle"]
): StyleButtonConfig | undefined {
  return DEFAULT_STYLES.find((style) => style.id === styleType);
}

/**
 * Updates the patch name based on the selected style
 */
export function updatePatchForStyle(
  state: GR55State,
  newStyle: GR55State["activeStyle"]
): GR55State {
  const styleConfig = getStyleConfig(newStyle);
  return {
    ...state,
    activeStyle: newStyle,
    patchName: styleConfig?.patch || state.patchName,
  };
}

/**
 * Cycles to the next pedal (1 -> 2 -> 3 -> 4 -> 1)
 */
export function getNextPedal(currentPedal: number): number {
  if (!isValidPedalNumber(currentPedal)) {
    return 1;
  }
  return currentPedal === 4 ? 1 : currentPedal + 1;
}

/**
 * Cycles to the previous pedal (1 -> 4 -> 3 -> 2 -> 1)
 */
export function getPreviousPedal(currentPedal: number): number {
  if (!isValidPedalNumber(currentPedal)) {
    return 1;
  }
  return currentPedal === 1 ? 4 : currentPedal - 1;
}

/**
 * Formats a patch name to fit display constraints
 */
export function formatPatchName(
  patchName: string,
  maxLength: number = 12
): string {
  if (patchName.length <= maxLength) {
    return patchName;
  }
  return patchName.substring(0, maxLength - 3) + "...";
}

/**
 * Formats a bank display string
 */
export function formatBankDisplay(bank: string): string {
  // Ensure bank is in format "XX-X" (e.g., "01-1")
  const cleaned = bank.replace(/[^0-9-]/g, "");
  if (cleaned.includes("-")) {
    return cleaned;
  }
  // If no dash, assume it's a simple number and format it
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) {
    return "01-1";
  }
  const bankNum = Math.floor((num - 1) / 4) + 1;
  const patchNum = ((num - 1) % 4) + 1;
  return `${bankNum.toString().padStart(2, "0")}-${patchNum}`;
}

/**
 * Validates a complete GR55 state object
 */
export function validateGR55State(
  state: Partial<GR55State>
): state is GR55State {
  return (
    typeof state.activePedal === "number" &&
    isValidPedalNumber(state.activePedal) &&
    typeof state.patchName === "string" &&
    state.patchName.length > 0 &&
    typeof state.activeStyle === "string" &&
    isValidStyleType(state.activeStyle) &&
    typeof state.bank === "string" &&
    state.bank.length > 0
  );
}
