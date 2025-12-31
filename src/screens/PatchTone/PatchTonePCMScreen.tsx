import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { PopoverAwareScrollView } from "../../components/PopoverAwareScrollView";
import { RefreshControl } from "../../components/RefreshControl";
import { ThemeVariantProvider, useThemedColors } from "../../components/Theme";
import { Section } from "../../components/fields/Section";
import { PatchToneTabParamList } from "../../components/navigation";
import { RemoteFieldPicker } from "../../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldPickerWithCategories } from "../../components/remote-fields/RemoteFieldPickerWithCategories";
import { RemoteFieldSlider } from "../../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitch } from "../../components/remote-fields/RemoteFieldSwitch";
import { RemoteFieldSwitchedSection } from "../../components/remote-fields/RemoteFieldSwitchedSection";
import { ThemedCard } from "../../components/ui/ThemedCard";
import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { rolandToneCategories } from "../../lib/RolandGR55ToneMap";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";

export function PatchTonePCMScreen(
  props: MaterialTopTabScreenProps<PatchToneTabParamList, "PCM1" | "PCM2">
) {
  return (
    <ThemeVariantProvider variant="neutral">
      <PatchTonePCMScreenContent {...props} />
    </ThemeVariantProvider>
  );
}

function PatchTonePCMScreenContent({
  navigation,
  route,
}: MaterialTopTabScreenProps<PatchToneTabParamList, "PCM1" | "PCM2">) {
  const { reloadData } = useContext(PATCH);
  const colors = useThemedColors();

  const pcmTonePage =
    route.name === "PCM1"
      ? GR55.temporaryPatch.patchPCMTone1
      : GR55.temporaryPatch.patchPCMTone2;

  const pcmToneOffsetPage =
    route.name === "PCM1"
      ? GR55.temporaryPatch.patchPCMTone1Offset
      : GR55.temporaryPatch.patchPCMTone2Offset;
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[safeAreaStyle, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <RemoteFieldSwitchedSection page={PATCH} field={pcmTonePage.muteSwitch}>
        <ThemedCard>
          <Section heading="Tone" noBorder>
            <RemoteFieldPickerWithCategories
              page={PATCH}
              field={pcmTonePage.toneSelect}
              categories={rolandToneCategories}
              shortDescription="Tone"
            />
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.partLevel} />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmTonePage.partOctaveShift}
            />
            <RemoteFieldSwitch page={PATCH} field={pcmTonePage.chromatic} />
            <RemoteFieldSwitch page={PATCH} field={pcmTonePage.legatoSwitch} />
            <RemoteFieldSwitch page={PATCH} field={pcmTonePage.nuanceSwitch} />
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.partPan} />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmTonePage.partCoarseTune}
            />
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.partFineTune} />
            <RemoteFieldPicker
              page={PATCH}
              field={pcmTonePage.partPortamentoSwitch}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmTonePage.portamentoTime}
            />
            <RemoteFieldPicker page={PATCH} field={pcmTonePage.releaseMode} />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="String Levels" noBorder>
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.string1Level} />
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.string2Level} />
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.string3Level} />
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.string4Level} />
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.string5Level} />
            <RemoteFieldSlider page={PATCH} field={pcmTonePage.string6Level} />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Velocity & Nuance" noBorder>
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvaLevelVelocitySensOffset}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={pcmToneOffsetPage.tvaLevelVelocityCurve}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.nuanceLevelSens}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.nuanceCutoffSens}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Filter (TVF)" noBorder>
            <RemoteFieldPicker
              page={PATCH}
              field={pcmToneOffsetPage.tvfFilterType}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfCutoffFrequencyOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfResonanceOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfCutoffVelocitySens}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={pcmToneOffsetPage.tvfCutoffVelocityCurve}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfCutoffKeyfollowOffset}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Filter Envelope" noBorder>
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfEnvDepthOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfEnvTime1Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfEnvTime2Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfEnvLevel3Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfEnvTime4Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfEnvTime1VelocitySensOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvfEnvTime1NuanceSensOffset}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Amplitude Envelope" noBorder>
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvaEnvTime1Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvaEnvTime2Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvaEnvLevel3Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvaEnvTime4Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvaEnvTime1VelocitySensOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.tvaEnvTime1NuanceSensOffset}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Pitch & Portamento" noBorder>
            <RemoteFieldPicker
              page={PATCH}
              field={pcmToneOffsetPage.partPortamentoType}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.pitchEnvVelocitySensOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.pitchEnvOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.pitchEnvTime1Offset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.pitchEnvTime2Offset}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="LFO 1" noBorder>
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo1Rate}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo1PitchDepthOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo1TVFDepthOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo1TVADepthOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo1PanDepthOffset}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="LFO 2" noBorder>
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo2Rate}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo2PitchDepthOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo2TVFDepthOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo2TVADepthOffset}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={pcmToneOffsetPage.lfo2PanDepthOffset}
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
