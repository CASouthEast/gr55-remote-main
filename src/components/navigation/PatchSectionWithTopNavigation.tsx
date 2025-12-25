import { useNavigation, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

import { useAccessibility } from "../../hooks/useAccessibility";
import { PatchAssignsScreen } from "../../screens/PatchAssignsScreen";
import { PatchEffectsScreen } from "../../screens/PatchEffects/PatchEffectsScreen";
import { PatchMainScreen } from "../../screens/PatchMainScreen";
import { PatchMasterOtherScreen } from "../../screens/PatchMasterOtherScreen";
import { PatchMasterPedalGkCtlScreen } from "../../screens/PatchMasterPedalGkCtlScreen";
import { PatchSaveAsScreen } from "../../screens/PatchSaveAsScreen";
import { PatchToneScreen } from "../../screens/PatchTone/PatchToneScreen";
import { useTheme } from "../Theme";
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

const PatchStack = createNativeStackNavigator<PatchStackParamList>();

// Main patch navigation with tabs
function PatchTabNavigation(): JSX.Element {
  const [activeTab, setActiveTab] = useState<keyof PatchTabParamList>("Main");
  const theme = useTheme();
  const {
    createTabProps,
    createTabListProps,
    createTabPanelProps,
    handleKeyboardNavigation,
    announceToScreenReader,
  } = useAccessibility();

  const ActiveComponent =
    tabs.find((tab) => tab.key === activeTab)?.component || PatchMainWrapper;

  const handleTabChange = (tabKey: keyof PatchTabParamList) => {
    const previousTab = activeTab;
    setActiveTab(tabKey);

    // Announce tab change to screen readers
    const newTab = tabs.find((tab) => tab.key === tabKey);
    if (newTab && previousTab !== tabKey) {
      announceToScreenReader(`Switched to ${newTab.title} tab`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.colors.navigation.tabBar.background },
        ]}
        {...createTabListProps("Patch navigation tabs")}
      >
        {tabs.map((tab, index) => {
          const tabProps = createTabProps(tab.title, activeTab === tab.key);

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && [
                  styles.activeTab,
                  {
                    backgroundColor:
                      theme.colors.navigation.tabBar.hoverBackground,
                  },
                ],
                Platform.OS === "web" && styles.webTab,
              ]}
              onPress={() => handleTabChange(tab.key)}
              {...tabProps}
              {...(Platform.OS === "web" && {
                onFocus: (e: any) => {
                  // Add focus styling
                  if (e.target) {
                    e.target.style.outline = `2px solid ${theme.colors.navigation.tabBar.activeText}`;
                    e.target.style.outlineOffset = "-2px";
                  }
                },
                onBlur: (e: any) => {
                  // Remove focus styling
                  if (e.target) {
                    e.target.style.outline = "none";
                  }
                },
                onKeyDown: (e: any) => {
                  handleKeyboardNavigation(e, tabs, activeTab, handleTabChange);
                },
              })}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.colors.navigation.tabBar.inactiveText },
                  activeTab === tab.key && [
                    styles.activeTabText,
                    { color: theme.colors.navigation.tabBar.activeText },
                  ],
                  Platform.OS === "web" && styles.webTabText,
                ]}
                // Prevent text from being focusable separately
                {...(Platform.OS === "web" && {
                  "aria-hidden": true,
                  tabIndex: -1,
                })}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Tab Indicator */}
      <View
        style={[
          styles.indicator,
          { backgroundColor: theme.colors.navigation.tabBar.indicator },
        ]}
        {...(Platform.OS === "web" && {
          "aria-hidden": true, // Decorative element, hide from screen readers
        })}
      />

      {/* Screen Content */}
      <View
        style={styles.content}
        {...createTabPanelProps(
          tabs.find((tab) => tab.key === activeTab)?.title || "Main",
          true
        )}
      >
        <ActiveComponent />
      </View>
    </View>
  );
}

export function PatchSectionWithTopNavigation(): JSX.Element {
  return (
    <PatchStack.Navigator
      initialRouteName="PatchMain"
      id="PatchStack"
      screenOptions={{ headerShown: false }}
    >
      <PatchStack.Screen
        name="PatchMain"
        component={PatchTabNavigation}
        options={{ headerShown: false }}
      />
      <PatchStack.Group screenOptions={{ presentation: "modal" }}>
        <PatchStack.Screen
          name="PatchSaveAs"
          component={PatchSaveAsScreen}
          options={{ title: "Write user patch", headerShown: true }}
        />
      </PatchStack.Group>
    </PatchStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    height: 50,
    ...(Platform.OS === "web" && {
      // Web-specific tabBar styles
      boxShadow: "none",
      borderBottom: "1px solid #e0e0e0",
    }),
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "transparent",
    ...(Platform.OS === "web" && {
      // Web-specific tab styles
      transition: "background-color 0.2s ease, color 0.2s ease",
      outline: "none",
    }),
  },
  webTab:
    Platform.OS === "web"
      ? {
          cursor: "pointer",
          userSelect: "none",
          ":hover": {
            backgroundColor: "rgba(0, 122, 255, 0.1)",
          },
          ":active": {
            backgroundColor: "rgba(0, 122, 255, 0.2)",
          },
          ":focus": {
            outline: "2px solid #007AFF",
            outlineOffset: "-2px",
          },
        }
      : {},
  activeTab: {
    // Active tab styling will be handled by theme colors
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    ...(Platform.OS === "web" && {
      // Web-specific text styles
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      userSelect: "none",
      pointerEvents: "none", // Prevent text selection
    }),
  },
  webTabText:
    Platform.OS === "web"
      ? {
          // Enhanced contrast for web accessibility
          textShadow: "none",
          fontSmoothing: "antialiased",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }
      : {},
  activeTabText: {
    fontWeight: "bold",
  },
  indicator: {
    height: 3,
    width: "100%",
  },
  content: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
