import type { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { PatchToneModelingScreen } from "../../screens/PatchTone/PatchToneModelingScreen";
import { PatchToneNormalScreen } from "../../screens/PatchTone/PatchToneNormalScreen";
import { PatchTonePCMScreen } from "../../screens/PatchTone/PatchTonePCMScreen";
import { PatchToneTabParamList } from "../navigation";

// Wrapper components to provide navigation props with proper route structure
function PatchToneNormalWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchToneTabParamList, "Normal"> =
    {
      navigation: navigation as any,
      route: {
        key: "Normal-" + Date.now(),
        name: "Normal",
        params: {},
        path: undefined,
      },
    };

  return <PatchToneNormalScreen {...mockProps} />;
}

function PatchTonePCM1Wrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchToneTabParamList, "PCM1"> = {
    navigation: navigation as any,
    route: {
      key: "PCM1-" + Date.now(),
      name: "PCM1",
      params: {},
      path: undefined,
    },
  };

  return <PatchTonePCMScreen {...mockProps} />;
}

function PatchTonePCM2Wrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchToneTabParamList, "PCM2"> = {
    navigation: navigation as any,
    route: {
      key: "PCM2-" + Date.now(),
      name: "PCM2",
      params: {},
      path: undefined,
    },
  };

  return <PatchTonePCMScreen {...mockProps} />;
}

function PatchToneModelingWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<
    PatchToneTabParamList,
    "Modeling"
  > = {
    navigation: navigation as any,
    route: {
      key: "Modeling-" + Date.now(),
      name: "Modeling",
      params: {},
      path: undefined,
    },
  };

  return <PatchToneModelingScreen {...mockProps} />;
}

const tabs: {
  key: keyof PatchToneTabParamList;
  title: string;
  component: React.ComponentType<any>;
}[] = [
  { key: "Normal", title: "Normal", component: PatchToneNormalWrapper },
  { key: "PCM1", title: "PCM1", component: PatchTonePCM1Wrapper },
  { key: "PCM2", title: "PCM2", component: PatchTonePCM2Wrapper },
  { key: "Modeling", title: "Model", component: PatchToneModelingWrapper },
];

export function PatchToneCustomNavigation(): JSX.Element {
  const [activeTab, setActiveTab] =
    useState<keyof PatchToneTabParamList>("Normal");

  const ActiveComponent =
    tabs.find((tab) => tab.key === activeTab)?.component ||
    PatchToneNormalWrapper;

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
