import { useMemo } from "react";
import { Platform } from "react-native";

import { renderAdjustingMaterialTopTabBar } from "../components/AdjustingTabBar";
import { usePopovers } from "../components/Popovers";

export function useTopTabNavigatorDefaults() {
  const { closeAllPopovers } = usePopovers();

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
                    (tab) => tab === target || tab.contains(target)
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
        tabBar: renderAdjustingMaterialTopTabBar,
        // Enhanced accessibility configuration for web
        ...(Platform.OS === "web" && {
          // Ensure proper focus management
          tabBarOptions: {
            keyboardHidesTabBar: false,
            allowFontScaling: true,
          },
        }),
      } as const),
    [closeAllPopovers]
  );
}
