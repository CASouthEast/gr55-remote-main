import type { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { PatchEffectsAmpScreen } from "../../screens/PatchEffects/PatchEffectsAmpScreen";
import { PatchEffectsChorusScreen } from "../../screens/PatchEffects/PatchEffectsChorusScreen";
import { PatchEffectsDelayScreen } from "../../screens/PatchEffects/PatchEffectsDelayScreen";
import { PatchEffectsEQScreen } from "../../screens/PatchEffects/PatchEffectsEQScreen";
import { PatchEffectsMFXScreen } from "../../screens/PatchEffects/PatchEffectsMFXScreen";
import { PatchEffectsModScreen } from "../../screens/PatchEffects/PatchEffectsModScreen";
import { PatchEffectsReverbScreen } from "../../screens/PatchEffects/PatchEffectsReverbScreen";
import { PatchEffectsStructureScreen } from "../../screens/PatchEffects/PatchEffectsStructureScreen";
import { PatchEffectsTabParamList } from "../navigation";

// Wrapper components to provide navigation props with proper route structure
function PatchEffectsStructureWrapper() {
  return <PatchEffectsStructureScreen />;
}

function PatchEffectsAmpWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchEffectsTabParamList, "Amp"> =
    {
      navigation: navigation as any,
      route: {
        key: "Amp-" + Date.now(),
        name: "Amp",
        params: {},
        path: undefined,
      },
    };

  return <PatchEffectsAmpScreen {...mockProps} />;
}

function PatchEffectsModWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchEffectsTabParamList, "Mod"> =
    {
      navigation: navigation as any,
      route: {
        key: "Mod-" + Date.now(),
        name: "Mod",
        params: {},
        path: undefined,
      },
    };

  return <PatchEffectsModScreen {...mockProps} />;
}

function PatchEffectsMFXWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchEffectsTabParamList, "MFX"> =
    {
      navigation: navigation as any,
      route: {
        key: "MFX-" + Date.now(),
        name: "MFX",
        params: {},
        path: undefined,
      },
    };

  return <PatchEffectsMFXScreen {...mockProps} />;
}

function PatchEffectsDelayWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchEffectsTabParamList, "DLY"> =
    {
      navigation: navigation as any,
      route: {
        key: "DLY-" + Date.now(),
        name: "DLY",
        params: {},
        path: undefined,
      },
    };

  return <PatchEffectsDelayScreen {...mockProps} />;
}

function PatchEffectsReverbWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchEffectsTabParamList, "REV"> =
    {
      navigation: navigation as any,
      route: {
        key: "REV-" + Date.now(),
        name: "REV",
        params: {},
        path: undefined,
      },
    };

  return <PatchEffectsReverbScreen {...mockProps} />;
}

function PatchEffectsChorusWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchEffectsTabParamList, "CHO"> =
    {
      navigation: navigation as any,
      route: {
        key: "CHO-" + Date.now(),
        name: "CHO",
        params: {},
        path: undefined,
      },
    };

  return <PatchEffectsChorusScreen {...mockProps} />;
}

function PatchEffectsEQWrapper() {
  const navigation = useNavigation();

  const mockProps: MaterialTopTabScreenProps<PatchEffectsTabParamList, "EQ"> = {
    navigation: navigation as any,
    route: {
      key: "EQ-" + Date.now(),
      name: "EQ",
      params: {},
      path: undefined,
    },
  };

  return <PatchEffectsEQScreen {...mockProps} />;
}

const tabs: {
  key: keyof PatchEffectsTabParamList;
  title: string;
  component: React.ComponentType<any>;
}[] = [
  { key: "Struct", title: "STRUCT", component: PatchEffectsStructureWrapper },
  { key: "Amp", title: "Amp", component: PatchEffectsAmpWrapper },
  { key: "Mod", title: "Mod", component: PatchEffectsModWrapper },
  { key: "MFX", title: "MFX", component: PatchEffectsMFXWrapper },
  { key: "DLY", title: "DLY", component: PatchEffectsDelayWrapper },
  { key: "REV", title: "REV", component: PatchEffectsReverbWrapper },
  { key: "CHO", title: "CHO", component: PatchEffectsChorusWrapper },
  { key: "EQ", title: "EQ", component: PatchEffectsEQWrapper },
];

export function PatchEffectsCustomNavigation(): JSX.Element {
  const [activeTab, setActiveTab] =
    useState<keyof PatchEffectsTabParamList>("Struct");

  const ActiveComponent =
    tabs.find((tab) => tab.key === activeTab)?.component ||
    PatchEffectsStructureWrapper;

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
