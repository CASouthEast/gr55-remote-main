import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
  StyleProp,
} from "react-native";

import { useAccessibility } from "../../hooks/useAccessibility";
import { useTheme } from "../Theme";

export interface SidebarTab {
  key: string;
  title: string;
  component: React.ComponentType<any>;
  subTabs?: {
    key: string;
    title: string;
    component: React.ComponentType<any>;
  }[];
}

interface SidebarPageLayoutProps {
  tabs: SidebarTab[];
  title?: string;
  defaultTab?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function SidebarPageLayout({
  tabs,
  title,
  defaultTab,
  contentContainerStyle,
}: SidebarPageLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.key || ""
  );
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  const theme = useTheme();
  const {
    createTabProps,
    createTabListProps,
    createTabPanelProps,
    handleKeyboardNavigation,
  } = useAccessibility();

  // Determine the component to render
  const currentTab = tabs.find((tab) => tab.key === activeTab);
  let ActiveComponent = currentTab?.component || (() => null);

  // On Web, if we have an active sub-tab, render that instead
  if (Platform.OS === "web" && currentTab?.subTabs && activeSubTab) {
    const subTab = currentTab.subTabs.find((st) => st.key === activeSubTab);
    if (subTab) {
      ActiveComponent = subTab.component;
    }
  }

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);

    // If the new tab has sub-tabs, select the first one by default on Web
    const newTab = tabs.find((tab) => tab.key === tabKey);
    if (Platform.OS === "web" && newTab?.subTabs && newTab.subTabs.length > 0) {
      setActiveSubTab(newTab.subTabs[0].key);
    } else {
      setActiveSubTab(null);
    }
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
        {...(createTabListProps(title || "Navigation tabs") as any)}
      >
        {tabs.map((tab) => {
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
                  {tab.subTabs!.map((subTab) => {
                    const isSelected = activeSubTab === subTab.key;
                    return (
                      <TouchableOpacity
                        key={subTab.key}
                        onPress={() => handleSubTabChange(subTab.key)}
                        style={[
                          styles.subTab,
                          isSelected && [
                            styles.activeSubTab,
                            { backgroundColor: "rgba(0,0,0,0.05)" },
                          ],
                          isWeb
                            ? ({
                                cursor: "pointer",
                                ":hover": {
                                  backgroundColor: "rgba(0,0,0,0.03)",
                                },
                              } as any)
                            : {},
                        ]}
                      >
                        <Text
                          style={[
                            styles.subTabText,
                            isSelected && styles.activeSubTabText,
                          ]}
                        >
                          {subTab.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Active Tab Indicator (Mobile) */}
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
        style={[styles.content, contentContainerStyle]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    ...(Platform.OS === "web" && {
      flexDirection: "row", // Sidebar layout on web
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
