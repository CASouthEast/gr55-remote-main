import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import {
  BluetoothSettingsScreen,
  canShowBluetoothSettings,
} from "../../screens/BluetoothSettingsScreen";
import { IoSetupScreen } from "../../screens/IoSetupScreen";
import { SetupStackParamList } from "../navigation";

const SetupStack = createNativeStackNavigator<SetupStackParamList>();

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
