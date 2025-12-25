import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";

// Temporarily remove the tailwindCompat import to test
// import { getMotionComponent } from "../utils/tailwindCompat";

// Conditional import for framer-motion (web only)
// const MotionView = getMotionComponent("div");

interface ButtonProps {
  label: string;
  ledActive?: boolean;
  variant?: "rect" | "round" | "wide";
  subLabel?: string;
  style?: any;
  onPress?: () => void;
}

/**
 * Standard tactile button used across the interface.
 * Supports LED indicators and different shapes.
 */
export function Button({
  label,
  ledActive,
  variant = "rect",
  subLabel,
  style,
  onPress,
  ...props
}: ButtonProps) {
  // Animation props only for web
  const animationProps =
    Platform.OS === "web"
      ? {
          whileTap: { scale: 0.95 },
        }
      : {};

  const buttonStyle = [
    styles.buttonBase,
    variant === "rect" && styles.buttonRect,
    variant === "wide" && styles.buttonWide,
    variant === "round" && styles.buttonRound,
    style,
  ];

  return (
    <View style={styles.container}>
      {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        activeOpacity={0.8}
        {...animationProps}
        {...props}
      >
        {/* LED Indicator Window */}
        {variant !== "round" && (
          <View
            style={[
              styles.ledIndicator,
              ledActive ? styles.ledActive : styles.ledInactive,
            ]}
          />
        )}

        {/* Tactile Center */}
        <View
          style={[
            styles.tactileCenter,
            variant === "round"
              ? styles.tactileCenterRound
              : styles.tactileCenterRect,
          ]}
        />
      </TouchableOpacity>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

/**
 * Special specialized button for the Sound Style section
 */
export function SoundStyleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  // Animation props only for web
  const animationProps =
    Platform.OS === "web"
      ? {
          whileTap: { scale: 0.95 },
        }
      : {};

  return (
    <View style={styles.soundStyleContainer}>
      <View style={styles.soundStyleLabelContainer}>
        <Text style={styles.soundStyleLabel}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.soundStyleButton}
        onPress={onClick}
        activeOpacity={0.8}
        {...animationProps}
      >
        <View
          style={[
            styles.soundStyleIndicator,
            active
              ? styles.soundStyleIndicatorActive
              : styles.soundStyleIndicatorInactive,
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#a1a1aa", // zinc-400
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  buttonBase: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27272a", // zinc-800
    borderWidth: 2,
    borderColor: "#52525b", // zinc-700
    ...Platform.select({
      web: {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        outline: "none",
      },
      default: {
        elevation: 4,
      },
    }),
  },
  buttonRect: {
    width: 48,
    height: 32,
    borderRadius: 2,
  },
  buttonWide: {
    width: 64,
    height: 32,
    borderRadius: 2,
  },
  buttonRound: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ledIndicator: {
    width: 12,
    height: 6,
    borderRadius: 2,
    position: "absolute",
    top: 6,
  },
  ledActive: {
    backgroundColor: "#ef4444", // red-500
    ...Platform.select({
      web: {
        boxShadow: "0 0 8px rgba(239, 68, 68, 0.8)",
      },
      default: {
        elevation: 8,
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
    }),
  },
  ledInactive: {
    backgroundColor: "#18181b", // zinc-900
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
  },
  tactileCenter: {
    backgroundColor: "rgba(63, 63, 70, 0.5)", // zinc-700/50
    position: "absolute",
  },
  tactileCenterRound: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  tactileCenterRect: {
    width: 32,
    height: 12,
    borderRadius: 2,
    top: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#d4d4d8", // zinc-300
    textTransform: "uppercase",
    letterSpacing: -0.5,
  },
  soundStyleContainer: {
    alignItems: "center",
    gap: 4,
  },
  soundStyleLabelContainer: {
    borderWidth: 1,
    borderColor: "#71717a", // zinc-500
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 4,
    backgroundColor: "rgba(24, 24, 27, 0.5)", // zinc-900/50
  },
  soundStyleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f4f4f5", // zinc-100
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  soundStyleButton: {
    width: 64,
    height: 32,
    backgroundColor: "#27272a", // zinc-800
    borderWidth: 2,
    borderColor: "#52525b", // zinc-600
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
      },
      default: {
        elevation: 4,
      },
    }),
  },
  soundStyleIndicator: {
    width: 16,
    height: 8,
    marginTop: 6,
    borderRadius: 2,
  },
  soundStyleIndicatorActive: {
    backgroundColor: "#ef4444", // red-500
    ...Platform.select({
      web: {
        boxShadow: "0 0 10px rgba(239, 68, 68, 1)",
      },
      default: {
        elevation: 10,
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 5,
      },
    }),
  },
  soundStyleIndicatorInactive: {
    backgroundColor: "#0c0a09", // zinc-950
  },
});
