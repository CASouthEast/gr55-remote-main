/**
 * GR55Controller - Main Component
 *
 * Implements the layout logic and state management for the guitar synthesizer.
 * Organizes sub-components into the specific grid layout from the schematic.
 */
import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

import { GR55State, GR55Actions } from "../GR55HWView.types";
import { Button, SoundStyleButton } from "./Buttons";
import { DataWheel } from "./DataWheel";
import { Display } from "./Display";
import { Pedal, ExpressionPedal } from "./Pedal";
import { DEFAULT_STYLES, DEFAULT_GR55_STATE } from "../utils/constants";

interface GR55ControllerProps {
  initialState?: Partial<GR55State>;
  onStateChange?: (state: GR55State) => void;
}

/**
 * Main GR55 Controller component that manages the complete hardware interface
 * Maintains state and coordinates all sub-components with enhanced visual design
 */
export function GR55Controller({
  initialState,
  onStateChange,
}: GR55ControllerProps) {
  console.log("GR55Controller: Component loading...");

  const [state, setState] = useState<GR55State>({
    ...DEFAULT_GR55_STATE,
    ...initialState,
  });

  // State update handler that notifies parent component
  const handleStateChange = useCallback(
    (newState: Partial<GR55State>) => {
      const updatedState = { ...state, ...newState };
      setState(updatedState);
      onStateChange?.(updatedState);
    },
    [state, onStateChange]
  );

  // Action handlers for different controls
  const actions: GR55Actions = useMemo(
    () => ({
      setActivePedal: (pedal: number) => {
        handleStateChange({
          activePedal: pedal,
          bank: `0${pedal}-1`, // Update bank display based on pedal
        });
      },

      setPatchName: (name: string) => {
        handleStateChange({ patchName: name });
      },

      setActiveStyle: (style: GR55State["activeStyle"]) => {
        const styleConfig = DEFAULT_STYLES.find((s) => s.id === style);
        handleStateChange({
          activeStyle: style,
          patchName: styleConfig?.patch || state.patchName,
        });
      },
    }),
    [handleStateChange, state.patchName]
  );

  // Data wheel handlers
  const handleDataWheelRotate = useCallback(
    (direction: "left" | "right") => {
      // Cycle through patches or banks based on direction
      const currentPedal = state.activePedal;
      if (direction === "right" && currentPedal < 4) {
        actions.setActivePedal(currentPedal + 1);
      } else if (direction === "left" && currentPedal > 1) {
        actions.setActivePedal(currentPedal - 1);
      }
    },
    [state.activePedal, actions]
  );

  const handleDataWheelPress = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      // Handle directional navigation
      switch (direction) {
        case "up": {
          // Cycle through styles forward
          const currentStyleIndex = DEFAULT_STYLES.findIndex(
            (s) => s.id === state.activeStyle
          );
          const nextStyleIndex =
            (currentStyleIndex + 1) % DEFAULT_STYLES.length;
          actions.setActiveStyle(
            DEFAULT_STYLES[nextStyleIndex].id as GR55State["activeStyle"]
          );
          break;
        }
        case "down": {
          // Cycle through styles backward
          const currentStyleIndexDown = DEFAULT_STYLES.findIndex(
            (s) => s.id === state.activeStyle
          );
          const prevStyleIndex =
            currentStyleIndexDown === 0
              ? DEFAULT_STYLES.length - 1
              : currentStyleIndexDown - 1;
          actions.setActiveStyle(
            DEFAULT_STYLES[prevStyleIndex].id as GR55State["activeStyle"]
          );
          break;
        }
        case "left":
          if (state.activePedal > 1) {
            actions.setActivePedal(state.activePedal - 1);
          }
          break;
        case "right":
          if (state.activePedal < 4) {
            actions.setActivePedal(state.activePedal + 1);
          }
          break;
      }
    },
    [state.activeStyle, state.activePedal, actions]
  );

  console.log("GR55Controller: Rendering main view...");

  return (
    <View style={styles.container}>
      {/* Main Chassis */}
      <View style={styles.chassis}>
        {/* Top Edge Labels (Ports) */}
        <View style={styles.portLabels}>
          <Text style={styles.portLabel}>USB MEMORY</Text>
          <View style={styles.portLabelsRight}>
            <Text style={styles.portLabel}>DC IN</Text>
            <Text style={styles.portLabel}>POWER</Text>
            <Text style={styles.portLabel}>USB COMPUTER</Text>
            <Text style={styles.portLabel}>MIDI IN/OUT</Text>
            <Text style={styles.portLabel}>PHONES</Text>
            <Text style={styles.portLabel}>L/MONO OUTPUT R</Text>
            <Text style={styles.portLabel}>GUITAR OUT</Text>
            <Text style={styles.portLabel}>GK IN</Text>
          </View>
        </View>

        {/* Left Main Section */}
        <View style={styles.leftSection}>
          {/* Top Control Panel Area */}
          <View style={styles.controlPanel}>
            {/* Header / Logo */}
            <View style={styles.header}>
              <Text style={styles.rolandTitle}>
                Roland <Text style={styles.modelNumber}>GR-55</Text>{" "}
                <Text style={styles.subtitle}>GUITAR SYNTHESIZER</Text>
              </Text>
            </View>

            <View style={styles.mainContent}>
              {/* Left Column: Screen & Style Buttons */}
              <View style={styles.leftColumn}>
                {/* Display */}
                <Display
                  patchName={state.patchName}
                  bank={state.bank}
                  mode={state.activeStyle}
                />

                {/* Enhanced Sound Style Buttons with better alignment */}
                <View style={styles.styleSection}>
                  <View style={styles.styleSectionHeader}>
                    <Text style={styles.sectionLabel}>SOUND STYLE</Text>
                  </View>
                  <View style={styles.styleButtons}>
                    <SoundStyleButton
                      label="V-LINK"
                      active={false}
                      onClick={() => {}}
                    />

                    {DEFAULT_STYLES.map((style) => (
                      <SoundStyleButton
                        key={style.id}
                        label={style.label}
                        active={state.activeStyle === style.id}
                        onClick={() =>
                          actions.setActiveStyle(
                            style.id as GR55State["activeStyle"]
                          )
                        }
                      />
                    ))}

                    {/* EZ Edit Section with enhanced alignment */}
                    <View style={styles.ezEditSection}>
                      <Text style={styles.ezEditLabel}>EZ EDIT</Text>
                      <Button
                        label=""
                        variant="rect"
                        style={styles.ezEditButton}
                      />
                    </View>
                  </View>
                </View>

                {/* Pedals Section */}
                <View style={styles.pedalSection}>
                  <View style={styles.pedals}>
                    <View style={styles.pedalColumn}>
                      <Pedal
                        label="1"
                        isActive={state.activePedal === 1}
                        onClick={() => actions.setActivePedal(1)}
                        subLabel="BANK ▲"
                      />
                    </View>
                    <View style={styles.pedalColumn}>
                      <Pedal
                        label="2"
                        isActive={state.activePedal === 2}
                        onClick={() => actions.setActivePedal(2)}
                        subLabel="BANK ▼"
                      />
                    </View>
                    <View style={styles.pedalColumn}>
                      <Pedal
                        label="3"
                        isActive={state.activePedal === 3}
                        onClick={() => actions.setActivePedal(3)}
                        subLabel="PHRASE LOOP"
                      />
                    </View>
                    <View style={styles.pedalColumn}>
                      <Pedal
                        label="CTL"
                        isActive={state.activePedal === 4}
                        onClick={() => actions.setActivePedal(4)}
                        subLabel="REC/PLAY/DUB"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Right Column: Wheel & Nav with enhanced positioning */}
              <View style={styles.rightColumn}>
                {/* Output Level */}
                <View style={styles.outputLevel}>
                  <Text style={styles.outputLevelLabel}>Output Level</Text>
                  <View style={styles.outputLevelKnob}>
                    <View style={styles.outputLevelIndicator} />
                  </View>
                </View>

                {/* Data Wheel */}
                <DataWheel
                  onRotate={handleDataWheelRotate}
                  onPress={handleDataWheelPress}
                />

                {/* Enhanced Nav Buttons Grid with better alignment */}
                <View style={styles.navButtons}>
                  <View style={styles.navButtonGroup}>
                    <Text style={styles.navButtonLabel}>PAGE</Text>
                    <Button label="◄" variant="rect" />
                  </View>
                  <View style={styles.navButtonGroup}>
                    <Text style={styles.navButtonLabel}>PAGE</Text>
                    <Button label="►" variant="rect" />
                  </View>
                  <View style={styles.navButtonGroup}>
                    <Text style={styles.navButtonLabel}>EDIT</Text>
                    <Button label="" variant="rect" />
                  </View>

                  <Button label="EXIT" variant="rect" />
                  <Button label="ENTER" variant="rect" />
                  <Button label="WRITE" variant="rect" />
                </View>

                {/* Audio Player positioned to align with CTL pedal */}
                <View style={styles.audioPlayer}>
                  <Text style={styles.audioPlayerLabel}>AUDIO PLAYER</Text>
                  <Button
                    label=""
                    variant="rect"
                    style={styles.audioPlayerButton}
                  />
                  <Text style={styles.usbMemoryLabel}>USB MEMORY</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Branding Logos */}
          <View style={styles.branding}>
            <Text style={styles.grLogo}>GR</Text>
            <Text style={styles.cosmBadge}>COSM</Text>
          </View>
        </View>

        {/* Right Expression Pedal Section */}
        <View style={styles.rightSection}>
          <ExpressionPedal />
        </View>

        {/* USB Side Port */}
        <View style={styles.usbSidePort}>
          <Text style={styles.usbSideLabel}>USB MEMORY</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4e4e7", // zinc-200
    alignItems: "center",
    justifyContent: "center",
    padding: Platform.OS === "web" ? 32 : 16,
    ...(Platform.OS === "web" && {
      minHeight: "100vh" as any,
      width: "100vw" as any,
    }),
  },
  chassis: {
    position: "relative",
    backgroundColor: "#1e2024",
    padding: 4,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#353940",
    minWidth: Platform.OS === "web" ? 1000 : 350,
    maxWidth: Platform.OS === "web" ? 1200 : 400,
    flexDirection: "row",
    ...Platform.select({
      web: {
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      default: {
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
    }),
  },
  portLabels: {
    position: "absolute",
    top: -24,
    left: 80,
    right: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  portLabelsRight: {
    flexDirection: "row",
    gap: 32,
  },
  portLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#52525b", // zinc-600
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  leftSection: {
    flex: 1,
    flexDirection: "column",
    borderRightWidth: 2,
    borderRightColor: "rgba(0,0,0,0.5)",
    backgroundColor: "#25282e",
  },
  controlPanel: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#52525b", // zinc-600
    paddingBottom: 8,
    marginBottom: 8,
  },
  rolandTitle: {
    fontSize: 30,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -0.75,
    color: "#f4f4f5", // zinc-100
  },
  modelNumber: {
    fontSize: 24,
    fontWeight: "400",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    fontStyle: "normal",
    marginLeft: 8,
    color: "#a1a1aa", // zinc-400
    letterSpacing: 2.4,
  },
  mainContent: {
    flexDirection: "row",
    gap: 32,
    flex: 1,
  },
  leftColumn: {
    flex: 3,
    gap: 16,
  },
  styleSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#52525b", // zinc-600
    position: "relative",
  },
  pedalSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#52525b", // zinc-600
    position: "relative",
  },
  styleSectionHeader: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "#25282e",
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#a1a1aa", // zinc-400
    textTransform: "uppercase",
  },
  styleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  ezEditSection: {
    marginLeft: 16,
    alignItems: "center",
    paddingTop: 8,
  },
  ezEditLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f4f4f5", // zinc-100
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  ezEditButton: {
    width: 64,
    height: 32,
  },
  rightColumn: {
    flex: 1,
    alignItems: "center",
    gap: 24,
    paddingTop: 8,
  },
  outputLevel: {
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  outputLevelLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#a1a1aa", // zinc-400
    textTransform: "uppercase",
  },
  outputLevelKnob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#27272a", // zinc-800
    borderWidth: 2,
    borderColor: "#52525b", // zinc-600
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
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
  outputLevelIndicator: {
    width: 4,
    height: 16,
    backgroundColor: "#ffffff",
    borderRadius: 2,
    position: "absolute",
    top: 4,
  },
  navButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
    paddingHorizontal: 8,
    justifyContent: "space-between",
  },
  navButtonGroup: {
    alignItems: "center",
    gap: 4,
  },
  navButtonLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#a1a1aa", // zinc-400
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  audioPlayer: {
    marginTop: "auto",
    alignItems: "center",
  },
  audioPlayerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#a1a1aa", // zinc-400
    marginBottom: 4,
  },
  audioPlayerButton: {
    width: 56,
  },
  usbMemoryLabel: {
    fontSize: 10,
    backgroundColor: "#000000",
    color: "#ffffff",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  pedalArea: {
    backgroundColor: "#1a1c21",
    padding: 20, // Reduced from 24 for tighter spacing
    borderTopWidth: 2,
    borderTopColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 28, // Reduced from 32
    position: "relative",
  },
  pedalColumn: {
    alignItems: "center",
    gap: 8,
  },
  bankSelectUp: {
    alignItems: "center",
  },
  bankSelectDown: {
    alignItems: "center",
  },
  bankArrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#a1a1aa", // zinc-400
  },
  bankArrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#a1a1aa", // zinc-400
  },
  bankLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
    backgroundColor: "#000000",
    paddingHorizontal: 4,
  },
  bankSelectLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
    backgroundColor: "#000000",
    paddingHorizontal: 4,
    textAlign: "center",
    lineHeight: 12,
  },
  pedals: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
    paddingHorizontal: 40,
  },
  branding: {
    position: "absolute",
    right: 24,
    bottom: 72, // Adjusted for tighter layout
    alignItems: "flex-end",
    opacity: 0.8,
  },
  grLogo: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontSize: 88, // Slightly reduced from 96
    fontWeight: "900",
    color: "#71717a", // zinc-500
    letterSpacing: -2,
  },
  cosmBadge: {
    fontWeight: "700",
    color: "#ffffff",
    backgroundColor: "#000000",
    paddingHorizontal: 4,
    fontStyle: "italic",
    transform: [{ skewX: "-10deg" }],
    borderWidth: 1,
    borderColor: "#52525b", // zinc-600
  },
  rightSection: {
    width: 128,
    backgroundColor: "#25282e",
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0,0,0,0.5)",
    padding: 8,
    paddingLeft: 0,
  },
  usbSidePort: {
    position: "absolute",
    left: -4,
    top: 128,
    bottom: 128,
    width: 4,
    backgroundColor: "#27272a", // zinc-800
    borderLeftWidth: 1,
    borderLeftColor: "#52525b", // zinc-600
    alignItems: "center",
    justifyContent: "center",
  },
  usbSideLabel: {
    fontSize: 10,
    color: "#71717a", // zinc-500
    transform: [{ rotate: "-90deg" }],
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
});

export default GR55Controller;
