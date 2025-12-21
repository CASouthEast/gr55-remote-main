import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";

import { RolandGR55AddressMapAbsolute as GR55 } from "./RolandGR55AddressMap";
import { RolandRemotePatchContext as PATCH } from "./RolandRemotePageContext";
import { useTopTabNavigatorDefaults } from "./hooks/useTopTabNavigatorDefaults";
import {
  PatchToneTabParamList,
  PatchStackParamList,
} from "./navigation/navigation";
import { PatchToneModelingScreen } from "./screens/tones/PatchToneModelingScreen";
import { PatchToneNormalScreen } from "./screens/tones/PatchToneNormalScreen";
import { PatchTonePCMScreen } from "./screens/tones/PatchTonePCMScreen";
import { useRemoteField } from "./useRemoteField";

const Tab = createMaterialTopTabNavigator<PatchToneTabParamList>();

export function PatchToneScreen({
  navigation,
}: NativeStackScreenProps<PatchStackParamList, "PatchTone">) {
  const [patchName] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.patchName
  );
  useEffect(() => {
    navigation.setOptions({
      title: patchName + " > Tone",
    });
  }, [navigation, patchName]);

  return (
    <Tab.Navigator id="PatchTone" {...useTopTabNavigatorDefaults()}>
      <Tab.Screen name="Normal" component={PatchToneNormalScreen} />
      <Tab.Screen name="PCM1" component={PatchTonePCMScreen} />
      <Tab.Screen name="PCM2" component={PatchTonePCMScreen} />
      <Tab.Screen
        name="Modeling"
        component={PatchToneModelingScreen}
        options={{ title: "Model" }}
      />
    </Tab.Navigator>
  );
}
