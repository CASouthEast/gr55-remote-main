import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import {
  MockPatchMainScreen,
  MockPatchToneScreen,
  MockPatchEffectsScreen,
  MockPatchPedalGKScreen,
  MockPatchAssignsScreen,
  MockPatchOtherScreen,
} from "./MockPatchScreens";

const tabs = [
  { key: "Main", title: "Main", component: MockPatchMainScreen },
  { key: "Tone", title: "Tone", component: MockPatchToneScreen },
  { key: "Effects", title: "Effects", component: MockPatchEffectsScreen },
  { key: "PedalGK", title: "Pedal/GK", component: MockPatchPedalGKScreen },
  { key: "Assigns", title: "Assigns", component: MockPatchAssignsScreen },
  { key: "Other", title: "Other", component: MockPatchOtherScreen },
];

export function PatchSectionWithTopNavigation(): JSX.Element {
  const [activeTab, setActiveTab] = useState("Main");

  const ActiveComponent =
    tabs.find((tab) => tab.key === activeTab)?.component || MockPatchMainScreen;

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Tab Indicator */}
      <View style={styles.indicator} />

      {/* Screen Content */}
      <View style={styles.content}>
        <ActiveComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    height: 50,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  activeTab: {
    backgroundColor: "#f0f0f0",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  indicator: {
    height: 3,
    backgroundColor: "#007AFF",
    width: "100%",
  },
  content: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
