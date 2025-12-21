import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useContext } from "react";
import { StyleSheet } from "react-native";

import { PopoverAwareScrollView } from "../../components/PopoverAwareScrollView";
import { RefreshControl } from "../../components/RefreshControl";
import { PatchToneTabParamList } from "../../components/navigation";
import { RemoteFieldSlider } from "../../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitchedSection } from "../../components/remote-fields/RemoteFieldSwitchedSection";
import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";

export function PatchToneNormalScreen({
  navigation,
}: MaterialTopTabScreenProps<PatchToneTabParamList, "Normal">) {
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
      <RemoteFieldSwitchedSection
        page={PATCH}
        field={GR55.temporaryPatch.common.normalPuMute}
      >
        <RemoteFieldSlider
          page={PATCH}
          field={GR55.temporaryPatch.common.normalPuLevel}
        />
      </RemoteFieldSwitchedSection>
    </PopoverAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
