import { Entypo, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";

import { ConnectScreen } from "../../screens/ConnectScreen";
import GR55HWViewPage from "../../screens/GR55HWViewPage";
import { LibraryPatchListScreen } from "../../screens/LibraryPatchListScreen";
import { SystemScreen } from "../../screens/SystemScreen";
import { useUserOptions } from "../UserOptions";
import { RootTabParamList } from "../navigation";
import { SetupStackNavigator } from "./NavigatorComponents";
import { PatchSectionWithTopNavigation } from "./PatchSectionWithTopNavigation";

const RootTab = createBottomTabNavigator<RootTabParamList>();

export function RootTabNavigator() {
  const EXPERIMENTAL_ROUTES: (keyof RootTabParamList)[] = [];
  const [userOptions] = useUserOptions();
  const isWebAndTop =
    Platform.OS === "web" && userOptions.webTabBarPosition === "top";

  return (
    <RootTab.Navigator
      id="RootTab"
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarStyle: isWebAndTop
          ? {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 60,
              borderBottomWidth: 1,
              borderTopWidth: 0,
            }
          : undefined,
        sceneContainerStyle: isWebAndTop ? { marginTop: 60 } : undefined,
        tabBarButton:
          !userOptions.enableExperimentalFeatures &&
          EXPERIMENTAL_ROUTES.includes(route.name)
            ? () => {
                return null;
              }
            : undefined,
      })}
    >
      <RootTab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          title: "Connect",
          tabBarIcon: ({ color }) => (
            <Ionicons name="link" size={24} color={color} />
          ),
          ...(Platform.OS === "web" && {
            tabBarAccessibilityLabel: "Connect to device",
            tabBarAccessibilityHint: "Configure MIDI connection to GR-55",
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
      {userOptions.visibleTabs.patch && (
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
      )}
      {userOptions.visibleTabs.library && (
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
      )}
      {userOptions.visibleTabs.system && (
        <RootTab.Screen
          name="System"
          component={SystemScreen}
          options={{
            title: "System",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={24} color={color} />
            ),
            ...(Platform.OS === "web" && {
              tabBarAccessibilityLabel: "System settings",
              tabBarAccessibilityHint: "Configure global system parameters",
            }),
          }}
        />
      )}
      <RootTab.Screen
        name="SetupStack"
        component={SetupStackNavigator}
        options={{
          headerShown: false,
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
          ...(Platform.OS === "web" && {
            tabBarAccessibilityLabel: "Application settings",
            tabBarAccessibilityHint:
              "Configure application settings and preferences",
          }),
        }}
      />
    </RootTab.Navigator>
  );
}
