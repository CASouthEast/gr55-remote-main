import { Platform } from "react-native";

export const hardwareColors = {
  background: "#e4e4e7", // zinc-200
  chassis: "#1e2024",
  surface: "#25282e",
  border: "#52525b", // zinc-600
  borderMuted: "rgba(0,0,0,0.5)",
  textPrimary: "#f4f4f5", // zinc-100
  textMuted: "#a1a1aa", // zinc-400
  textSecondary: "#71717a", // zinc-500
  accent: "#f97316", // orange-500
  accentAlt: "#ff8c00", // orange for GR logo
  inset: "#27272a", // zinc-800
  black: "#000000",
  white: "#ffffff",
  // New aesthetic colors
  neonGreen: "#39FF14",
  neonGreenGlow: "rgba(57, 255, 20, 0.5)",
  turquoise: {
    chassis: "#003d5c",
    surface: "#00527a",
  },
  metallicBlack: {
    chassis: "#1e2024",
    surface: "#25282e",
  },
} as const;

export const hardwareSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const hardwareRadii = {
  sm: 8,
  md: 16,
  lg: 32,
} as const;

export const hardwareShadow = Platform.select({
  web: {
    chassis: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    knob: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    knobSmall: "0 3px 5px -1px rgba(0, 0, 0, 0.12)",
  },
  default: {
    chassis: {
      elevation: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
    },
    knob: {
      elevation: 4,
    },
    knobSmall: {
      elevation: 3,
    },
  },
});
