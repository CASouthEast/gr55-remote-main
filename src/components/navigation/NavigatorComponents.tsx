import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme as useNavigationTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { Platform } from "react-native";

import { useTopTabNavigatorDefaults } from "../../hooks/useTopTabNavigatorDefaults";
import {
  BluetoothSettingsScreen,
  canShowBluetoothSettings,
} from "../../screens/BluetoothSettingsScreen";
import { IoSetupScreen } from "../../screens/IoSetupScreen";
import { PatchAssignsScreen } from "../../screens/PatchAssignsScreen";
import { PatchEffectsScreen } from "../../screens/PatchEffects/PatchEffectsScreen";
import { PatchMainScreen } from "../../screens/PatchMainScreen";
import { PatchMasterOtherScreen } from "../../screens/PatchMasterOtherScreen";
import { PatchMasterPedalGkCtlScreen } from "../../screens/PatchMasterPedalGkCtlScreen";
import { PatchSaveAsScreen } from "../../screens/PatchSaveAsScreen";
import { PatchToneScreen } from "../../screens/PatchTone/PatchToneScreen";
import { useFocusQueryPriority } from "../../services/RolandDataTransfer";
import { PatchSaveHeaderButton } from "../PatchSaveHeaderButton";
import { usePopovers } from "../Popovers";
import { PatchStackParamList, SetupStackParamList } from "../navigation";

// Only import drawer on native platforms
let createDrawerNavigator: any;
let DrawerContentScrollView: any;
let DrawerItem: any;
let DrawerItemList: any;

if (Platform.OS !== "web") {
  const drawer = require("@react-navigation/drawer");
  createDrawerNavigator = drawer.createDrawerNavigator;
  DrawerContentScrollView = drawer.DrawerContentScrollView;
  DrawerItem = drawer.DrawerItem;
  DrawerItemList = drawer.DrawerItemList;
}

const PatchStack = createNativeStackNavigator<PatchStackParamList>();
const PatchDrawer = Platform.OS !== "web" ? createDrawerNavigator() : null;
const PatchTopTabs =
  Platform.OS === "web" ? createMaterialTopTabNavigator() : null;
const SetupStack = createNativeStackNavigator<SetupStackParamList>();

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

export function PatchDrawerNavigator() {
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

export function PatchTopTabsNavigator() {
  useFocusQueryPriority("read_patch_details");
  const navigationTheme = useNavigationTheme();
  const topTabNavigatorDefaults = useTopTabNavigatorDefaults();

  // Null-safety check for web-only navigator
  if (!PatchTopTabs) {
    return null;
  }

  // Web-specific styling enhancements for better browser compatibility
  const webSpecificStyles =
    Platform.OS === "web"
      ? {
          tabBarStyle: {
            backgroundColor: navigationTheme.colors.card,
            borderBottomWidth: 1,
            borderBottomColor: navigationTheme.colors.border,
            // Web-specific CSS properties for better browser compatibility
            ...(Platform.OS === "web" && {
              userSelect: "none" as any,
              WebkitUserSelect: "none" as any,
            }),
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600" as const,
            color: navigationTheme.colors.text, // Explicit color for web visibility
            textTransform: "none" as any,
            // Web-specific CSS properties
            ...(Platform.OS === "web" && {
              userSelect: "none" as any,
              WebkitUserSelect: "none" as any,
              cursor: "pointer" as any,
            }),
          },
          tabBarActiveTintColor: navigationTheme.colors.primary,
          tabBarInactiveTintColor: navigationTheme.colors.text,
          // Web-specific hover and focus states with fallback colors
          ...(Platform.OS === "web" && {
            tabBarPressColor: navigationTheme.colors.primary + "20", // 20% opacity
            tabBarIndicatorStyle: {
              backgroundColor: navigationTheme.colors.primary,
              height: 2,
            },
            // Fallback colors for better browser compatibility
            tabBarItemStyle: {
              // Fallback background color
              backgroundColor: navigationTheme.colors.card || "#ffffff",
            },
            tabBarContentContainerStyle: {
              // Fallback container background
              backgroundColor: navigationTheme.colors.card || "#ffffff",
            },
          }),
        }
      : {
          tabBarActiveTintColor: navigationTheme.colors.primary,
          tabBarInactiveTintColor: navigationTheme.colors.text,
          tabBarStyle: { backgroundColor: navigationTheme.colors.card },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600" as const,
            color: navigationTheme.colors.text, // Explicit color for web visibility
          },
        };

  return (
    <PatchTopTabs.Navigator
      id="PatchTabs"
      screenOptions={webSpecificStyles}
      {...topTabNavigatorDefaults}
    >
      <PatchTopTabs.Screen
        name="PatchMain"
        // @ts-ignore - MaterialTopTab and NativeStack prop types differ but are compatible at runtime
        component={PatchMainScreen}
        options={{
          title: "Main",
          // Accessibility attributes for screen readers and keyboard navigation
          tabBarAccessibilityLabel: "Main patch settings tab",
          tabBarTestID: "patch-main-tab",
        }}
      />
      <PatchTopTabs.Screen
        name="PatchTone"
        // @ts-ignore - MaterialTopTab and NativeStack prop types differ but are compatible at runtime
        component={PatchToneScreen}
        options={{
          title: "Tone",
          // Accessibility attributes for screen readers and keyboard navigation
          tabBarAccessibilityLabel: "Tone settings tab",
          tabBarTestID: "patch-tone-tab",
        }}
      />
      <PatchTopTabs.Screen
        name="PatchEffects"
        // @ts-ignore - MaterialTopTab and NativeStack prop types differ but are compatible at runtime
        component={PatchEffectsScreen}
        options={{
          title: "Effects",
          // Accessibility attributes for screen readers and keyboard navigation
          tabBarAccessibilityLabel: "Effects settings tab",
          tabBarTestID: "patch-effects-tab",
        }}
      />
      <PatchTopTabs.Screen
        name="PatchMasterPedalGkCtl"
        // @ts-ignore - MaterialTopTab and NativeStack prop types differ but are compatible at runtime
        component={PatchMasterPedalGkCtlScreen}
        options={{
          title: "Pedal/GK",
          // Accessibility attributes for screen readers and keyboard navigation
          tabBarAccessibilityLabel: "Pedal and GK control settings tab",
          tabBarTestID: "patch-pedal-gk-tab",
        }}
      />
      <PatchTopTabs.Screen
        name="PatchAssigns"
        // @ts-ignore - MaterialTopTab and NativeStack prop types differ but are compatible at runtime
        component={PatchAssignsScreen}
        options={{
          title: "Assigns",
          // Accessibility attributes for screen readers and keyboard navigation
          tabBarAccessibilityLabel: "Assigns settings tab",
          tabBarTestID: "patch-assigns-tab",
        }}
      />
      <PatchTopTabs.Screen
        name="PatchMasterOther"
        // @ts-ignore - MaterialTopTab and NativeStack prop types differ but are compatible at runtime
        component={PatchMasterOtherScreen}
        options={{
          title: "Other",
          // Accessibility attributes for screen readers and keyboard navigation
          tabBarAccessibilityLabel: "Other patch settings tab",
          tabBarTestID: "patch-other-tab",
        }}
      />
    </PatchTopTabs.Navigator>
  );
}

function PatchStackNavigator() {
  const { closeAllPopovers } = usePopovers();
  const navigationTheme = useNavigationTheme();
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
                tintColor={tintColor ?? navigationTheme.colors.primary}
              />
            ),
          }),
          [navigationTheme.colors.primary]
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

export function SetupStackNavigator() {
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
