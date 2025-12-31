import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { PopoverAwareScrollView } from "../../components/PopoverAwareScrollView";
import { RefreshControl } from "../../components/RefreshControl";
import { ThemeVariantProvider, useThemedColors } from "../../components/Theme";
import { Section } from "../../components/fields/Section";
import { PatchEffectsTabParamList } from "../../components/navigation";
import { RemoteFieldPicker } from "../../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldSegmentedSwitch } from "../../components/remote-fields/RemoteFieldSegmentedSwitch";
import { RemoteFieldSlider } from "../../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitch } from "../../components/remote-fields/RemoteFieldSwitch";
import { RemoteFieldSwitchedSection } from "../../components/remote-fields/RemoteFieldSwitchedSection";
import { ThemedCard } from "../../components/ui/ThemedCard";
import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { useRemoteField } from "../../hooks/useRemoteField";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";

export function PatchEffectsAmpScreen(
  props: MaterialTopTabScreenProps<PatchEffectsTabParamList, "Amp">
) {
  return (
    <ThemeVariantProvider variant="orange">
      <PatchEffectsAmpScreenContent {...props} />
    </ThemeVariantProvider>
  );
}

function PatchEffectsAmpScreenContent({
  navigation,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "Amp">) {
  const { reloadData } = useContext(PATCH);
  const colors = useThemedColors();

  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  const [ampType, setAmpType] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.ampModNs.ampType
  );

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[safeAreaStyle, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <RemoteFieldSwitchedSection
        page={PATCH}
        field={GR55.temporaryPatch.ampModNs.ampSwitch}
      >
        <ThemedCard>
          <Section heading="Amp Model">
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampType}
              value={ampType}
              onValueChange={setAmpType}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampGain}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampLevel}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampGainSwitch}
            />
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Tone">
            <RemoteFieldSwitch
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampSoloSwitch}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampSoloLevel}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampBass}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampMiddle}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampTreble}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampPresence}
            />
            {ampType === "BOSS CLEAN" ||
            ampType === "JC-120" ||
            ampType === "JAZZ COMBO" ||
            ampType === "CLEAN TWIN" ||
            ampType === "PRO CRUNCH" ||
            ampType === "TWEED" ||
            ampType === "BOSS CRUNCH" ||
            ampType === "BLUES" ||
            ampType === "STACK CRUNCH" ||
            ampType === "BG LEAD" ||
            ampType === "BG DRIVE" ||
            ampType === "BG RHYTHM" ? (
              <RemoteFieldSwitch
                page={PATCH}
                field={GR55.temporaryPatch.ampModNs.ampBright}
              />
            ) : null}
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Speaker & Mic">
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampSpType}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampMicType}
            />
            <RemoteFieldSegmentedSwitch
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampMicDistance}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampMicPosition}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.ampMicLevel}
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
