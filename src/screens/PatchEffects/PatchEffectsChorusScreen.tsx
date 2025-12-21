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

const { sendsAndEq, mfx, ampModNs, common } = GR55.temporaryPatch;

export function PatchEffectsChorusScreen({
  navigation,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "CHO">) {
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
      <RemoteFieldSwitchedSection page={PATCH} field={sendsAndEq.chorusSwitch}>
        <RemoteFieldPicker page={PATCH} field={sendsAndEq.chorusType} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.chorusRate} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.chorusDepth} />
        <RemoteFieldSlider page={PATCH} field={sendsAndEq.chorusEffectLevel} />

        <RemoteFieldSlider page={PATCH} field={mfx.mfxChorusSendLevel} />
        <RemoteFieldSlider page={PATCH} field={ampModNs.modChorusSendLevel} />
        <RemoteFieldSlider page={PATCH} field={common.bypassChorusSendLevel} />
      </RemoteFieldSwitchedSection>
    </PopoverAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
