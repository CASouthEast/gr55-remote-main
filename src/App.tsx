// TODO: Configure this as a polyfill in Metro?
import "setimmediate";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { AlertsProvider } from "react-native-paper-alerts";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigationContainer from "./components/AppNavigationContainer";
import { PatchSaveHeaderButton } from "./components/PatchSaveHeaderButton";
import { PopoversContainer, usePopovers } from "./components/Popovers";
import { ThemeProvider } from "./components/Theme";
import { UserOptionsContainer, useUserOptions } from "./components/UserOptions";
import {
  PatchStackParamList,
  RootTabParamList,
  SetupStackParamList,
} from "./components/navigation";
import { ThemedContextualStyleProvider } from "./components/ui/ThemedContextualStyleProvider";
import {
  RolandRemotePatchContext,
  RolandRemoteSystemContext,
} from "./contexts/RolandRemotePageContext";
import { useRolandRemotePatchState } from "./hooks/useRolandRemotePatchState";
import { useRolandRemoteSystemState } from "./hooks/useRolandRemoteSystemState";
import { RolandIoSetupContainer } from "./lib/RolandIoSetup";
import { RolandRemotePatchSelectionContainer } from "./lib/RolandRemotePatchSelection";
import { RolandGR55AssignsContainer } from "./lib/roland-gr55/RolandGR55AssignsContainer";
import { RolandGR55RemotePatchDescriptionsContainer } from "./lib/roland-gr55/RolandGR55RemotePatchDescriptions";
import { setNetworkSessionsEnabled } from "./modules/modules/midi-hardware-manager";
import {
  BluetoothSettingsScreen,
  canShowBluetoothSettings,
} from "./screens/BluetoothSettingsScreen";
import GR55HWViewPage from "./screens/GR55HWViewPage";
import { IoSetupScreen } from "./screens/IoSetupScreen";
import { LibraryPatchListScreen } from "./screens/LibraryPatchListScreen";
import { PatchAssignsScreen } from "./screens/PatchAssignsScreen";
import { PatchEffectsScreen } from "./screens/PatchEffects/PatchEffectsScreen";
import { PatchMainScreen } from "./screens/PatchMainScreen";
import { PatchMasterOtherScreen } from "./screens/PatchMasterOtherScreen";
import { PatchMasterPedalGkCtlScreen } from "./screens/PatchMasterPedalGkCtlScreen";
import { PatchSaveAsScreen } from "./screens/PatchSaveAsScreen";
import { PatchToneScreen } from "./screens/PatchTone/PatchToneScreen";
import { MidiIoSetupContainer } from "./services/MidiIo";
import {
  useFocusQueryPriority,
  RolandDataTransferContainer,
} from "./services/RolandDataTransfer";

// Only import drawer on native platforms
let createDrawerNavigator: any;
let DrawerContentComponentProps: any;
let DrawerContentScrollView: any;
let DrawerItem: any;
let DrawerItemList: any;

if (Platform.OS !== "web") {
  const drawer = require("@react-navigation/drawer");
  createDrawerNavigator = drawer.createDrawerNavigator;
  DrawerContentComponentProps = drawer.DrawerContentComponentProps;
  DrawerContentScrollView = drawer.DrawerContentScrollView;
  DrawerItem = drawer.DrawerItem;
  DrawerItemList = drawer.DrawerItemList;
}

const PatchStack = createNativeStackNavigator<PatchStackParamList>();

const PatchDrawer = Platform.OS !== "web" ? createDrawerNavigator() : null;
const PatchTopTabs =
  Platform.OS === "web" ? createMaterialTopTabNavigator() : null;
const RootTab = createBottomTabNavigator<RootTabParamList>();
const SetupStack = createNativeStackNavigator<SetupStackParamList>();

function RolandRemotePatchStateContainer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const rolandRemotePatchState = useRolandRemotePatchState();
  return (
    <RolandRemotePatchContext.Provider value={rolandRemotePatchState}>
      {children}
    </RolandRemotePatchContext.Provider>
  );
}

function RolandRemoteSystemStateContainer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const rolandRemoteSystemState = useRolandRemoteSystemState();
  return (
    <RolandRemoteSystemContext.Provider value={rolandRemoteSystemState}>
      {children}
    </RolandRemoteSystemContext.Provider>
  );
}

export default function App() {
  React.useEffect(() => {
    setNetworkSessionsEnabled(true);
  }, []);
  return (
    <SafeAreaProvider>
      <UserOptionsContainer>
        <MidiIoSetupContainer>
          <RolandIoSetupContainer>
            <RolandDataTransferContainer>
              <RolandRemoteSystemStateContainer>
                <RolandRemotePatchSelectionContainer>
                  <RolandRemotePatchStateContainer>
                    <RolandGR55RemotePatchDescriptionsContainer>
                      <AppNavigationContainer>
                        <RolandGR55AssignsContainer>
                          <ThemeProvider>
                            {/* @ts-ignore AlertsProvider's types are busted :( */}
                            <AlertsProvider>
                              <ThemedContextualStyleProvider>
                                <PopoversContainer>
                                  <KeyboardAvoidingView
                                    behavior={
                                      Platform.OS === "ios"
                                        ? "padding"
                                        : undefined
                                    }
                                    enabled={Platform.OS === "ios"}
                                    style={styles.keyboardAvoidingView}
                                  >
                                    <RootTabNavigator />
                                  </KeyboardAvoidingView>
                                </PopoversContainer>
                              </ThemedContextualStyleProvider>
                            </AlertsProvider>
                          </ThemeProvider>
                        </RolandGR55AssignsContainer>
                      </AppNavigationContainer>
                    </RolandGR55RemotePatchDescriptionsContainer>
                  </RolandRemotePatchStateContainer>
                </RolandRemotePatchSelectionContainer>
              </RolandRemoteSystemStateContainer>
            </RolandDataTransferContainer>
          </RolandIoSetupContainer>
        </MidiIoSetupContainer>
      </UserOptionsContainer>
    </SafeAreaProvider>
  );
}

function PatchDrawerContent(props: any): React.ReactNode {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        style={{ paddingLeft: 0 }}
        label="Tone"
        onPress={() => props.navigation.navigate("PatchTone")}
      />
      <DrawerItem
        style={{ paddingLeft: 20 }}
        label="Normal Pickup"
        onPress={() =>
          props.navigation.navigate("PatchTone", { screen: "Normal" })
        }
      />
      <DrawerItem
        style={{ paddingLeft: 20 }}
        label="PCM1"
        onPress={() =>
          props.navigation.navigate("PatchTone", { screen: "PCM1" })
        }
      />
      <DrawerItem
        style={{ paddingLeft: 20 }}
        label="PCM2"
        onPress={() =>
          props.navigation.navigate("PatchTone", { screen: "PCM2" })
        }
      />
      <DrawerItem
        style={{ paddingLeft: 20 }}
        label="Modeling"
        onPress={() =>
          props.navigation.navigate("PatchTone", { screen: "Modeling" })
        }
      />
      <DrawerItem
        style={{ paddingLeft: 0 }}
        label="Effects"
        onPress={() => props.navigation.navigate("PatchEffects")}
      />
      <DrawerItem
        style={{ paddingLeft: 0 }}
        label="Pedal / GK Control"
        onPress={() => props.navigation.navigate("PatchMasterPedalGkCtl")}
      />
      <DrawerItem
        style={{ paddingLeft: 0 }}
        label="Assigns"
        onPress={() => props.navigation.navigate("PatchAssigns")}
      />
      <DrawerItem
        style={{ paddingLeft: 0 }}
        label="Other"
        onPress={() => props.navigation.navigate("PatchMasterOther")}
      />
    </DrawerContentScrollView>
  );
}

function PatchDrawerNavigator() {
  useFocusQueryPriority("read_patch_details");
  return (
    <PatchDrawer.Navigator drawerContent={PatchDrawerContent} id="PatchDrawer">
      <PatchDrawer.Screen
        name="PatchStack"
        component={PatchStackNavigator}
        options={{ headerShown: false, title: "Home" }}
      />
    </PatchDrawer.Navigator>
  );
}

function PatchTopTabsNavigator() {
  useFocusQueryPriority("read_patch_details");
  const { closeAllPopovers } = usePopovers();
  const theme = useTheme();

  return (
    <PatchTopTabs.Navigator
      id="PatchTabs"
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarStyle: { backgroundColor: theme.colors.card },
      }}
      screenListeners={{
        transitionStart: () => {
          closeAllPopovers();
        },
        blur: () => {
          closeAllPopovers();
        },
      }}
    >
      <PatchTopTabs.Screen
        name="PatchMain"
        component={PatchMainScreen}
        options={{ title: "Main" }}
      />
      <PatchTopTabs.Screen
        name="PatchTone"
        component={PatchToneScreen}
        options={{ title: "Tone" }}
      />
      <PatchTopTabs.Screen
        name="PatchEffects"
        component={PatchEffectsScreen}
        options={{ title: "Effects" }}
      />
      <PatchTopTabs.Screen
        name="PatchMasterPedalGkCtl"
        component={PatchMasterPedalGkCtlScreen}
        options={{ title: "Pedal/GK" }}
      />
      <PatchTopTabs.Screen
        name="PatchAssigns"
        component={PatchAssignsScreen}
        options={{ title: "Assigns" }}
      />
      <PatchTopTabs.Screen
        name="PatchMasterOther"
        component={PatchMasterOtherScreen}
        options={{ title: "Other" }}
      />
    </PatchTopTabs.Navigator>
  );
}

function RootTabNavigator() {
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
        component={
          Platform.OS === "web" ? PatchTopTabsNavigator : PatchDrawerNavigator
        }
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

function PatchStackNavigator() {
  const { closeAllPopovers } = usePopovers();
  const theme = useTheme();
  return (
    <PatchStack.Navigator
      initialRouteName="PatchMain"
      id="PatchStack"
      screenListeners={{
        transitionStart: () => {
          closeAllPopovers();
        },
        blur: () => {
          closeAllPopovers();
        },
      }}
    >
      <PatchStack.Group
        screenOptions={useMemo(
          () => ({
            headerRight: ({ tintColor }) => (
              <PatchSaveHeaderButton
                tintColor={tintColor ?? theme.colors.primary}
              />
            ),
          }),
          [theme.colors.primary]
        )}
      >
        <PatchStack.Screen name="PatchMain" component={PatchMainScreen} />
        <PatchStack.Screen name="PatchTone" component={PatchToneScreen} />
        <PatchStack.Screen name="PatchEffects" component={PatchEffectsScreen} />
        <PatchStack.Screen name="PatchAssigns" component={PatchAssignsScreen} />
        <PatchStack.Screen
          name="PatchMasterOther"
          component={PatchMasterOtherScreen}
          options={{ title: "Other" }}
        />
        <PatchStack.Screen
          name="PatchMasterPedalGkCtl"
          component={PatchMasterPedalGkCtlScreen}
          options={{ title: "Pedal / GK CTL" }}
        />
      </PatchStack.Group>
      <PatchStack.Group screenOptions={{ presentation: "modal" }}>
        <PatchStack.Screen
          name="PatchSaveAs"
          component={PatchSaveAsScreen}
          options={{ title: "Write user patch" }}
        />
      </PatchStack.Group>
    </PatchStack.Navigator>
  );
}

function SetupStackNavigator() {
  return (
    <SetupStack.Navigator initialRouteName="IoSetup" id="SetupStack">
      <SetupStack.Screen
        name="IoSetup"
        component={IoSetupScreen}
        options={{ title: "Setup" }}
      />
      {canShowBluetoothSettings ? (
        <SetupStack.Screen
          name="BluetoothSettings"
          component={BluetoothSettingsScreen}
          options={{ title: "Bluetooth Settings", presentation: "modal" }}
        />
      ) : null}
    </SetupStack.Navigator>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
});
