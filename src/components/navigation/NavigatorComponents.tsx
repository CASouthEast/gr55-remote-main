import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import {
  BluetoothSettingsScreen,
  canShowBluetoothSettings,
} from "../../screens/BluetoothSettingsScreen";
import { SettingsScreen } from "../../screens/SettingsScreen";
import { SetupStackParamList } from "../navigation";

const SetupStack = createNativeStackNavigator<SetupStackParamList>();

export function SetupStackNavigator() {
  return (
    <SetupStack.Navigator initialRouteName="Settings" id="SetupStack">
      <SetupStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
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
