/**
 * Platform-specific GR55HWView component
 * React Native will automatically resolve to .web.tsx or .native.tsx based on platform
 */

// This file should be automatically resolved by React Native's Metro bundler
// to either GR55HWView.web.tsx or GR55HWView.native.tsx

// For now, let's provide a fallback implementation
import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { GR55HWViewProps } from "./GR55HWView.types";

export function GR55HWView(props: GR55HWViewProps) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackText}>
        GR55HWView - Platform resolution fallback
      </Text>
      <Text style={styles.fallbackSubtext}>
        This should not be visible if platform resolution is working correctly
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  fallbackText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  fallbackSubtext: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
  },
});
