import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useContext } from "react";
import { StyleSheet } from "react-native";

import { PopoverAwareScrollView } from "../../components/PopoverAwareScrollView";
import { RefreshControl } from "../../components/RefreshControl";
import { PatchEffectsTabParamList } from "../../components/navigation";
import { RemoteFieldPicker } from "../../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldSlider } from "../../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitchedSection } from "../../components/remote-fields/RemoteFieldSwitchedSection";
import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";

const { sendsAndEq } = GR55.temporaryPatch;

export function PatchEffectsEQScreen({
  navigation,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "EQ">) {
  const { reloadData } = useContext(PATCH);

  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[styles.container]}
      contentContainerStyle={safeAreaStyle}
    >
      <RemoteFieldSwitchedSection page={PATCH} field={sendsAndEq.eqSwitch}>
        <RemoteFieldPicker page={PATCH} field={sendsAndEq.eqLowCutoffFreq} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqLowGain} />
        <RemoteFieldPicker page={PATCH} field={sendsAndEq.eqLowMidCutoffFreq} />
        <RemoteFieldPicker page={PATCH} field={sendsAndEq.eqLowMidQ} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqLowMidGain} />
        <RemoteFieldPicker
          page={PATCH}
          field={sendsAndEq.eqHighMidCutoffFreq}
        />
        <RemoteFieldPicker page={PATCH} field={sendsAndEq.eqHighMidQ} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqHighMidGain} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqHighGain} />
        <RemoteFieldPicker page={PATCH} field={sendsAndEq.eqHighCutoffFreq} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqLevel} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.ezCharacter} />
      </RemoteFieldSwitchedSection>
    </PopoverAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
