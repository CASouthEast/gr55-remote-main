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
import { patchAssignsTabs } from "./PatchAssignsCustomNavigation";
import { patchEffectsTabs } from "./PatchEffectsCustomNavigation";
import { patchMasterPedalGkCtlTabs } from "./PatchMasterPedalGkCtlCustomNavigation";
import { patchToneTabs } from "./PatchToneCustomNavigation";

// Wrapper components to provide navigation props with proper route structure
function PatchMainWrapper() {
  const navigation = useNavigation();
  const parentRoute = useRoute();

  const mockProps: NativeStackScreenProps<PatchStackParamList, "PatchMain"> = {
    navigation: navigation as any,
    route: {
      key: "PatchMain-" + Date.now(),
      name: "PatchMain",
      params: parentRoute.params || {},
      path: parentRoute.path,
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
      params: parentRoute.params || {},
      path: parentRoute.path,
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
        params: parentRoute.params || {},
        path: parentRoute.path,
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
      params: parentRoute.params || {},
      path: parentRoute.path,
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
        params: parentRoute.params || {},
        path: parentRoute.path,
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
      params: parentRoute.params || {},
      path: parentRoute.path,
    },
  };

  return <PatchMasterOtherScreen {...mockProps} />;
}

const tabs: {
  key: keyof PatchTabParamList;
  title: string;
  component: React.ComponentType<any>;
  subTabs?: {
    key: string;
    title: string;
    component: React.ComponentType<any>;
  }[];
}[] = [
  { key: "Main", title: "Main", component: PatchMainWrapper },
  {
    key: "Tone",
    title: "Tone",
    component: PatchToneWrapper,
    subTabs: patchToneTabs,
  },
  {
    key: "Effects",
    title: "Effects",
    component: PatchEffectsWrapper,
    subTabs: patchEffectsTabs,
  },
  {
    key: "PedalGK",
    title: "Pedal/GK",
    component: PatchMasterPedalGkCtlWrapper,
    subTabs: patchMasterPedalGkCtlTabs,
  },
  {
    key: "Assigns",
    title: "Assigns",
    component: PatchAssignsWrapper,
    subTabs: patchAssignsTabs,
  },
  { key: "Other", title: "Other", component: PatchMasterOtherWrapper },
];

const PatchStack = createNativeStackNavigator<PatchStackParamList>();

// Main patch navigation with tabs
function PatchTabNavigation(): JSX.Element {
  const [activeTab, setActiveTab] = useState<keyof PatchTabParamList>("Main");
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  const theme = useTheme();
  const {
    createTabProps,
    createTabListProps,
    createTabPanelProps,
    handleKeyboardNavigation,
    // announceToScreenReader, // Removed unused
  } = useAccessibility();

  // Determine the component to render
  const currentTab = tabs.find((tab) => tab.key === activeTab);
  let ActiveComponent = currentTab?.component || PatchMainWrapper;

  // On Web, if we have an active sub-tab, render that instead
  if (Platform.OS === "web" && currentTab?.subTabs && activeSubTab) {
    const subTab = currentTab.subTabs.find((st) => st.key === activeSubTab);
    if (subTab) {
      ActiveComponent = subTab.component;
    }
  }

  const handleTabChange = (tabKey: keyof PatchTabParamList) => {
    // const previousTab = activeTab; // Unused
    setActiveTab(tabKey);

    // If the new tab has sub-tabs, select the first one by default on Web
    const newTab = tabs.find((tab) => tab.key === tabKey);
    if (Platform.OS === "web" && newTab?.subTabs && newTab.subTabs.length > 0) {
      setActiveSubTab(newTab.subTabs[0].key);
    } else {
      setActiveSubTab(null);
    }

    // Announce tab change to screen readers
    // if (newTab && previousTab !== tabKey) {
    //   announceToScreenReader(`Switched to ${newTab.title} tab`);
    // }
  };

  const handleSubTabChange = (subTabKey: string) => {
    setActiveSubTab(subTabKey);
  };

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.colors.navigation.tabBar.background },
          Platform.OS === "web" && { zIndex: 1 },
        ]}
        {...(createTabListProps("Patch navigation tabs") as any)}
      >
        {tabs.map((tab, index) => {
          const tabProps = createTabProps(tab.title, activeTab === tab.key);
          const isWeb = Platform.OS === "web";
          const hasSubTabs = isWeb && tab.subTabs && tab.subTabs.length > 0;
          const isExpanded = activeTab === tab.key;

          return (
            <React.Fragment key={tab.key}>
              <TouchableOpacity
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
                {...(tabProps as any)}
                {...(Platform.OS === "web" &&
                  ({
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
                      handleKeyboardNavigation(
                        e,
                        tabs,
                        activeTab,
                        handleTabChange as any
                      );
                    },
                  } as any))}
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
                  {...(Platform.OS === "web" &&
                    ({
                      "aria-hidden": true,
                      tabIndex: -1,
                    } as any))}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>

              {/* Sub Tabs (Web Only) */}
              {isExpanded && hasSubTabs && (
                <View style={styles.subTabContainer}>
                  {tab.subTabs!.map((subTab) => (
                    <TouchableOpacity
                      key={subTab.key}
                      style={[
                        styles.subTab,
                        activeSubTab === subTab.key && [
                          styles.activeSubTab,
                          { backgroundColor: "rgba(0,0,0,0.05)" }, // Slight grey for active subtab
                        ],
                        // Casting web style
                        isWeb
                          ? ({
                              cursor: "pointer",
                              ":hover": { backgroundColor: "rgba(0,0,0,0.03)" },
                            } as any)
                          : {},
                      ]}
                      onPress={() => handleSubTabChange(subTab.key)}
                    >
                      <Text
                        style={[
                          styles.subTabText,
                          activeSubTab === subTab.key &&
                            styles.activeSubTabText,
                        ]}
                      >
                        {subTab.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </React.Fragment>
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
        {...(createTabPanelProps(
          tabs.find((tab) => tab.key === activeTab)?.title || "Main",
          true
        ) as any)}
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
    ...(Platform.OS === "web" && {
      flexDirection: "row", // Sidebar layout on web
      paddingTop: 60, // Avoid overlap with top bar
    }),
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    height: 50,
    ...(Platform.OS === "web" && {
      // Web-specific tabBar styles (Sidebar)
      flexDirection: "column",
      height: "100%",
      width: 200,
      borderBottomWidth: 0,
      borderRightWidth: 1,
      borderRightColor: "#e0e0e0",
      boxShadow: "none",
    }),
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "transparent",
    ...(Platform.OS === "web" && {
      // Web-specific tab styles (List Item)
      flex: 0,
      width: "100%",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      paddingVertical: 16,
      transition: "background-color 0.2s ease, color 0.2s ease",
      outline: "none",
    }),
  },
  webTab:
    Platform.OS === "web"
      ? ({
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
        } as any)
      : {},
  activeTab: {
    // Active tab styling will be handled by theme colors
    ...(Platform.OS === "web" && {
      borderRightWidth: 3,
      borderRightColor: "#007AFF", // Indicator on the right for sidebar
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    ...(Platform.OS === "web" && {
      // Web-specific text styles
      textAlign: "left",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      userSelect: "none",
      pointerEvents: "none", // Prevent text selection
    }),
  },
  webTabText:
    Platform.OS === "web"
      ? ({
          // Enhanced contrast for web accessibility
          textShadow: "none",
          fontSmoothing: "antialiased",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        } as any)
      : {},
  activeTabText: {
    fontWeight: "bold",
  },
  subTabContainer: {
    paddingLeft: 20,
    width: "100%",
  },
  subTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  activeSubTab: {
    // Styling handled inline or by theme in future
  },
  subTabText: {
    fontSize: 13,
    color: "#666",
    fontFamily:
      Platform.OS === "web"
        ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : undefined,
  },
  activeSubTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  indicator: {
    height: 3,
    width: "100%",
    ...(Platform.OS === "web" && {
      display: "none", // Hide standard bottom indicator on web
    }),
  },
  content: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
