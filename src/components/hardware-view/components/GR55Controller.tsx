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
import { RolandRemotePatchContext as PATCH } from "../../../contexts/RolandRemotePageContext";
import { useRemoteField } from "../../../hooks/useRemoteField";
import { useRolandRemotePatchSelection } from "../../../lib/RolandRemotePatchSelection";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../../lib/roland-gr55/RolandGR55AddressMap";
import { useRolandGR55RemotePatchDescriptions } from "../../../lib/roland-gr55/RolandGR55RemotePatchDescriptions";
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

  // CTL pedal state and function from GR-55
  const [ctlStatus, setCtlStatus] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.ctl.status
  );
  const [ctlFunction] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.ctl.function
  );

  // EXP SW state and function from GR-55
  const [expSwStatus, setExpSwStatus] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.expSw.status
  );
  const [expSwFunction] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.expSw.function
  );

  // Patch Level from GR-55
  const [patchLevel, setPatchLevel] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.patchLevel
  );

  // State update handler that notifies parent component
  const handleStateChange = useCallback(
    (newState: Partial<GR55State>) => {
      const updatedState = { ...state, ...newState };
      setState(updatedState);
      onStateChange?.(updatedState);
    },
    [state, onStateChange]
  );

  // CTL pedal toggle handler
  const handleCtlPedalToggle = useCallback(() => {
    setCtlStatus(!ctlStatus);
  }, [ctlStatus, setCtlStatus]);

  // EXP SW toggle handler
  const handleExpSwToggle = useCallback(() => {
    setExpSwStatus(!expSwStatus);
  }, [expSwStatus, setExpSwStatus]);

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

  // Determine current patch sound type from remote selection and descriptions
  const { selectedPatch, setSelectedPatch } = useRolandRemotePatchSelection();
  const { patches } = useRolandGR55RemotePatchDescriptions();
  const currentPatch = patches?.find(
    (p) =>
      selectedPatch &&
      p.identity.bankMSB === selectedPatch.bankSelectMSB &&
      p.identity.pc === selectedPatch.pc
  );
  const remoteSoundType = currentPatch?.identity.styleLabel as
    | GR55State["activeStyle"]
    | undefined;
  const ledActiveStyle = remoteSoundType ?? state.activeStyle;

  // Style-scoped patch navigation helpers
  const stylePatches = useMemo(
    () =>
      patches?.filter((p) => p.identity.styleLabel === ledActiveStyle) ?? [],
    [patches, ledActiveStyle]
  );
  const styleBanks = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    stylePatches.forEach((p) => {
      const bankLabel = p.identity.patchNumberLabel.split("-")[0];
      if (!seen.has(bankLabel)) {
        seen.add(bankLabel);
        order.push(bankLabel);
      }
    });
    return order;
  }, [stylePatches]);
  const currentStyleIndex = useMemo(() => {
    if (!selectedPatch) return -1;
    return stylePatches.findIndex(
      (p) =>
        p.identity.bankMSB === selectedPatch.bankSelectMSB &&
        p.identity.pc === selectedPatch.pc
    );
  }, [stylePatches, selectedPatch]);
  const currentBankIndex = useMemo(() => {
    const bankLabel = currentPatch?.identity.patchNumberLabel?.split("-")[0];
    if (!bankLabel) return -1;
    return styleBanks.findIndex((b) => b === bankLabel);
  }, [currentPatch, styleBanks]);

  const currentBankLabel = useMemo(() => {
    const label = currentPatch?.identity.patchNumberLabel?.split("-")[0];
    if (label) return label;
    const fallback = state.bank?.split("-")[0];
    return fallback;
  }, [currentPatch, state.bank]);

  const remoteActivePedal = useMemo(() => {
    const patchNumberLabel = currentPatch?.identity.patchNumberLabel;
    if (!patchNumberLabel) return undefined;
    const match = patchNumberLabel.match(/-(\d+)$/);
    if (!match) return undefined;
    const ordinal = parseInt(match[1], 10);
    return ordinal >= 1 && ordinal <= 3 ? ordinal : undefined;
  }, [currentPatch]);

  const activePedal = remoteActivePedal ?? state.activePedal;

  const gotoStyleIndex = useCallback(
    (idx: number) => {
      const target = stylePatches[idx];
      if (!target) return;
      setSelectedPatch({
        bankSelectMSB: target.identity.bankMSB,
        pc: target.identity.pc,
      });
    },
    [stylePatches, setSelectedPatch]
  );

  const gotoNextPatch = useCallback(() => {
    if (stylePatches.length === 0) return;
    const next =
      currentStyleIndex >= 0
        ? (currentStyleIndex + 1) % stylePatches.length
        : 0;
    gotoStyleIndex(next);
  }, [stylePatches.length, currentStyleIndex, gotoStyleIndex]);

  const gotoPrevPatch = useCallback(() => {
    if (stylePatches.length === 0) return;
    const prev =
      currentStyleIndex >= 0
        ? (currentStyleIndex - 1 + stylePatches.length) % stylePatches.length
        : stylePatches.length - 1;
    gotoStyleIndex(prev);
  }, [stylePatches.length, currentStyleIndex, gotoStyleIndex]);

  const gotoBank = useCallback(
    (bankLabel: string) => {
      const target =
        stylePatches.find(
          (p) => p.identity.patchNumberLabel === `${bankLabel}-1`
        ) ||
        stylePatches.find((p) =>
          p.identity.patchNumberLabel.startsWith(`${bankLabel}-`)
        );
      if (target) {
        setSelectedPatch({
          bankSelectMSB: target.identity.bankMSB,
          pc: target.identity.pc,
        });
      }
    },
    [stylePatches, setSelectedPatch]
  );

  const gotoNextBank = useCallback(() => {
    if (styleBanks.length === 0) return;
    const nextIdx =
      currentBankIndex >= 0 ? (currentBankIndex + 1) % styleBanks.length : 0;
    gotoBank(styleBanks[nextIdx]);
  }, [styleBanks, currentBankIndex, gotoBank]);

  const gotoPrevBank = useCallback(() => {
    if (styleBanks.length === 0) return;
    const prevIdx =
      currentBankIndex >= 0
        ? (currentBankIndex - 1 + styleBanks.length) % styleBanks.length
        : styleBanks.length - 1;
    gotoBank(styleBanks[prevIdx]);
  }, [styleBanks, currentBankIndex, gotoBank]);

  // Select ordinal (1/2/3) within current UI bank for active style
  const selectOrdinalInCurrentBank = useCallback(
    (ordinal: 1 | 2 | 3) => {
      if (!currentBankLabel) return;
      const targetLabel = `${currentBankLabel}-${ordinal}`;
      const target = stylePatches.find(
        (p) => p.identity.patchNumberLabel === targetLabel
      );
      if (target) {
        setSelectedPatch({
          bankSelectMSB: target.identity.bankMSB,
          pc: target.identity.pc,
        });
      }
    },
    [currentBankLabel, stylePatches, setSelectedPatch]
  );

  const bankSlots = useMemo(() => {
    if (!currentBankLabel) return null;
    return ([1, 2, 3] as const).map((ordinal) => {
      const target = stylePatches.find(
        (p) => p.identity.patchNumberLabel === `${currentBankLabel}-${ordinal}`
      );
      const name =
        target?.data?.name ??
        (target?.status === "pending" ? "(loading…)" : undefined) ??
        "—";
      return { ordinal, name };
    });
  }, [currentBankLabel, stylePatches]);

  // Double-click detection per pedal (simple time-window approach)
  const pedal1Clicks = React.useRef<{ count: number; timeout?: any }>({
    count: 0,
  });
  const pedal2Clicks = React.useRef<{ count: number; timeout?: any }>({
    count: 0,
  });

  const selectStylePatch = useCallback(
    (styleId: GR55State["activeStyle"]) => {
      if (!patches || patches.length === 0) {
        actions.setActiveStyle(styleId);
        return;
      }
      const currentUiLabel = currentPatch?.identity.patchNumberLabel;
      let target = patches.find(
        (p) =>
          p.identity.styleLabel === styleId &&
          (currentUiLabel
            ? p.identity.patchNumberLabel === currentUiLabel
            : true)
      );
      if (!target) {
        target = patches.find((p) => p.identity.styleLabel === styleId);
      }
      if (target) {
        setSelectedPatch({
          bankSelectMSB: target.identity.bankMSB,
          pc: target.identity.pc,
        });
      } else {
        actions.setActiveStyle(styleId);
      }
    },
    [patches, currentPatch, actions, setSelectedPatch]
  );

  return (
    <View style={styles.container}>
      {/* Main Chassis */}
      <View style={styles.chassis}>
        {/* Top Edge Labels (Ports) */}
        <View style={styles.portLabels}>
          <Text style={styles.portLabel}>Connections : </Text>
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
                        active={ledActiveStyle === style.id}
                        onClick={() =>
                          selectStylePatch(style.id as GR55State["activeStyle"])
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
                        isActive={activePedal === 1}
                        topLabel={bankSlots?.[0]?.name}
                        onClick={() => {
                          actions.setActivePedal(1);
                          const ref = pedal1Clicks.current;
                          ref.count += 1;
                          if (ref.timeout) {
                            clearTimeout(ref.timeout);
                          }
                          ref.timeout = setTimeout(() => {
                            if (ref.count >= 2) {
                              gotoNextBank();
                            } else {
                              selectOrdinalInCurrentBank(1);
                            }
                            ref.count = 0;
                            ref.timeout = undefined;
                          }, 250);
                        }}
                        subLabel="BANK ▲"
                      />
                    </View>
                    <View style={styles.pedalColumn}>
                      <Pedal
                        label="2"
                        isActive={activePedal === 2}
                        topLabel={bankSlots?.[1]?.name}
                        onClick={() => {
                          actions.setActivePedal(2);
                          const ref = pedal2Clicks.current;
                          ref.count += 1;
                          if (ref.timeout) {
                            clearTimeout(ref.timeout);
                          }
                          ref.timeout = setTimeout(() => {
                            if (ref.count >= 2) {
                              gotoPrevBank();
                            } else {
                              selectOrdinalInCurrentBank(2);
                            }
                            ref.count = 0;
                            ref.timeout = undefined;
                          }, 250);
                        }}
                        subLabel="BANK ▼"
                      />
                    </View>
                    <View style={styles.pedalColumn}>
                      <Pedal
                        label="3"
                        isActive={activePedal === 3}
                        topLabel={bankSlots?.[2]?.name}
                        onClick={() => {
                          actions.setActivePedal(3);
                          selectOrdinalInCurrentBank(3);
                        }}
                        subLabel="PHRASE LOOP"
                      />
                    </View>
                    <View style={styles.pedalColumn}>
                      <Pedal
                        label="CTL"
                        isActive={ctlStatus}
                        topLabel={ctlFunction}
                        onClick={handleCtlPedalToggle}
                        subLabel="REC/PLAY/DUB"
                      />
                    </View>
                    {/* Audio Player next to CTL pedal */}
                    <View style={styles.audioPlayerColumn}>
                      <Text style={styles.audioPlayerLabel}>AUDIO PLAYER</Text>
                      <Button
                        label=""
                        variant="rect"
                        style={styles.audioPlayerButton}
                      />
                      <Text style={styles.usbMemoryLabel}>USB MEMORY</Text>

                      {/* Branding Logos */}
                      <View style={styles.branding}>
                        <View style={styles.grLogoContainer}>
                          <Text style={styles.grLogoG}>G</Text>
                          <Text style={styles.grLogoR}>R</Text>
                        </View>
                        <Text style={styles.cosmBadge}>COSM</Text>
                      </View>
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
              </View>
            </View>
          </View>
        </View>

        {/* Right Expression Pedal Section */}
        <View style={styles.rightSection}>
          <ExpressionPedal
            expSwStatus={expSwStatus}
            expSwFunction={expSwFunction}
            onExpSwToggle={handleExpSwToggle}
            patchLevel={patchLevel}
            onPatchLevelChange={setPatchLevel}
          />
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
  audioPlayerColumn: {
    alignItems: "center",
    gap: 8,
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
    marginTop: 40,
    alignItems: "center",
    opacity: 0.8,
  },
  grLogoContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 65,
  },
  grLogoG: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontSize: 57,
    fontWeight: "900",
    color: "#ff8c00", // Orange
    letterSpacing: -1.3,
    marginBottom: 16,
  },
  grLogoR: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontSize: 57,
    fontWeight: "900",
    color: "#ff8c00", // Orange
    letterSpacing: -2.6,
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
