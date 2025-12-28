/**
 * GR55Controller - Main Component
 *
 * Layout orchestration for the GR-55 hardware view. Logic is encapsulated in
 * the useGR55ControllerState hook and UI is composed from local presentational
 * subcomponents to ease future SwiftUI migration.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

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

interface GR55ControllerProps {
  initialState?: Partial<GR55State>;
  onStateChange?: (state: GR55State) => void;
}

export function GR55Controller({
  initialState,
  onStateChange,
}: GR55ControllerProps) {
  const [hoveredItem, setHoveredItem] = useState<HoveredItem>(null);

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

  return (
    <View style={styles.container}>
      <View style={styles.chassis}>
        <PortsBar guitarOutSource={guitarOutSource} />

        <View style={styles.leftSection}>
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

        <View style={styles.rightSection}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: hardwareColors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: Platform.OS === "web" ? hardwareSpacing.xl : hardwareSpacing.md,
    ...(Platform.OS === "web" && {
      minHeight: "100vh" as any,
      width: "100vw" as any,
    }),
  },
  chassis: {
    position: "relative",
    backgroundColor: hardwareColors.chassis,
    padding: hardwareSpacing.xs,
    borderRadius: hardwareRadii.lg,
    borderWidth: 4,
    borderColor: "#353940",
    minWidth: Platform.OS === "web" ? 1000 : 350,
    maxWidth: Platform.OS === "web" ? 1200 : 400,
    flexDirection: "row",
    overflow: Platform.select({
      web: "visible",
      default: "hidden",
    }) as any,
    ...Platform.select({
      web: {
        boxShadow: hardwareShadow?.web?.chassis,
      },
      default: {
        ...(hardwareShadow?.default?.chassis as object),
      },
    }),
  },
  leftSection: {
    flex: 1,
    flexDirection: "column",
    borderRightWidth: 2,
    borderRightColor: hardwareColors.borderMuted,
    backgroundColor: hardwareColors.surface,
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
    position: "relative",
    zIndex: 10,
  },
  leftColumn: {
    flex: 3,
    gap: hardwareSpacing.md,
    position: "relative",
    zIndex: 20,
  },
  rightColumn: {
    flex: 1,
    alignItems: "center",
  },
  rightSection: {
    width: 128,
    backgroundColor: hardwareColors.surface,
    borderLeftWidth: 2,
    borderLeftColor: hardwareColors.borderMuted,
    padding: hardwareSpacing.sm,
    paddingLeft: 0,
    position: "relative",
    zIndex: 1,
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
});

export default GR55Controller;
