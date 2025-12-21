import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";

import { RolandGR55AddressMapAbsolute as GR55 } from "./RolandGR55AddressMap";
import { RolandRemotePatchContext as PATCH } from "./RolandRemotePageContext";
import { useTopTabNavigatorDefaults } from "./hooks/useTopTabNavigatorDefaults";
import {
  PatchEffectsTabParamList,
  PatchStackParamList,
} from "./navigation/navigation";
import { PatchEffectsAmpScreen } from "./screens/PatchEffectsAmpScreen";
import { PatchEffectsChorusScreen } from "./screens/PatchEffectsChorusScreen";
import { PatchEffectsDelayScreen } from "./screens/PatchEffectsDelayScreen";
import { PatchEffectsEQScreen } from "./screens/PatchEffectsEQScreen";
import { PatchEffectsMFXScreen } from "./screens/PatchEffectsMFXScreen";
import { PatchEffectsModScreen } from "./screens/PatchEffectsModScreen";
import { PatchEffectsReverbScreen } from "./screens/PatchEffectsReverbScreen";
import { PatchEffectsStructureScreen } from "./screens/PatchEffectsStructureScreen";
import { useRemoteField } from "./useRemoteField";

const Tab = createMaterialTopTabNavigator<PatchEffectsTabParamList>();

export function PatchEffectsScreen({
  navigation,
}: NativeStackScreenProps<PatchStackParamList, "PatchEffects">) {
  const [patchName] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.patchName
  );
  useEffect(() => {
    navigation.setOptions({
      title: patchName + " > Effects",
    });
  }, [navigation, patchName]);

  return (
    <Tab.Navigator id="PatchEffects" {...useTopTabNavigatorDefaults()}>
      <Tab.Screen
        name="Struct"
        component={PatchEffectsStructureScreen}
        options={{ title: "STRUCT" }}
      />
      <Tab.Screen name="Amp" component={PatchEffectsAmpScreen} />
      <Tab.Screen name="Mod" component={PatchEffectsModScreen} />
      <Tab.Screen name="MFX" component={PatchEffectsMFXScreen} />
      <Tab.Screen name="DLY" component={PatchEffectsDelayScreen} />
      <Tab.Screen name="REV" component={PatchEffectsReverbScreen} />
      <Tab.Screen name="CHO" component={PatchEffectsChorusScreen} />
      <Tab.Screen name="EQ" component={PatchEffectsEQScreen} />
    </Tab.Navigator>
  );
}
