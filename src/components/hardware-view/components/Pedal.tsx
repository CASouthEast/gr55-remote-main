import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { getMotionComponent } from "../utils/tailwindCompat";

// Conditional import for framer-motion (web only)
const MotionView = getMotionComponent("div");

interface PedalProps {
  label: string;
  subLabel?: string;
  isActive?: boolean;
  onClick?: () => void;
  style?: any;
}

/**
 * Large trapezoidal foot pedal.
 * Features a complex 3D shape using SVG and gradients.
 */
export function Pedal({
  label,
  subLabel,
  isActive,
  onClick,
  style,
}: PedalProps) {
  // Animation props only for web
  const pedalAnimationProps =
    Platform.OS === "web"
      ? {
          whileTap: { scale: 0.98, translateY: 2 },
        }
      : {};

  return (
    <View style={[styles.container, style]}>
      <View style={styles.pedalWrapper}>
        {/* Pedal Base / Bezel */}
        <View style={styles.svgContainer}>
          <Svg viewBox="0 0 100 200" style={styles.svg}>
            <Path
              d="M 10 0 L 90 0 L 80 200 L 20 200 Z"
              fill="#27272a" // zinc-800
              stroke="#52525b" // zinc-600
              strokeWidth="2"
            />
            <Path
              d="M 15 10 L 85 10 L 75 190 L 25 190 Z"
              fill="#18181b" // zinc-900
            />
          </Svg>
        </View>

        {/* LED Indicator */}
        <View
          style={[
            styles.ledIndicator,
            isActive ? styles.ledActive : styles.ledInactive,
          ]}
        />

        {/* Pedal Actuator (The moving part) */}
        <TouchableOpacity
          style={styles.pedalActuator}
          onPress={onClick}
          activeOpacity={0.8}
          {...pedalAnimationProps}
        >
          {/* Metal Tread Plate */}
          <View style={styles.treadPlate}>
            {/* Rubber Grip Texture */}
            <View style={styles.rubberGrip} />
          </View>
        </TouchableOpacity>

        {/* Label */}
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>

      {/* Sub Label (below pedal) */}
      {subLabel && (
        <View style={styles.subLabelContainer}>
          <Text style={styles.subLabel}>{subLabel}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * The large Expression Pedal on the right side.
 */
export function ExpressionPedal({ style }: { style?: any }) {
  // Animation props only for web
  const expressionAnimationProps =
    Platform.OS === "web"
      ? {
          whileHover: { scale: 1.01 },
          whileTap: { scale: 0.99 },
        }
      : {};

  const PedalComponent = Platform.OS === "web" ? MotionView : TouchableOpacity;
  const pedalProps =
    Platform.OS === "web"
      ? { ...expressionAnimationProps }
      : { activeOpacity: 0.9 };

  return (
    <View style={[styles.expressionContainer, style]}>
      <View style={styles.expressionPedal}>
        {/* Rubber Tread Pattern */}
        <View style={styles.rubberTread} />

        {/* Pedal Surface (Visual only, simple animation) */}
        <PedalComponent style={styles.pedalSurface} {...pedalProps}>
          {/* Logo Emboss */}
          <View style={styles.logoEmboss}>
            <Text style={styles.logoText}>Roland</Text>
          </View>

          {/* Curved shape simulation */}
          <View style={styles.curvedShape} />
        </PedalComponent>
      </View>

      {/* Side Label */}
      <View style={styles.sideLabel}>
        <Text style={styles.sideLabelText}>EXP PEDAL {"\n"} SW ON/OFF</Text>
      </View>
      <View style={styles.sideLabelArrow}>
        <Text style={styles.sideLabelArrowText}>►</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  pedalWrapper: {
    position: "relative",
    width: 96,
    height: 192,
  },
  svgContainer: {
    width: "100%",
    height: "100%",
    ...Platform.select({
      web: {
        filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))",
      },
      default: {
        elevation: 20,
      },
    }),
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  ledIndicator: {
    position: "absolute",
    top: 24,
    left: "50%",
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  ledActive: {
    backgroundColor: "#ef4444", // red-500
    ...Platform.select({
      web: {
        boxShadow: "0 0 15px rgba(239, 68, 68, 1)",
      },
      default: {
        elevation: 15,
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 7.5,
      },
    }),
  },
  ledInactive: {
    backgroundColor: "rgba(127, 29, 29, 0.3)", // red-900/30
  },
  pedalActuator: {
    position: "absolute",
    top: 80,
    left: "50%",
    marginLeft: -28.8, // 60% of 96px / 2
    width: "60%",
    height: "55%",
    ...Platform.select({
      web: {
        outline: "none",
      },
    }),
  },
  treadPlate: {
    width: "100%",
    height: "100%",
    borderRadius: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: "#71717a", // zinc-500
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 16,
    ...Platform.select({
      web: {
        background: "linear-gradient(to bottom, #52525b, #27272a)", // zinc-700 to zinc-800
        boxShadow: "inset 0 2px 5px rgba(255, 255, 255, 0.2)",
      },
      default: {
        backgroundColor: "#3f3f46", // zinc-700 (approximation)
      },
    }),
  },
  rubberGrip: {
    width: "80%",
    height: "70%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(24, 24, 27, 0.5)", // zinc-900/50
  },
  labelContainer: {
    position: "absolute",
    top: 48,
    left: "50%",
    marginLeft: -24,
    width: 48,
    alignItems: "center",
  },
  label: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -1,
    textAlign: "center",
    ...Platform.select({
      web: {
        textShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
      },
      default: {
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
      },
    }),
  },
  subLabelContainer: {
    marginTop: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#52525b", // zinc-700
  },
  subLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#d4d4d8", // zinc-300
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    lineHeight: 10,
  },
  expressionContainer: {
    position: "relative",
    height: "100%",
    width: "100%",
    backgroundColor: "#27272a", // zinc-800
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#18181b", // zinc-900
    padding: 8,
  },
  expressionPedal: {
    height: "100%",
    width: "100%",
    backgroundColor: "#18181b", // zinc-900
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#52525b", // zinc-700
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        cursor: "ns-resize",
      } as any,
      default: {
        backgroundColor: "#0f0f0f", // Darker for inset effect
      },
    }),
  },
  rubberTread: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    backgroundColor: "#000000",
    ...Platform.select({
      web: {
        backgroundImage:
          "repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)",
      },
      default: {
        opacity: 0.1,
      },
    }),
  },
  pedalSurface: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 4,
    borderTopWidth: 1,
    borderTopColor: "#52525b", // zinc-600
    ...Platform.select({
      web: {
        background: "linear-gradient(to bottom, #52525b, #27272a)", // zinc-700 to zinc-800
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      default: {
        backgroundColor: "#3f3f46", // zinc-700
        elevation: 8,
      },
    }),
  },
  logoEmboss: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    marginLeft: -32,
    width: 64,
    opacity: 0.2,
    transform: [{ rotate: "90deg" }],
  },
  logoText: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#ffffff",
    textAlign: "center",
  },
  curvedShape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    ...Platform.select({
      web: {
        background:
          "linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent)",
      },
      default: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      },
    }),
  },
  sideLabel: {
    position: "absolute",
    left: -64,
    top: 40,
    width: 48,
  },
  sideLabelText: {
    fontSize: 10,
    color: "#71717a", // zinc-500
    fontWeight: "700",
    textTransform: "uppercase",
    textAlign: "right",
    lineHeight: 12,
  },
  sideLabelArrow: {
    position: "absolute",
    left: -16,
    top: 48,
  },
  sideLabelArrowText: {
    fontSize: 10,
    color: "#71717a", // zinc-500
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
