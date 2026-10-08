import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";

import { hardwareColors, hardwareSpacing } from "../utils/hardwareViewTokens";

interface PortsBarProps {
  guitarOutSource?: string | null;
  style?: ViewStyle;
}

export function PortsBar({ guitarOutSource, style }: PortsBarProps) {
  return (
    <View style={[styles.portLabels, style]}>
      <Text style={styles.portLabel}>Connections : </Text>
      <View style={styles.portLabelsRight}>
        <Text style={styles.portLabel}>DC IN</Text>
        <Text style={styles.portLabel}>POWER</Text>
        <Text style={styles.portLabel}>USB COMPUTER</Text>
        <Text style={styles.portLabel}>MIDI IN/OUT</Text>
        <Text style={styles.portLabel}>PHONES</Text>
        <Text style={styles.portLabel}>L/MONO OUTPUT R</Text>
        <View style={styles.portLabelGroup}>
          <Text style={styles.portLabelAccent}>{guitarOutSource ?? "—"}</Text>
          <Text style={styles.portLabel}>GUITAR OUT</Text>
        </View>
        <Text style={styles.portLabel}>GK IN</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: hardwareSpacing.xl,
  },
  portLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: hardwareColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  portLabelGroup: {
    position: "relative",
    alignItems: "center",
  },
  portLabelAccent: {
    fontSize: 10,
    fontWeight: "700",
    color: hardwareColors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    position: "absolute",
    top: -12,
  },
});
