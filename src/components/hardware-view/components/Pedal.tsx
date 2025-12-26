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
  topLabel?: string;
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
  topLabel,
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
      {topLabel !== undefined && (
        <Text style={styles.topLabel} numberOfLines={1}>
          {topLabel}
        </Text>
      )}
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

interface ExpressionPedalProps {
  style?: any;
  expSwStatus?: boolean;
  expSwFunction?: string;
  onExpSwToggle?: () => void;
  patchLevel?: number;
  onPatchLevelChange?: (level: number) => void;
}

/**
 * The large Expression Pedal on the right side.
 */
export function ExpressionPedal({
  style,
  expSwStatus,
  expSwFunction,
  onExpSwToggle,
  patchLevel = 0,
  onPatchLevelChange,
}: ExpressionPedalProps) {
  // Animation props only for web
  const expressionAnimationProps =
    Platform.OS === "web"
      ? {
          whileHover: { scale: 1.01 },
          whileTap: { scale: 0.99 },
        }
      : {};

  // Web-only: drag on the pedal surface to adjust patch level
  const [isDragging, setIsDragging] = React.useState(false);
  const overlaySizeRef = React.useRef<number | null>(null);

  // Calculate level bar height (120 is the fixed container height from styles)
  const LEVEL_BAR_CONTAINER_HEIGHT = 600;
  const LEVEL_BAR_PADDING = 4;
  const levelBarHeight = React.useMemo(() => {
    const usable = LEVEL_BAR_CONTAINER_HEIGHT - LEVEL_BAR_PADDING;
    return Math.max(2, Math.round((patchLevel / 100) * usable));
  }, [patchLevel]);
  const updateLevelFromClientY = React.useCallback(
    (clientY: number, target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      const relative = 1 - (clientY - rect.top) / rect.height; // top = 100, bottom = 0
      const clamped = Math.max(0, Math.min(1, relative));
      onPatchLevelChange?.(Math.round(clamped * 100));
    },
    [onPatchLevelChange]
  );
  const onPointerDown = React.useCallback(
    (e: any) => {
      if (Platform.OS !== "web") return;
      setIsDragging(true);
      try {
        e.currentTarget?.setPointerCapture?.(e.pointerId);
      } catch {
        // Ignore pointer capture errors
      }
      updateLevelFromClientY(e.clientY, e.currentTarget as HTMLElement);
    },
    [updateLevelFromClientY]
  );
  const onPointerMove = React.useCallback(
    (e: any) => {
      if (Platform.OS !== "web" || !isDragging) return;
      updateLevelFromClientY(e.clientY, e.currentTarget as HTMLElement);
    },
    [isDragging, updateLevelFromClientY]
  );
  const onPointerUp = React.useCallback((e: any) => {
    if (Platform.OS !== "web") return;
    setIsDragging(false);
    try {
      e.currentTarget?.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore pointer capture errors
    }
  }, []);

  const PedalComponent = Platform.OS === "web" ? MotionView : TouchableOpacity;
  const pedalProps =
    Platform.OS === "web"
      ? {
          ...expressionAnimationProps,
          onPointerDown,
          onPointerMove,
          onPointerUp,
          role: "slider",
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-valuenow": Math.round(patchLevel),
          "aria-label": "Expression pedal level",
        }
      : { activeOpacity: 0.9 };

  return (
    <View style={[styles.expressionContainer, style]}>
      {/* EXP SW Button */}
      <View style={styles.expSwButtonContainer}>
        {expSwFunction !== undefined && (
          <Text style={styles.expSwTopLabel} numberOfLines={1}>
            {expSwFunction}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.expSwButton,
            expSwStatus ? styles.expSwButtonActive : styles.expSwButtonInactive,
          ]}
          onPress={onExpSwToggle}
          activeOpacity={0.8}
        >
          {/* LED Indicator */}
          <View
            style={[
              styles.expSwLed,
              expSwStatus ? styles.ledActive : styles.ledInactive,
            ]}
          />
        </TouchableOpacity>
        <View style={styles.expSwSubLabelContainer}>
          <Text style={styles.expSwSubLabel}>EXP SW</Text>
        </View>
      </View>

      {/* Expression Pedal */}
      <View style={styles.expressionPedal}>
        {/* Rubber Tread Pattern */}
        <View style={styles.rubberTread} />

        {/* Pedal Surface (Visual only, simple animation) */}
        <PedalComponent style={styles.pedalSurface} {...pedalProps}>
          {/* Logo Emboss */}
          <View style={styles.logoEmboss}>
            <Text style={styles.logoText}>EXP</Text>
          </View>

          {/* Curved shape simulation */}
          <View style={styles.curvedShape} />
        </PedalComponent>

        {/* Level Overlay */}
        <View
          style={styles.levelOverlay}
          onLayout={(e) =>
            (overlaySizeRef.current = e.nativeEvent.layout.height)
          }
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            const h = overlaySizeRef.current ?? 0;
            const y = e.nativeEvent.locationY;
            const ratio = 1 - y / Math.max(h, 1);
            const clamped = Math.max(0, Math.min(1, ratio));
            onPatchLevelChange?.(Math.round(clamped * 100));
          }}
          onResponderMove={(e) => {
            const h = overlaySizeRef.current ?? 0;
            const y = e.nativeEvent.locationY;
            const ratio = 1 - y / Math.max(h, 1);
            const clamped = Math.max(0, Math.min(1, ratio));
            onPatchLevelChange?.(Math.round(clamped * 100));
          }}
          onResponderRelease={() => {
            // no-op; keep final value
          }}
        >
          {/* Level Value Display */}
          <Text style={styles.levelValue}>{Math.round(patchLevel)}</Text>

          {/* Level Bar Container */}
          <View style={styles.levelBarContainer}>
            {/* Full Gradient Background */}
            <View style={styles.levelBarGradient} />
            {/* Overlay that shrinks as level increases */}
            <View
              style={[
                styles.levelBarOverlay,
                {
                  height: LEVEL_BAR_CONTAINER_HEIGHT - levelBarHeight,
                },
              ]}
            />
          </View>

          {/* Drag to adjust level (web/native) */}
        </View>
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
  topLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#f97316", // GR orange
    textAlign: "center",
    marginBottom: 4,
    maxWidth: 140,
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
    flexDirection: "column",
    gap: 8,
  },
  expSwButtonContainer: {
    alignItems: "center",
    gap: 4,
  },
  expSwTopLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#f97316", // GR orange
    textAlign: "center",
    maxWidth: 100,
  },
  expSwButton: {
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
  expSwButtonActive: {
    // Active state uses same background as base
  },
  expSwButtonInactive: {
    // Inactive state uses same background as base
  },
  expSwLed: {
    width: 16,
    height: 8,
    marginTop: 6,
    borderRadius: 2,
  },
  expSwSubLabelContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#52525b", // zinc-700
  },
  expSwSubLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#d4d4d8", // zinc-300
    textTransform: "uppercase",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  expressionPedal: {
    flex: 1,
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
  levelOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  levelValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelBarContainer: {
    width: 24,
    height: 600,
    borderWidth: 1,
    borderColor: "#52525b",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: "#0a0a0a",
    position: "relative",
  },
  levelBarGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...Platform.select({
      web: {
        backgroundImage:
          "linear-gradient(to top, #00ff00, #ffff00, #ff8800, #ff0000)",
      },
      default: {
        backgroundColor: "#00ff00",
      },
    }),
  },
  levelBarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0a0a0a",
    zIndex: 1,
  },
  levelBar: {
    width: "100%",
    borderRadius: 2,
    minHeight: 2,
    ...Platform.select({
      web: {
        backgroundImage:
          "linear-gradient(to top, #00ff00, #ffff00, #ff8800, #ff0000)",
        backgroundSize: "100% 600px",
        backgroundPosition: "0 100%",
        backgroundRepeat: "no-repeat",
      },
      default: {
        backgroundColor: "#00ff00",
      },
    }),
  },
});
