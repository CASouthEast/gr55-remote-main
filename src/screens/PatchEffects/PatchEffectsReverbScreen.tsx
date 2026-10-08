import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { PopoverAwareScrollView } from "../../components/PopoverAwareScrollView";
import { RefreshControl } from "../../components/RefreshControl";
import { ThemeVariantProvider, useThemedColors } from "../../components/Theme";
import { Section } from "../../components/fields/Section";
import { PatchEffectsTabParamList } from "../../components/navigation";
import { RemoteFieldPicker } from "../../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldSlider } from "../../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitchedSection } from "../../components/remote-fields/RemoteFieldSwitchedSection";
import { ThemedCard } from "../../components/ui/ThemedCard";
import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";

const { sendsAndEq, mfx, ampModNs, common } = GR55.temporaryPatch;

export function PatchEffectsReverbScreen(
  props: MaterialTopTabScreenProps<PatchEffectsTabParamList, "REV">
) {
  return (
    <ThemeVariantProvider variant="lavender">
      <PatchEffectsReverbScreenContent {...props} />
    </ThemeVariantProvider>
  );
}

function PatchEffectsReverbScreenContent({
  navigation,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "REV">) {
  const { reloadData } = useContext(PATCH);
  const colors = useThemedColors();

  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[safeAreaStyle, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <RemoteFieldSwitchedSection page={PATCH} field={sendsAndEq.reverbSwitch}>
        <ThemedCard>
          <Section heading="Reverb Model" noBorder>
            <RemoteFieldPicker page={PATCH} field={sendsAndEq.reverbType} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.reverbTime} />
            <RemoteFieldPicker page={PATCH} field={sendsAndEq.reverbHighCut} />
            <RemoteFieldSlider
              page={PATCH}
              field={sendsAndEq.reverbEffectLevel}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Send Levels" noBorder>
            <RemoteFieldSlider page={PATCH} field={mfx.mfxReverbSendLevel} />
            <RemoteFieldSlider
              page={PATCH}
              field={ampModNs.modReverbSendLevel}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={common.bypassReverbSendLevel}
            />
          </Section>
        </ThemedCard>
      </RemoteFieldSwitchedSection>
    </PopoverAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
});
