import { Entypo, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

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
        }}
      />
    </RootTab.Navigator>
  );
}
