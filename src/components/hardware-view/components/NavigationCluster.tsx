import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { Button } from "./Buttons";
import { DataWheel } from "./DataWheel";
import {
  hardwareColors,
  hardwareShadow,
  hardwareSpacing,
} from "../utils/hardwareViewTokens";

interface NavigationClusterProps {
  gkS1Function?: any;
  gkS2Function?: any;
  gkVolFunction?: any;
  onDataWheelRotate: (direction: "left" | "right") => void;
  onDataWheelPress: (direction: "up" | "down" | "left" | "right") => void;
}

export function NavigationCluster({
  gkS1Function,
  gkS2Function,
  gkVolFunction,
  onDataWheelRotate,
  onDataWheelPress,
}: NavigationClusterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.outputLevel}>
        <Text style={styles.outputLevelLabel}>Output Level</Text>
        <View style={styles.outputLevelKnob}>
          <View style={styles.outputLevelIndicator} />
        </View>
      </View>

      <DataWheel onRotate={onDataWheelRotate} onPress={onDataWheelPress} />

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

      <View style={styles.gkRow}>
        <View style={styles.gkControl}>
          <Text style={styles.gkValue}>{gkS1Function ?? "—"}</Text>
          <Button label="" variant="rect" style={styles.gkButton} />
          <Text style={styles.gkLabel}>GK S1</Text>
        </View>
        <View style={styles.gkControl}>
          <Text style={styles.gkValue}>{gkS2Function ?? "—"}</Text>
          <Button label="" variant="rect" style={styles.gkButton} />
          <Text style={styles.gkLabel}>GK S2</Text>
        </View>
        <View style={styles.gkControl}>
          <Text style={styles.gkValue}>{gkVolFunction ?? "—"}</Text>
          <View style={styles.gkKnob}>
            <View style={styles.gkKnobIndicator} />
          </View>
          <Text style={styles.gkLabel}>GK VOL</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: hardwareSpacing.lg,
    paddingTop: hardwareSpacing.sm,
  },
  outputLevel: {
    alignItems: "center",
    gap: hardwareSpacing.xs,
    width: "100%",
  },
  outputLevelLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: hardwareColors.textMuted,
    textTransform: "uppercase",
  },
  outputLevelKnob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: hardwareColors.inset,
    borderWidth: 2,
    borderColor: hardwareColors.border,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
      : (hardwareShadow?.knob as object)),
  },
  outputLevelIndicator: {
    width: 4,
    height: 16,
    backgroundColor: hardwareColors.white,
    borderRadius: 2,
    position: "absolute",
    top: 4,
  },
  navButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hardwareSpacing.md,
    width: "100%",
    paddingHorizontal: hardwareSpacing.sm,
    justifyContent: "space-between",
  },
  navButtonGroup: {
    alignItems: "center",
    gap: hardwareSpacing.xs,
  },
  navButtonLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: hardwareColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  gkRow: {
    flexDirection: "row",
    gap: hardwareSpacing.md,
    width: "100%",
    paddingHorizontal: hardwareSpacing.sm,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: -15,
  },
  gkControl: {
    alignItems: "center",
    gap: 6,
  },
  gkValue: {
    fontSize: 12,
    fontWeight: "700",
    color: hardwareColors.accent,
    textTransform: "uppercase",
  },
  gkLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: hardwareColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  gkButton: {
    width: 48,
    height: 32,
  },
  gkKnob: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: hardwareColors.inset,
    borderWidth: 2,
    borderColor: hardwareColors.border,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
    ...(Platform.OS === "web"
      ? {}
      : typeof hardwareShadow?.knobSmall === "object"
      ? hardwareShadow.knobSmall
      : {}),
  },
  gkKnobIndicator: {
    width: 3,
    height: 12,
    backgroundColor: hardwareColors.white,
    borderRadius: 2,
    position: "absolute",
    top: 4,
  },
});
