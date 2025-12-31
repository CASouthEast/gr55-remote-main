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

export function PatchEffectsChorusScreen(
  props: MaterialTopTabScreenProps<PatchEffectsTabParamList, "CHO">
) {
  return (
    <ThemeVariantProvider variant="lavender">
      <PatchEffectsChorusScreenContent {...props} />
    </ThemeVariantProvider>
  );
}

function PatchEffectsChorusScreenContent({
  navigation,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "CHO">) {
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
      <RemoteFieldSwitchedSection page={PATCH} field={sendsAndEq.chorusSwitch}>
        <ThemedCard>
          <Section heading="Chorus Model" noBorder>
            <RemoteFieldPicker page={PATCH} field={sendsAndEq.chorusType} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.chorusRate} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.chorusDepth} />
            <RemoteFieldSlider
              page={PATCH}
              field={sendsAndEq.chorusEffectLevel}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Send Levels" noBorder>
            <RemoteFieldSlider page={PATCH} field={mfx.mfxChorusSendLevel} />
            <RemoteFieldSlider
              page={PATCH}
              field={ampModNs.modChorusSendLevel}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={common.bypassChorusSendLevel}
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
