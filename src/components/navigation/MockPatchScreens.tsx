import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mock screen components for POC testing
// These will be replaced with actual production screens in later tasks

export function MockPatchMainScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is Main Screen</Text>
    </View>
  );
}

export function MockPatchToneScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is Tone Screen</Text>
    </View>
  );
}

export function MockPatchEffectsScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is Effects Screen</Text>
    </View>
  );
}

export function MockPatchPedalGKScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is Pedal/GK Screen</Text>
    </View>
  );
}

export function MockPatchAssignsScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is Assigns Screen</Text>
    </View>
  );
}

export function MockPatchOtherScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is Other Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
