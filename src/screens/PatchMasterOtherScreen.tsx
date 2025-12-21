import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useContext, useEffect } from "react";
import { StyleSheet } from "react-native";

import { PopoverAwareScrollView } from "../components/PopoverAwareScrollView";
import { RefreshControl } from "../components/RefreshControl";
import { PatchStackParamList } from "../components/navigation";
import { RemoteFieldPicker } from "../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldSlider } from "../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitchedSection } from "../components/remote-fields/RemoteFieldSwitchedSection";
import { RolandRemotePatchContext as PATCH } from "../contexts/RolandRemotePageContext";
import { useRemoteField } from "../hooks/useRemoteField";
import { RolandGR55AddressMapAbsolute as GR55 } from "../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../utils/SafeAreaUtils";

export function PatchMasterOtherScreen({
  navigation,
}: NativeStackScreenProps<PatchStackParamList, "PatchMasterOther">) {
  const [patchName] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.patchName
  );
  useEffect(() => {
    navigation.setOptions({
      title: patchName + " > Other",
    });
  }, [navigation, patchName]);

  const { reloadData } = useContext(PATCH);

  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  const [altTuneType, setAltTuneType] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.altTuneType
  );

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[styles.container]}
      contentContainerStyle={safeAreaStyle}
    >
      <RemoteFieldSlider
        page={PATCH}
        field={GR55.temporaryPatch.common.patchTempo}
      />
      {/* TODO: Fetch and render GK set names */}
      <RemoteFieldPicker
        page={PATCH}
        field={GR55.temporaryPatch.common.gkSet}
      />
      {/* TODO: Indicate that this is ignored if SYSTEM GUITAR OUT is anything other than PATCH */}
      <RemoteFieldPicker
        page={PATCH}
        field={GR55.temporaryPatch.common.guitarOutSource}
      />
      <RemoteFieldSwitchedSection
        page={PATCH}
        field={GR55.temporaryPatch.common.altTuneSwitch}
      >
        <RemoteFieldPicker
          page={PATCH}
          field={GR55.temporaryPatch.common.altTuneType}
          value={altTuneType}
          onValueChange={setAltTuneType}
        />
        {altTuneType === "USER" && (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.common.userTuneShiftString1}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.common.userTuneShiftString2}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.common.userTuneShiftString3}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.common.userTuneShiftString4}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.common.userTuneShiftString5}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.common.userTuneShiftString6}
            />
          </>
        )}
      </RemoteFieldSwitchedSection>
      <RemoteFieldSlider
        page={PATCH}
        field={GR55.temporaryPatch.common.vlinkPalette}
      />
      <RemoteFieldSlider
        page={PATCH}
        field={GR55.temporaryPatch.common.vlinkPatchClip}
      />
      <RemoteFieldSlider
        page={PATCH}
        field={GR55.temporaryPatch.common.vlinkClipChange}
      />
      <RemoteFieldPicker
        page={PATCH}
        field={GR55.temporaryPatch.common.vlinkExpPedal}
      />
      <RemoteFieldPicker
        page={PATCH}
        field={GR55.temporaryPatch.common.vlinkExpPedalOn}
      />
      <RemoteFieldPicker
        page={PATCH}
        field={GR55.temporaryPatch.common.vlinkGkVol}
      />
    </PopoverAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
