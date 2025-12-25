/**
 * Native-specific implementation of GR55 Hardware View
 * This component provides a simplified interface for native platforms
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";

import { GR55HWViewProps, GR55State } from "./GR55HWView.types";
import { NativeFallback } from "./components/NativeFallback";

export function GR55HWView({ initialState, onStateChange }: GR55HWViewProps) {
  const [state, setState] = useState<GR55State>({
    activePedal: 1,
    patchName: "LEAD GUITAR",
    activeStyle: "LEAD",
    bank: "01-1",
    ...initialState,
  });

  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Validate that we're running on a supported native platform
    try {
      if (Platform.OS === "web") {
        console.warn(
          "Native component loaded on web platform - this should not happen"
        );
        setInitError("Platform mismatch detected");
      }

      // Check for required React Native APIs
      if (!TouchableOpacity || !View || !Text) {
        throw new Error("Required React Native components not available");
      }
    } catch (error) {
      console.error("Native component initialization error:", error);
      setInitError("Failed to initialize native interface");
    }
  }, []);

  const handleStateChange = (newState: Partial<GR55State>) => {
    try {
      const updatedState = { ...state, ...newState };
      setState(updatedState);
      onStateChange?.(updatedState);
    } catch (error) {
      console.error("State change error:", error);
      setInitError("State update failed");
    }
  };

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Hardware View Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
        <Text style={styles.errorSubtext}>
          Please try restarting the application or use the web version for full
          functionality.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Roland GR-55 Hardware View</Text>
      <Text style={styles.subtitle}>
        Full interactive hardware view available on web platform
      </Text>

      {/* Platform indicator */}
      <View style={styles.platformIndicator}>
        <Text style={styles.platformText}>
          Platform: {Platform.OS} | Version: {Platform.Version}
        </Text>
      </View>

      {/* Hardware representation placeholder */}
      <View style={styles.hardwareContainer}>
        <View style={styles.hardwarePlaceholder}>
          <Text style={styles.hardwarePlaceholderText}>
            GR-55 Hardware Interface
          </Text>
          <Text style={styles.hardwarePlaceholderSubtext}>
            Interactive version available on web
          </Text>
        </View>
      </View>

      {/* Current state display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <Text style={styles.statusText}>
          Patch: {state.bank} - {state.patchName}
        </Text>
        <Text style={styles.statusText}>Active Pedal: {state.activePedal}</Text>
      </View>

      {/* Basic controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.controlsTitle}>Style Selection</Text>
        <View style={styles.styleButtons}>
          {(["LEAD", "RHYTHM", "OTHER", "USER"] as const).map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.styleButton,
                state.activeStyle === style && styles.activeStyleButton,
              ]}
              onPress={() => handleStateChange({ activeStyle: style })}
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

      {/* Pedal controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.controlsTitle}>Pedal Selection</Text>
        <View style={styles.pedalButtons}>
          {[1, 2, 3, 4].map((pedal) => (
            <TouchableOpacity
              key={pedal}
              style={[
                styles.pedalButton,
                state.activePedal === pedal && styles.activePedalButton,
              ]}
              onPress={() => handleStateChange({ activePedal: pedal })}
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

      {/* Feature notice */}
      <View style={styles.noticeContainer}>
        <Text style={styles.noticeText}>
          💡 For the full interactive GR-55 hardware experience with animations
          and advanced controls, please use the web version of this application.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#1a1a1a",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1a1a1a",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
    marginBottom: 20,
  },
  platformIndicator: {
    backgroundColor: "#2a2a2a",
    padding: 8,
    borderRadius: 6,
    marginBottom: 20,
    alignItems: "center",
  },
  platformText: {
    color: "#cccccc",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  hardwareContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  hardwarePlaceholder: {
    width: 300,
    height: 200,
    backgroundColor: "#333333",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#555555",
  },
  hardwarePlaceholderText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  hardwarePlaceholderSubtext: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
  },
  statusContainer: {
    backgroundColor: "#2a2a2a",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: "#cccccc",
    marginBottom: 5,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  styleButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  styleButton: {
    backgroundColor: "#444444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
  },
  activeStyleButton: {
    backgroundColor: "#0066cc",
  },
  styleButtonText: {
    color: "#cccccc",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  activeStyleButtonText: {
    color: "#ffffff",
  },
  pedalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  pedalButton: {
    backgroundColor: "#444444",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  activePedalButton: {
    backgroundColor: "#cc6600",
  },
  pedalButtonText: {
    color: "#cccccc",
    fontSize: 16,
    fontWeight: "bold",
  },
  activePedalButtonText: {
    color: "#ffffff",
  },
  noticeContainer: {
    backgroundColor: "#2a2a2a",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0066cc",
  },
  noticeText: {
    color: "#cccccc",
    fontSize: 14,
    lineHeight: 20,
  },
});
