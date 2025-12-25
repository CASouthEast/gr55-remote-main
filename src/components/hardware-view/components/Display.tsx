import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

interface DisplayProps {
  patchName: string;
  bank: string;
  mode: string;
  style?: any;
}

/**
 * LCD Display component that replicates the Roland GR-55 screen
 * Maintains the visual design and layout from GR55HWDesign.png
 * Adapted for React Native compatibility
 */
export function Display({ patchName, bank, mode, style }: DisplayProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Inner Bezel Shadow */}
      <View style={styles.innerBezel} />

      {/* LCD Screen Content */}
      <View style={styles.screenContent}>
        {/* Top Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            <View style={styles.guitarBadge}>
              <Text style={styles.guitarBadgeText}>GUITAR</Text>
            </View>
            <Text style={styles.statusText}>PCM1</Text>
            <Text style={[styles.statusText, styles.statusTextInactive]}>
              PCM2
            </Text>
            <Text style={[styles.statusText, styles.statusTextInactive]}>
              MODEL
            </Text>
          </View>
          <Text style={styles.bpmText}>BPM: 120</Text>
        </View>

        {/* Main Patch Info */}
        <View style={styles.mainInfo}>
          <Text style={styles.bankText}>{bank}</Text>
          <View style={styles.patchInfo}>
            <Text style={styles.modeText}>{mode}</Text>
            <Text style={styles.patchNameText} numberOfLines={1}>
              {patchName}
            </Text>
          </View>
        </View>

        {/* Bottom Parameters */}
        <View style={styles.parameters}>
          <View style={[styles.parameterButton, styles.parameterButtonActive]}>
            <Text style={styles.parameterText}>MFX</Text>
          </View>
          <View
            style={[styles.parameterButton, styles.parameterButtonInactive]}
          >
            <Text style={[styles.parameterText, styles.parameterTextInactive]}>
              AMP
            </Text>
          </View>
          <View
            style={[styles.parameterButton, styles.parameterButtonInactive]}
          >
            <Text style={[styles.parameterText, styles.parameterTextInactive]}>
              MOD
            </Text>
          </View>
          <View style={[styles.parameterButton, styles.parameterButtonActive]}>
            <Text style={styles.parameterText}>DLY</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e0e7ff", // indigo-100
    borderWidth: 12,
    borderColor: "#27272a", // zinc-800
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
      default: {
        // React Native doesn't support inset shadows
        backgroundColor: "#c7d2fe", // Slightly darker for inset effect
      },
    }),
  },
  innerBezel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: "none",
    ...Platform.select({
      web: {
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.5)",
      },
      default: {
        // Visual approximation for React Native
        borderWidth: 2,
        borderColor: "rgba(0, 0, 0, 0.2)",
      },
    }),
  },
  screenContent: {
    height: "100%",
    width: "100%",
    padding: 24,
    justifyContent: "space-between",
    backgroundColor: "#dbeafe", // blue-100
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(30, 58, 138, 0.2)", // blue-900/20
    paddingBottom: 8,
  },
  statusLeft: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  guitarBadge: {
    backgroundColor: "#1e3a8a", // blue-900
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  guitarBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  statusText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  statusTextInactive: {
    color: "rgba(30, 58, 138, 0.5)", // blue-900/50
  },
  bpmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 16,
  },
  bankText: {
    fontSize: 60,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 60,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  patchInfo: {
    paddingBottom: 8,
    flex: 1,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    opacity: 0.6,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  patchNameText: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    maxWidth: 300,
  },
  parameters: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "rgba(30, 58, 138, 0.2)", // blue-900/20
  },
  parameterButton: {
    flex: 1,
    padding: 4,
    alignItems: "center",
    borderRadius: 4,
  },
  parameterButtonActive: {
    backgroundColor: "#bfdbfe", // blue-200
  },
  parameterButtonInactive: {
    backgroundColor: "#e0e7ff", // blue-100
  },
  parameterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  parameterTextInactive: {
    color: "rgba(30, 58, 138, 0.3)", // blue-900/30
  },
});
