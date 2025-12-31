import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { PopoverAwareScrollView } from "../components/PopoverAwareScrollView";
import { RefreshControl } from "../components/RefreshControl";
import { ThemeVariantProvider, useThemedColors } from "../components/Theme";
import { Section } from "../components/fields/Section";
import { PatchStackParamList } from "../components/navigation";
import { RemoteFieldPicker } from "../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldSlider } from "../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitchedSection } from "../components/remote-fields/RemoteFieldSwitchedSection";
import { ThemedCard } from "../components/ui/ThemedCard";
import { RolandRemotePatchContext as PATCH } from "../contexts/RolandRemotePageContext";
import { useRemoteField } from "../hooks/useRemoteField";
import { RolandGR55AddressMapAbsolute as GR55 } from "../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../utils/SafeAreaUtils";

export function PatchMasterOtherScreen(
  props: NativeStackScreenProps<PatchStackParamList, "PatchMasterOther">
) {
  return (
    <ThemeVariantProvider variant="neutral">
      <PatchMasterOtherScreenContent {...props} />
    </ThemeVariantProvider>
  );
}

function PatchMasterOtherScreenContent({
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
  const colors = useThemedColors();

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
      style={[safeAreaStyle, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedCard>
        <Section heading="Patch Settings" noBorder>
          <RemoteFieldSlider
            page={PATCH}
            field={GR55.temporaryPatch.common.patchTempo}
          />
          <RemoteFieldPicker
            page={PATCH}
            field={GR55.temporaryPatch.common.gkSet}
          />
          <RemoteFieldPicker
            page={PATCH}
            field={GR55.temporaryPatch.common.guitarOutSource}
          />
        </Section>
      </ThemedCard>

      <RemoteFieldSwitchedSection
        page={PATCH}
        field={GR55.temporaryPatch.common.altTuneSwitch}
      >
        <ThemedCard>
          <Section heading="Alt Tuning" noBorder>
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
          </Section>
        </ThemedCard>
      </RemoteFieldSwitchedSection>

      <ThemedCard>
        <Section heading="V-Link" noBorder>
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
        </Section>
      </ThemedCard>
    </PopoverAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
});
