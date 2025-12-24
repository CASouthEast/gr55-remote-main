import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { PatchAssignsScreen } from "../../screens/PatchAssignsScreen";
import { PatchEffectsScreen } from "../../screens/PatchEffects/PatchEffectsScreen";
import { PatchMainScreen } from "../../screens/PatchMainScreen";
import { PatchMasterOtherScreen } from "../../screens/PatchMasterOtherScreen";
import { PatchMasterPedalGkCtlScreen } from "../../screens/PatchMasterPedalGkCtlScreen";
import { PatchToneScreen } from "../../screens/PatchTone/PatchToneScreen";
import { PatchTabParamList, PatchStackParamList } from "../navigation";

// Wrapper components to provide navigation props with proper route structure
function PatchMainWrapper() {
  const navigation = useNavigation();
  const parentRoute = useRoute();

  const mockProps: NativeStackScreenProps<PatchStackParamList, "PatchMain"> = {
    navigation: navigation as any,
    route: {
      key: "PatchMain-" + Date.now(),
      name: "PatchMain",
      params: {},
      path: undefined,
    },
  };

  return <PatchMainScreen {...mockProps} />;
}

function PatchToneWrapper() {
  const navigation = useNavigation();
  const parentRoute = useRoute();

  const mockProps: NativeStackScreenProps<PatchStackParamList, "PatchTone"> = {
    navigation: navigation as any,
    route: {
      key: "PatchTone-" + Date.now(),
      name: "PatchTone",
      params: {},
      path: undefined,
    },
  };

  return <PatchToneScreen {...mockProps} />;
}

function PatchEffectsWrapper() {
  const navigation = useNavigation();
  const parentRoute = useRoute();

  const mockProps: NativeStackScreenProps<PatchStackParamList, "PatchEffects"> =
    {
      navigation: navigation as any,
      route: {
        key: "PatchEffects-" + Date.now(),
        name: "PatchEffects",
        params: {},
        path: undefined,
      },
    };

  return <PatchEffectsScreen {...mockProps} />;
}

function PatchMasterPedalGkCtlWrapper() {
  const navigation = useNavigation();
  const parentRoute = useRoute();

  const mockProps: NativeStackScreenProps<
    PatchStackParamList,
    "PatchMasterPedalGkCtl"
  > = {
    navigation: navigation as any,
    route: {
      key: "PatchMasterPedalGkCtl-" + Date.now(),
      name: "PatchMasterPedalGkCtl",
      params: {},
      path: undefined,
    },
  };

  return <PatchMasterPedalGkCtlScreen {...mockProps} />;
}

function PatchAssignsWrapper() {
  const navigation = useNavigation();
  const parentRoute = useRoute();

  const mockProps: NativeStackScreenProps<PatchStackParamList, "PatchAssigns"> =
    {
      navigation: navigation as any,
      route: {
        key: "PatchAssigns-" + Date.now(),
        name: "PatchAssigns",
        params: {},
        path: undefined,
      },
    };

  return <PatchAssignsScreen {...mockProps} />;
}

function PatchMasterOtherWrapper() {
  const navigation = useNavigation();
  const parentRoute = useRoute();

  const mockProps: NativeStackScreenProps<
    PatchStackParamList,
    "PatchMasterOther"
  > = {
    navigation: navigation as any,
    route: {
      key: "PatchMasterOther-" + Date.now(),
      name: "PatchMasterOther",
      params: {},
      path: undefined,
    },
  };

  return <PatchMasterOtherScreen {...mockProps} />;
}

const tabs: {
  key: keyof PatchTabParamList;
  title: string;
  component: React.ComponentType<any>;
}[] = [
  { key: "Main", title: "Main", component: PatchMainWrapper },
  { key: "Tone", title: "Tone", component: PatchToneWrapper },
  { key: "Effects", title: "Effects", component: PatchEffectsWrapper },
  {
    key: "PedalGK",
    title: "Pedal/GK",
    component: PatchMasterPedalGkCtlWrapper,
  },
  { key: "Assigns", title: "Assigns", component: PatchAssignsWrapper },
  { key: "Other", title: "Other", component: PatchMasterOtherWrapper },
];

export function PatchSectionWithTopNavigation(): JSX.Element {
  const [activeTab, setActiveTab] = useState<keyof PatchTabParamList>("Main");

  const ActiveComponent =
    tabs.find((tab) => tab.key === activeTab)?.component || PatchMainWrapper;

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
