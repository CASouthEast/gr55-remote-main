import { useMemo } from "react";
import { Platform } from "react-native";

// TESTING: Comment out custom tab bar import to use native React Navigation component
// import { renderAdjustingMaterialTopTabBar } from "../components/AdjustingTabBar";
import { usePopovers } from "../components/Popovers";
import { useTheme } from "../components/Theme";

export function useTopTabNavigatorDefaults() {
  const { closeAllPopovers } = usePopovers();
  const theme = useTheme();

  return useMemo(
    () =>
      ({
        backBehavior: "history",
        screenListeners: {
          swipeStart: () => {
            closeAllPopovers();
          },
          tabPress: () => {
            closeAllPopovers();
          },
          blur: () => {
            closeAllPopovers();
          },
          // Enhanced keyboard navigation support for web
          ...(Platform.OS === "web" && {
            focus: (e: any) => {
              // Ensure proper focus management when navigating via keyboard
              const target = e.target;
              if (target && target.focus) {
                target.focus();
              }
            },
            keyPress: (e: any) => {
              // Handle keyboard navigation
              const { key, target } = e.nativeEvent || e;

              // Arrow key navigation between tabs
              if (key === "ArrowLeft" || key === "ArrowRight") {
                e.preventDefault();
                const tabBar = target?.closest('[role="tablist"]');
                if (tabBar) {
                  const tabs = tabBar.querySelectorAll('[role="tab"]');
                  const currentIndex = Array.from(tabs).findIndex(
                    (tab: any) => tab === target || tab.contains(target)
                  );

                  if (currentIndex !== -1) {
                    let nextIndex;
                    if (key === "ArrowLeft") {
                      nextIndex =
                        currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                    } else {
                      nextIndex =
                        currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                    }

                    const nextTab = tabs[nextIndex] as HTMLElement;
                    if (nextTab && nextTab.click) {
                      nextTab.focus();
                      nextTab.click();
                    }
                  }
                }
              }

              // Enter and Space key activation
              if (key === "Enter" || key === " ") {
                e.preventDefault();
                if (target && target.click) {
                  target.click();
                }
              }
            },
          }),
        },
        // Enhanced web-specific styling for better visibility
        screenOptions: {
          tabBarStyle: {
            backgroundColor: theme.colors.navigation.tabBar.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.navigation.tabBar.border,
            height: 48,
            elevation: 0,
            shadowOpacity: 0,
            ...(Platform.OS === "web" && {
              // Web-specific styles for better visibility
              boxShadow: "none",
              borderBottom: `1px solid ${theme.colors.navigation.tabBar.border}`,
              // Ensure proper contrast ratios
              minHeight: "48px",
              position: "relative" as any,
            }),
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "600" as const,
            textTransform: "none" as const,
            margin: 0,
            color: theme.colors.navigation.tabBar.inactiveText,
            ...(Platform.OS === "web" && {
              // Web-specific text styling - cast to any to avoid TypeScript issues
              userSelect: "none" as any,
              cursor: "pointer" as any,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" as any,
              // Enhanced contrast and readability
              textShadow: "none" as any,
              fontSmoothing: "antialiased" as any,
              WebkitFontSmoothing: "antialiased" as any,
              MozOsxFontSmoothing: "grayscale" as any,
              // Ensure minimum contrast ratio for accessibility
              textDecoration: "none" as any,
            }),
          },
          tabBarActiveTintColor: theme.colors.navigation.tabBar.activeText,
          tabBarInactiveTintColor: theme.colors.navigation.tabBar.inactiveText,
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.navigation.tabBar.indicator,
            height: 3,
            ...(Platform.OS === "web" && {
              // Enhanced indicator visibility on web
              borderRadius: "1.5px" as any,
              transition: "all 0.2s ease" as any,
            }),
          },
          tabBarScrollEnabled: true,
          tabBarItemStyle: {
            minWidth: 80,
            paddingHorizontal: 12,
            ...(Platform.OS === "web" && {
              // Web-specific hover and focus states - cast to any to avoid TypeScript issues
              cursor: "pointer" as any,
              transition: "background-color 0.2s ease, color 0.2s ease" as any,
              outline: "none" as any,
              ":hover": {
                backgroundColor: theme.colors.navigation.tabBar.hoverBackground,
              } as any,
              ":active": {
                backgroundColor: theme.colors.navigation.tabBar.pressBackground,
              } as any,
              ":focus": {
                outline:
                  `2px solid ${theme.colors.navigation.tabBar.activeText}` as any,
                outlineOffset: "-2px" as any,
                backgroundColor: theme.colors.navigation.tabBar.hoverBackground,
              } as any,
              // Ensure proper contrast for accessibility
              minHeight: "48px" as any,
            }),
          },
          ...(Platform.OS === "web" && {
            // Additional web accessibility - cast to any to avoid TypeScript issues
            tabBarAccessibilityRole: "tablist" as any,
            tabBarItemAccessibilityRole: "tab" as any,
            // Enhanced keyboard navigation
            tabBarKeyboardHidesTabBar: false as any,
            tabBarAllowFontScaling: true as any,
          }),
        },
        // TESTING: Comment out custom tab bar to use native React Navigation component
        // tabBar: renderAdjustingMaterialTopTabBar,
        // Enhanced accessibility configuration for web
        ...(Platform.OS === "web" && {
          // Ensure proper focus management
          tabBarOptions: {
            keyboardHidesTabBar: false,
            allowFontScaling: true,
          },
        }),
      } as const),
    [closeAllPopovers, theme]
  );
}
