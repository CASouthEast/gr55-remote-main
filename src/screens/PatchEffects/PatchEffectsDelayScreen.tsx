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

export function PatchEffectsDelayScreen(
  props: MaterialTopTabScreenProps<PatchEffectsTabParamList, "DLY">
) {
  return (
    <ThemeVariantProvider variant="lavender">
      <PatchEffectsDelayScreenContent {...props} />
    </ThemeVariantProvider>
  );
}

function PatchEffectsDelayScreenContent({
  navigation,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "DLY">) {
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
      <RemoteFieldSwitchedSection page={PATCH} field={sendsAndEq.delaySwitch}>
        <ThemedCard>
          <Section heading="Delay Delay" noBorder>
            <RemoteFieldPicker page={PATCH} field={sendsAndEq.delayType} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.delayTime} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.delayFeedback} />
            <RemoteFieldSlider
              page={PATCH}
              field={sendsAndEq.delayEffectLevel}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Send Levels" noBorder>
            <RemoteFieldSlider page={PATCH} field={mfx.mfxDelaySendLevel} />
            <RemoteFieldSlider
              page={PATCH}
              field={ampModNs.modDelaySendLevel}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={common.bypassDelaySendLevel}
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
