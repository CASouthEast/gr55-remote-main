/**
 * Class name utility function for combining and merging CSS classes
 * This is a React Native compatible version that handles conditional classes
 */

import { type ClassValue, clsx } from "clsx";
import { Platform } from "react-native";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge for web platforms
 * For native platforms, only uses clsx since Tailwind classes aren't applicable
 */
export function cn(...inputs: ClassValue[]) {
  if (Platform.OS === "web") {
    return twMerge(clsx(inputs));
  }
  return clsx(inputs);
}
