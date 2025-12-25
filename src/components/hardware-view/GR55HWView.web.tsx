/**
 * Web-specific implementation of GR55 Hardware View
 * This component provides the full interactive GR55 interface with web-specific libraries
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { GR55HWViewProps } from "./GR55HWView.types";
import { GR55Controller } from "./components/GR55Controller";

export function GR55HWView({ initialState, onStateChange }: GR55HWViewProps) {
  console.log("GR55HWView.web.tsx: Loading full GR55Controller...");

  return (
    <View style={styles.container}>
      {/* Use the full GR55Controller for web platform */}
      <GR55Controller
        initialState={initialState}
        onStateChange={onStateChange}
      />

      {/* Footer with platform info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Roland GR-55 Interactive Demo - Web Platform
        </Text>
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
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    marginLeft: -150, // Half of approximate width
    width: 300,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    color: "#71717a", // zinc-500
    fontSize: 14,
    textAlign: "center",
  },
});
