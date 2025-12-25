/**
 * Native fallback UI components for GR55 Hardware View
 * Provides React Native compatible components for native platforms
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";

import { GR55State } from "../GR55HWView.types";

interface NativeFallbackProps {
  state: GR55State;
  onStateChange: (newState: Partial<GR55State>) => void;
}

export function NativeFallback({ state, onStateChange }: NativeFallbackProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Roland GR-55</Text>
        <Text style={styles.subtitle}>Guitar Synthesizer</Text>
      </View>

      {/* Hardware Image */}
      <View style={styles.hardwareContainer}>
        <Image
          source={require("../../../../assets/gr55-pixel-masked.png")}
          style={styles.hardwareImage}
          resizeMode="contain"
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.overlayText}>Interactive View</Text>
          <Text style={styles.overlaySubtext}>Available on Web</Text>
        </View>
      </View>

      {/* Current Status Display */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Patch:</Text>
          <Text style={styles.statusValue}>
            {state.bank} - {state.patchName}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Style:</Text>
          <Text style={styles.statusValue}>{state.activeStyle}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Pedal:</Text>
          <Text style={styles.statusValue}>{state.activePedal}</Text>
        </View>
      </View>

      {/* Style Selection Controls */}
      <View style={styles.controlSection}>
        <Text style={styles.sectionTitle}>Style Selection</Text>
        <View style={styles.buttonGrid}>
          {(["LEAD", "RHYTHM", "OTHER", "USER"] as const).map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.styleButton,
                state.activeStyle === style && styles.activeStyleButton,
              ]}
              onPress={() => onStateChange({ activeStyle: style })}
              accessible
              accessibilityLabel={`Select ${style} style`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.styleButtonText,
                  state.activeStyle === style && styles.activeStyleButtonText,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pedal Selection Controls */}
      <View style={styles.controlSection}>
        <Text style={styles.sectionTitle}>Pedal Selection</Text>
        <View style={styles.pedalGrid}>
          {[1, 2, 3, 4].map((pedal) => (
            <TouchableOpacity
              key={pedal}
              style={[
                styles.pedalButton,
                state.activePedal === pedal && styles.activePedalButton,
              ]}
              onPress={() => onStateChange({ activePedal: pedal })}
              accessible
              accessibilityLabel={`Select pedal ${pedal}`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.pedalButtonText,
                  state.activePedal === pedal && styles.activePedalButtonText,
                ]}
              >
                {pedal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Platform Info */}
      <View style={styles.platformInfo}>
        <Text style={styles.platformText}>
          Platform: {Platform.OS} {Platform.Version}
        </Text>
        <Text style={styles.platformNote}>
          💡 Full interactive experience available on web platform
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
    marginTop: 4,
  },
  hardwareContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  hardwareImage: {
    width: 320,
    height: 200,
    opacity: 0.8,
  },
  imageOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -60 }, { translateY: -20 }],
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  overlayText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  overlaySubtext: {
    color: "#cccccc",
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: "#cccccc",
    fontWeight: "600",
  },
  statusValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  controlSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  styleButton: {
    backgroundColor: "#444444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeStyleButton: {
    backgroundColor: "#0066cc",
    borderColor: "#0088ff",
  },
  styleButtonText: {
    color: "#cccccc",
    fontSize: 14,
    fontWeight: "600",
  },
  activeStyleButtonText: {
    color: "#ffffff",
  },
  pedalGrid: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  pedalButton: {
    backgroundColor: "#444444",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  activePedalButton: {
    backgroundColor: "#cc6600",
    borderColor: "#ff8800",
  },
  pedalButtonText: {
    color: "#cccccc",
    fontSize: 18,
    fontWeight: "bold",
  },
  activePedalButtonText: {
    color: "#ffffff",
  },
  platformInfo: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#0066cc",
  },
  platformText: {
    color: "#cccccc",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 4,
  },
  platformNote: {
    color: "#cccccc",
    fontSize: 14,
    textAlign: "center",
  },
});
