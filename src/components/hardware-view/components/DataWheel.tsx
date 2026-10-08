import React, { useRef, useState } from "react";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";

import { getMotionComponent, getLucideIcon } from "../utils/tailwindCompat";

// Conditional imports for web-only libraries
const MotionView = getMotionComponent("div");
const Triangle = getLucideIcon("Triangle");

interface DataWheelProps {
  onRotate?: (direction: "left" | "right") => void;
  onPress?: (direction: "up" | "down" | "left" | "right") => void;
  style?: any;
}

/**
 * Large rotary encoder with directional buttons integrated.
 * Replicates the complex navigation wheel of the GR-55.
 */
export function DataWheel({ onRotate, onPress, style }: DataWheelProps) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<any>(null);

  // Wheel drag logic (only available on web with framer-motion)
  const handleWheelDrag = (event: any, info: any) => {
    const newRotation = rotation + info.delta.x + info.delta.y;
    setRotation(newRotation);
    if (info.delta.x > 0 || info.delta.y > 0) onRotate?.("right");
    else onRotate?.("left");
  };

  // Fallback click handler for native platforms
  const handleWheelClick = () => {
    if (Platform.OS !== "web") {
      const newRotation = rotation + 30;
      setRotation(newRotation);
      onRotate?.("right");
    }
  };

  // Animation props only for web
  const wheelAnimationProps =
    Platform.OS === "web"
      ? {
          drag: true,
          dragConstraints: wheelRef,
          dragElastic: 0,
          dragMomentum: false,
          onDrag: handleWheelDrag,
          animate: { rotate: rotation },
        }
      : {};

  // Fallback triangle icon for native platforms
  const TriangleIcon = ({
    iconStyle,
    rotation: iconRotation,
  }: {
    iconStyle: any;
    rotation: number;
  }) => {
    if (Triangle && Platform.OS === "web") {
      return (
        <Triangle
          style={[iconStyle, { transform: `rotate(${iconRotation}deg)` }]}
          fill="currentColor"
        />
      );
    }
    // SVG fallback for native platforms
    return (
      <View
        style={[
          iconStyle,
          {
            transform: [{ rotate: `${iconRotation}deg` }],
            width: 12,
            height: 12,
            backgroundColor: "#a1a1aa", // Approximation for triangle
          },
        ]}
      />
    );
  };

  const WheelComponent = Platform.OS === "web" ? MotionView : TouchableOpacity;
  const wheelProps =
    Platform.OS === "web"
      ? { ref: wheelRef, ...wheelAnimationProps, onPress: handleWheelClick }
      : { onPress: handleWheelClick, activeOpacity: 0.9 };

  return (
    <View style={[styles.container, style]}>
      {/* Directional Buttons Ring */}
      <View style={styles.buttonRing} />

      {/* Up Button */}
      <TouchableOpacity
        onPress={() => onPress?.("up")}
        style={[styles.directionButton, styles.upButton]}
        activeOpacity={0.7}
      >
        <TriangleIcon iconStyle={styles.triangleIcon} rotation={0} />
      </TouchableOpacity>

      {/* Down Button */}
      <TouchableOpacity
        onPress={() => onPress?.("down")}
        style={[styles.directionButton, styles.downButton]}
        activeOpacity={0.7}
      >
        <TriangleIcon iconStyle={styles.triangleIcon} rotation={180} />
      </TouchableOpacity>

      {/* Left Button */}
      <TouchableOpacity
        onPress={() => onPress?.("left")}
        style={[styles.directionButton, styles.leftButton]}
        activeOpacity={0.7}
      >
        <TriangleIcon iconStyle={styles.triangleIcon} rotation={-90} />
      </TouchableOpacity>

      {/* Right Button */}
      <TouchableOpacity
        onPress={() => onPress?.("right")}
        style={[styles.directionButton, styles.rightButton]}
        activeOpacity={0.7}
      >
        <TriangleIcon iconStyle={styles.triangleIcon} rotation={90} />
      </TouchableOpacity>

      {/* Center Wheel */}
      <WheelComponent
        style={[
          styles.centerWheel,
          Platform.OS !== "web" && {
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
        {...wheelProps}
      >
        {/* Wheel Texture */}
        <View style={styles.wheelTexture} />
        <View style={styles.wheelCenter} />
        {/* Spinner Divot */}
        <View style={styles.spinnerDivot} />
      </WheelComponent>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 111,
    borderWidth: 1,
    borderColor: "#52525b", // zinc-700
    backgroundColor: "#18181b", // zinc-900
    ...Platform.select({
      web: {
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      default: {
        elevation: 20,
      },
    }),
  },
  directionButton: {
    position: "absolute",
    backgroundColor: "#27272a", // zinc-800
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
      },
      default: {
        elevation: 2,
      },
    }),
  },
  upButton: {
    top: 4,
    left: "50%",
    marginLeft: -16,
    width: 32,
    height: 24,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  downButton: {
    bottom: 4,
    left: "50%",
    marginLeft: -16,
    width: 32,
    height: 24,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  leftButton: {
    left: 4,
    top: "50%",
    marginTop: -16,
    width: 24,
    height: 32,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightButton: {
    right: 4,
    top: "50%",
    marginTop: -16,
    width: 24,
    height: 32,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  triangleIcon: {
    width: 12,
    height: 12,
    color: "#a1a1aa", // zinc-400
  },
  centerWheel: {
    width: 141,
    height: 141,
    borderRadius: 70,
    backgroundColor: "#27272a", // zinc-800
    borderWidth: 4,
    borderColor: "#18181b", // zinc-900
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
        cursor: "grab",
      } as any,
      default: {
        elevation: 10,
      },
    }),
  },
  wheelTexture: {
    position: "absolute",
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 2,
    borderColor: "#52525b", // zinc-600
    borderStyle: "dashed",
    opacity: 0.3,
  },
  wheelCenter: {
    width: 77,
    height: 77,
    borderRadius: 38,
    backgroundColor: "rgba(24, 24, 27, 0.5)", // zinc-900/50
    ...Platform.select({
      web: {
        boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
      default: {
        // React Native doesn't support inset shadows, so we'll use a darker background
        backgroundColor: "#0f0f0f",
      },
    }),
  },
  spinnerDivot: {
    position: "absolute",
    top: 13,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#0c0a09", // zinc-950
    borderWidth: 1,
    borderColor: "#52525b", // zinc-700
    ...Platform.select({
      web: {
        boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
      default: {
        backgroundColor: "#000000",
      },
    }),
  },
});
