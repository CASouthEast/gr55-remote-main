/**
 * GR55Controller - Main Component
 *
 * Layout orchestration for the GR-55 hardware view. Logic is encapsulated in
 * the useGR55ControllerState hook and UI is composed from local presentational
 * subcomponents to ease future SwiftUI migration.
 *
 * NOTE: Standard Animated API from react-native is used here instead of
 * react-native-reanimated to avoid version compatibility issues (Worklets mismatch).
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from "react-native";
import Svg, { Rect, LinearGradient, Stop, Defs } from "react-native-svg";

import { useUserOptions } from "../../UserOptions";
import { GR55State } from "../GR55HWView.types";
import { Display } from "./Display";
import { NavigationCluster } from "./NavigationCluster";
import { ExpressionPedal } from "./Pedal";
import { PedalCluster } from "./PedalCluster";
import { PortsBar } from "./PortsBar";
import { PreviewPane, HoveredItem } from "./PreviewPane";
import { SoundStylePanel } from "./SoundStylePanel";
import { useGR55ControllerState } from "./useGR55ControllerState";
import { DEFAULT_STYLES } from "../utils/constants";
import {
  hardwareColors,
  hardwareRadii,
  hardwareShadow,
  hardwareSpacing,
} from "../utils/hardwareViewTokens";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface GR55ControllerProps {
  initialState?: Partial<GR55State>;
  onStateChange?: (state: GR55State) => void;
}

export function GR55Controller({
  initialState,
  onStateChange,
}: GR55ControllerProps) {
  const [hoveredItem, setHoveredItem] = useState<HoveredItem>(null);
  const [userOptions] = useUserOptions();
  const hwTheme = userOptions?.hardwareTheme || "metallicBlack";

  // Animation values using standard Animated API
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const outlineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: Platform.OS !== "web", // Native driver for performance
      })
    ).start();

    // Glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    ).start();

    // Outline movement animation
    Animated.loop(
      Animated.timing(outlineAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: false, // SVG props often don't support native driver
      })
    ).start();
  }, []);

  // Interpolations for Animated.View transforms/props
  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-600, 1200],
  });

  const outlineOffset = outlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2100],
  });

  const {
    state,
    ledActiveStyle,
    bankSlots,
    activePedal,
    actions,
    navigation,
    selectStylePatch,
    remote,
    toggles,
  } = useGR55ControllerState(initialState, onStateChange);

  const {
    ctlStatus,
    ctlFunction,
    expSwStatus,
    expSwFunction,
    patchLevel,
    setPatchLevel,
    guitarOutSource,
    gkS1Function,
    gkS2Function,
    gkVolFunction,
  } = remote;

  const { handleCtlPedalToggle, handleExpSwToggle } = toggles;
  const {
    gotoNextBank,
    gotoPrevBank,
    selectOrdinalInCurrentBank,
    handleDataWheelRotate,
    handleDataWheelPress,
  } = navigation;

  const currentColors = hardwareColors[hwTheme] || hardwareColors.metallicBlack;

  return (
    <View style={styles.container}>
      <View style={styles.chassisContainer}>
        <PortsBar guitarOutSource={guitarOutSource} />

        <View
          style={[styles.chassis, { backgroundColor: currentColors.chassis }]}
        >
          {/* Shimmer Effect */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.shimmerWrapper,
              { transform: [{ translateX: shimmerTranslateX }] } as any,
              { pointerEvents: "none" },
            ]}
          >
            <Svg height="100%" width="100%" style={styles.shimmerSvg}>
              <Defs>
                <LinearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="rgba(255,255,255,0)" />
                  <Stop offset="0.5" stopColor="rgba(255,255,255,0.1)" />
                  <Stop offset="1" stopColor="rgba(255,255,255,0)" />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#shimmer)"
              />
            </Svg>
          </Animated.View>

          {/* Neon Glow Outline */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.neonOutline,
              { opacity: glowAnim, pointerEvents: "none" },
            ]}
          >
            <Svg height="100%" width="100%">
              <AnimatedRect
                x="2"
                y="2"
                width="99%"
                height="99%"
                rx={hardwareRadii.lg}
                ry={hardwareRadii.lg}
                fill="none"
                stroke={hardwareColors.neonGreen}
                strokeWidth="3"
                strokeDasharray="150, 1950"
                strokeDashoffset={outlineOffset}
              />
            </Svg>
            <View style={styles.outlineBorder} />
          </Animated.View>

          <View
            style={[
              styles.leftSection,
              { backgroundColor: currentColors.surface },
            ]}
          >
            <View style={styles.controlPanel}>
              <View style={styles.header}>
                <Text style={styles.rolandTitle}>
                  Roland <Text style={styles.modelNumber}>GR-55</Text>{" "}
                  <Text style={styles.subtitle}>GUITAR SYNTHESIZER</Text>
                </Text>
              </View>

              <View style={styles.mainContent}>
                <View style={styles.leftColumn}>
                  <Display
                    patchName={state.patchName}
                    bank={state.bank}
                    mode={state.activeStyle}
                    onHoverChange={setHoveredItem}
                  />

                  <SoundStylePanel
                    stylesConfig={DEFAULT_STYLES}
                    ledActiveStyle={ledActiveStyle}
                    onSelectStyle={selectStylePatch}
                  />

                  <PedalCluster
                    activePedal={activePedal}
                    bankSlots={bankSlots}
                    ctlStatus={ctlStatus}
                    ctlFunction={ctlFunction}
                    onCtlToggle={handleCtlPedalToggle}
                    onSelectPedal={actions.setActivePedal}
                    selectOrdinalInCurrentBank={selectOrdinalInCurrentBank}
                    gotoNextBank={gotoNextBank}
                    gotoPrevBank={gotoPrevBank}
                  />
                </View>

                <View style={styles.rightColumn}>
                  <NavigationCluster
                    gkS1Function={gkS1Function}
                    gkS2Function={gkS2Function}
                    gkVolFunction={gkVolFunction}
                    onDataWheelRotate={handleDataWheelRotate}
                    onDataWheelPress={handleDataWheelPress}
                  />
                </View>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.rightSection,
              { backgroundColor: currentColors.surface },
            ]}
          >
            <ExpressionPedal
              expSwStatus={expSwStatus}
              expSwFunction={expSwFunction}
              onExpSwToggle={handleExpSwToggle}
              patchLevel={patchLevel}
              onPatchLevelChange={setPatchLevel}
            />
          </View>

          <PreviewPane hoveredItem={hoveredItem} />

          <View style={styles.usbSidePort}>
            <Text style={styles.usbSideLabel}>USB MEMORY</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: hardwareColors.background,
    alignItems: "center",
    justifyContent: "center",
    minHeight: Platform.OS === "web" ? ("100vh" as any) : undefined,
    width: Platform.OS === "web" ? ("100vw" as any) : "100%",
  },
  chassisContainer: {
    position: "relative",
    paddingTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  chassis: {
    position: "relative",
    padding: hardwareSpacing.xs,
    borderRadius: hardwareRadii.lg,
    borderWidth: 4,
    borderColor: hardwareColors.neonGreen + "33",
    minWidth: Platform.OS === "web" ? 1000 : 350,
    maxWidth: Platform.OS === "web" ? 1200 : 400,
    flexDirection: "row",
    overflow: "hidden",
    ...Platform.select({
      web:
        typeof hardwareShadow?.chassis === "string"
          ? { boxShadow: hardwareShadow.chassis }
          : {},
      default:
        typeof hardwareShadow?.chassis === "object"
          ? (hardwareShadow.chassis as object)
          : {},
    }),
  },
  leftSection: {
    flex: 1,
    flexDirection: "column",
    borderRightWidth: 2,
    borderRightColor: hardwareColors.borderMuted,
  },
  controlPanel: {
    flex: 1,
    padding: hardwareSpacing.lg,
    gap: hardwareSpacing.lg,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: hardwareColors.border,
    paddingBottom: hardwareSpacing.sm,
    marginBottom: hardwareSpacing.sm,
  },
  rolandTitle: {
    fontSize: 30,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -0.75,
    color: hardwareColors.textPrimary,
  },
  modelNumber: {
    fontSize: 24,
    fontWeight: "400",
    marginLeft: 8,
    color: hardwareColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    fontStyle: "normal",
    marginLeft: 8,
    color: hardwareColors.textMuted,
    letterSpacing: 2.4,
  },
  mainContent: {
    flexDirection: "row",
    gap: hardwareSpacing.xl,
    flex: 1,
  },
  leftColumn: {
    flex: 3,
    gap: hardwareSpacing.md,
  },
  rightColumn: {
    flex: 1,
    alignItems: "center",
  },
  rightSection: {
    width: 128,
    borderLeftWidth: 2,
    borderLeftColor: hardwareColors.borderMuted,
    padding: hardwareSpacing.sm,
    paddingLeft: 0,
  },
  usbSidePort: {
    position: "absolute",
    left: -4,
    top: 128,
    bottom: 128,
    width: 4,
    backgroundColor: hardwareColors.inset,
    borderLeftWidth: 1,
    borderLeftColor: hardwareColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  usbSideLabel: {
    fontSize: 10,
    color: hardwareColors.textSecondary,
    transform: [{ rotate: "-90deg" }],
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  shimmerWrapper: {
    opacity: 0.3,
  },
  shimmerSvg: {
    transform: [{ rotate: "25deg" }, { scale: 2 }],
  },
  neonOutline: {
    margin: -2,
  },
  outlineBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: hardwareColors.neonGreen,
    borderRadius: hardwareRadii.lg,
    opacity: 0.3, // Faint constant glow
  },
});

export default GR55Controller;
