import { MaterialTopTabBar } from "@react-navigation/material-top-tabs";
import { Dimensions, Platform, StyleProp, ViewStyle } from "react-native";

export const renderAdjustingMaterialTopTabBar =
  createAdjustingTabBar(MaterialTopTabBar);

// HOC to adjust tab widths to fit the screen such that the last visible tab is always
// half visible (if there are more tabs than can fit on the screen)
function createAdjustingTabBar<
  TabBarProps extends {
    descriptors: {
      [key: string]: {
        options?: {
          tabBarItemStyle?: StyleProp<ViewStyle>;
          tabBarScrollEnabled?: boolean;
          tabBarAccessibilityLabel?: string;
          tabBarTestID?: string;
          title?: string;
        };
      };
    };
    layout: {
      width: number;
      height: number;
    };
    state: {
      index: number;
      routes: { key: string; name: string }[];
    };
    // Add styling props that should be passed through
    tabBarStyle?: StyleProp<ViewStyle>;
    tabBarLabelStyle?: StyleProp<ViewStyle>;
    tabBarActiveTintColor?: string;
    tabBarInactiveTintColor?: string;
    tabBarPressColor?: string;
    tabBarIndicatorStyle?: StyleProp<ViewStyle>;
    tabBarItemStyle?: StyleProp<ViewStyle>;
    tabBarContentContainerStyle?: StyleProp<ViewStyle>;
  }
>(TabBar: React.ComponentType<TabBarProps>) {
  // NOTE: Not actually a component (because react-navigation calls it as a function)
  return function renderAdjustingTabBar(props: TabBarProps) {
    // The layout from react-navigation can take multiple seconds to reach the
    // correct value, so we use the window dimensions as a hacky workaround.
    const effectiveLayoutWidth =
      Dimensions.get("window").width ?? props.layout.width;
    const MINIMUM_TAB_WIDTH = Platform.select({
      ios: 75,
      default: 65,
    });
    const tabCount = Object.keys(props.descriptors).length;
    let tabsInView = Math.floor(effectiveLayoutWidth / MINIMUM_TAB_WIDTH);
    if (tabsInView < tabCount && tabsInView > 1) {
      // round down to the nearest half tab
      tabsInView -= 0.5;
    }

    // Enhanced descriptors with accessibility attributes
    const descriptors = Object.fromEntries(
      Object.entries(props.descriptors).map(([key, descriptor], index) => {
        const route = props.state.routes.find((r) => r.key === key);
        const isActive = props.state.index === index;
        const title = descriptor.options?.title || route?.name || "Tab";

        return [
          key,
          {
            ...descriptor,
            options: {
              ...descriptor.options,
              tabBarScrollEnabled: tabsInView < tabCount,
              tabBarItemStyle:
                tabsInView < tabCount && tabsInView > 0
                  ? { width: effectiveLayoutWidth / tabsInView }
                  : {},
              // Enhanced accessibility attributes for web and native
              ...(Platform.OS === "web" && {
                // Web-specific ARIA attributes
                tabBarAccessibilityRole: "tab" as any,
                tabBarAccessibilityState: { selected: isActive } as any,
                tabBarAccessibilityLabel:
                  descriptor.options?.tabBarAccessibilityLabel ||
                  `${title} tab`,
                tabBarTestID:
                  descriptor.options?.tabBarTestID ||
                  `${route?.name?.toLowerCase()}-tab`,
                // Additional web accessibility properties
                tabBarAccessibilityHint: `Navigate to ${title} section` as any,
                tabBarAccessibilityValue: {
                  text: isActive ? "selected" : "not selected",
                } as any,
                // Keyboard navigation support
                tabBarAccessible: true as any,
                tabBarFocusable: true as any,
                // ARIA attributes for web
                "aria-label":
                  descriptor.options?.tabBarAccessibilityLabel ||
                  `${title} tab`,
                "aria-selected": isActive,
                "aria-controls": `${route?.name?.toLowerCase()}-panel`,
                role: "tab",
                tabIndex: isActive ? 0 : -1, // Only active tab should be in tab order initially
              }),
              // Native accessibility attributes
              ...(Platform.OS !== "web" && {
                tabBarAccessibilityRole: "tab",
                tabBarAccessibilityState: { selected: isActive },
                tabBarAccessibilityLabel:
                  descriptor.options?.tabBarAccessibilityLabel ||
                  `${title} tab`,
                tabBarTestID:
                  descriptor.options?.tabBarTestID ||
                  `${route?.name?.toLowerCase()}-tab`,
                tabBarAccessibilityHint: `Navigate to ${title} section`,
                tabBarAccessible: true,
              }),
            },
          },
        ];
      })
    );

    return (
      <TabBar
        // On Android, TabBar doesn't rerender correctly at different sizes if we don't remount it
        key={effectiveLayoutWidth + "_" + tabsInView + "_" + tabCount}
        {...props}
        descriptors={descriptors}
        // CRITICAL FIX: Explicitly pass through styling props to ensure they're not lost
        // These props come from the screenOptions in PatchTopTabsNavigator
        tabBarStyle={props.tabBarStyle}
        tabBarLabelStyle={props.tabBarLabelStyle}
        tabBarActiveTintColor={props.tabBarActiveTintColor}
        tabBarInactiveTintColor={props.tabBarInactiveTintColor}
        tabBarPressColor={props.tabBarPressColor}
        tabBarIndicatorStyle={props.tabBarIndicatorStyle}
        tabBarItemStyle={props.tabBarItemStyle}
        tabBarContentContainerStyle={props.tabBarContentContainerStyle}
        // Additional accessibility props for the tab bar container
        {...(Platform.OS === "web" && {
          accessibilityRole: "tablist" as any,
          accessibilityLabel: "Patch settings navigation tabs",
          "aria-label": "Patch settings navigation tabs",
          role: "tablist",
        })}
        {...(Platform.OS !== "web" && {
          accessibilityRole: "tablist",
          accessibilityLabel: "Patch settings navigation tabs",
        })}
      />
    );
  };
}
