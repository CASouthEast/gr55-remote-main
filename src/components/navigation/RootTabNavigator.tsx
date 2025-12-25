import { Entypo, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";

import GR55HWViewPage from "../../screens/GR55HWViewPage";
import { LibraryPatchListScreen } from "../../screens/LibraryPatchListScreen";
import { useUserOptions } from "../UserOptions";
import { RootTabParamList } from "../navigation";
import { SetupStackNavigator } from "./NavigatorComponents";
import { PatchSectionWithTopNavigation } from "./PatchSectionWithTopNavigation";

const RootTab = createBottomTabNavigator<RootTabParamList>();

export function RootTabNavigator() {
  const EXPERIMENTAL_ROUTES: (keyof RootTabParamList)[] = [];
  const [{ enableExperimentalFeatures }] = useUserOptions();

  return (
    <RootTab.Navigator
      id="RootTab"
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarButton:
          !enableExperimentalFeatures &&
          EXPERIMENTAL_ROUTES.includes(route.name)
            ? () => {
                return null;
              }
            : undefined,
        // Enhanced accessibility for web
        ...(Platform.OS === "web" && {
          tabBarAccessibilityRole: "tablist",
          tabBarItemStyle: {
            // Ensure proper focus indicators
            ":focus": {
              outline: "2px solid #007AFF",
              outlineOffset: "-2px",
            },
          },
        }),
      })}
    >
      <RootTab.Screen
        name="PatchDrawer"
        component={PatchSectionWithTopNavigation}
        options={{
          headerShown: false,
          title: "Patch",
          tabBarIcon: ({ color }) => (
            <Entypo name="sound-mix" size={24} color={color} />
          ),
          ...(Platform.OS === "web" && {
            tabBarAccessibilityLabel: "Patch editing section",
            tabBarAccessibilityHint: "Navigate to patch editing interface",
          }),
        }}
      />
      <RootTab.Screen
        name="LibraryPatchList"
        component={LibraryPatchListScreen}
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <Ionicons name="library" size={24} color={color} />
          ),
          ...(Platform.OS === "web" && {
            tabBarAccessibilityLabel: "Patch library",
            tabBarAccessibilityHint: "Browse and manage saved patches",
          }),
        }}
      />
      <RootTab.Screen
        name="Hardware"
        component={GR55HWViewPage}
        options={{
          title: "Hardware",
          tabBarIcon: ({ color }) => (
            <Ionicons name="hardware-chip" size={24} color={color} />
          ),
          ...(Platform.OS === "web" && {
            tabBarAccessibilityLabel: "Hardware view",
            tabBarAccessibilityHint: "View hardware interface and controls",
          }),
        }}
      />
      <RootTab.Screen
        name="SetupStack"
        component={SetupStackNavigator}
        options={{
          headerShown: false,
          title: "Setup",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
          ...(Platform.OS === "web" && {
            tabBarAccessibilityLabel: "Application setup",
            tabBarAccessibilityHint:
              "Configure application settings and preferences",
          }),
        }}
      />
    </RootTab.Navigator>
  );
}
