/**
 * Class name utility function for combining and merging CSS classes
 * This is a React Native compatible version that handles conditional classes
 */

import { type ClassValue, clsx } from "clsx";

/**
 * Combines class names using clsx
 * Note: This is adapted for React Native - web-specific Tailwind merge is handled separately
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
