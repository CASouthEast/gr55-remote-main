import React from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";

import { RolandRemotePatchContext as PATCH } from "../../../contexts/RolandRemotePageContext";
import { useRemoteField } from "../../../hooks/useRemoteField";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../../lib/roland-gr55/RolandGR55AddressMap";

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
  // Live tone switches so the top bar mirrors the active sources on the current patch
  const [pcm1Muted] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.patchPCMTone1.muteSwitch
  );
  const [pcm2Muted] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.patchPCMTone2.muteSwitch
  );
  const [modelMuted] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.modelingTone.muteSwitch
  );
  const [normalPuMuted] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.normalPuMute
  );

  const renderStatusChip = (
    label: string,
    isMuted: boolean,
    isGuitar?: boolean
  ) => (
    <Pressable
      onPress={() => {}}
      style={({ pressed }) => [
        styles.statusChip,
        pressed && styles.statusChipPressed,
        isMuted ? styles.statusChipInactive : styles.statusChipActive,
        isGuitar && styles.statusChipGuitar,
      ]}
    >
      <Text
        style={({ pressed }) =>
          pressed
            ? styles.statusChipTextPressed
            : isMuted
            ? [styles.statusText, styles.statusTextInactive]
            : styles.statusText
        }
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Inner Bezel Shadow */}
      <View style={styles.innerBezel} />

      {/* LCD Screen Content */}
      <View style={styles.screenContent}>
        {/* Top Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            {renderStatusChip("GUITAR", normalPuMuted, true)}
            {renderStatusChip("PCM1", pcm1Muted)}
            {renderStatusChip("PCM2", pcm2Muted)}
            {renderStatusChip("MODEL", modelMuted)}
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
  statusText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  statusTextInactive: {
    color: "rgba(30, 58, 138, 0.5)", // blue-900/50
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusChipActive: {
    backgroundColor: "#bfdbfe", // blue-200
  },
  statusChipGuitar: {
    paddingHorizontal: 10,
  },
  statusChipInactive: {
    opacity: 0.6,
  },
  statusChipPressed: {
    backgroundColor: "#1e3a8a", // blue-900
  },
  statusChipTextPressed: {
    fontWeight: "700",
    fontSize: 14,
    color: "#ffffff",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
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
