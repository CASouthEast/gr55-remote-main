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

const { sendsAndEq } = GR55.temporaryPatch;

export function PatchEffectsEQScreen(
  props: MaterialTopTabScreenProps<PatchEffectsTabParamList, "EQ">
) {
  return (
    <ThemeVariantProvider variant="lavender">
      <PatchEffectsEQScreenContent {...props} />
    </ThemeVariantProvider>
  );
}

function PatchEffectsEQScreenContent({
  navigation,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "EQ">) {
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
      <RemoteFieldSwitchedSection page={PATCH} field={sendsAndEq.eqSwitch}>
        <ThemedCard>
          <Section heading="Equalizer" noBorder>
            <RemoteFieldPicker
              page={PATCH}
              field={sendsAndEq.eqLowCutoffFreq}
            />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqLowGain} />
            <RemoteFieldPicker
              page={PATCH}
              field={sendsAndEq.eqLowMidCutoffFreq}
            />
            <RemoteFieldPicker page={PATCH} field={sendsAndEq.eqLowMidQ} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqLowMidGain} />
            <RemoteFieldPicker
              page={PATCH}
              field={sendsAndEq.eqHighMidCutoffFreq}
            />
            <RemoteFieldPicker page={PATCH} field={sendsAndEq.eqHighMidQ} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqHighMidGain} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqHighGain} />
            <RemoteFieldPicker
              page={PATCH}
              field={sendsAndEq.eqHighCutoffFreq}
            />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.eqLevel} />
            <RemoteFieldSlider page={PATCH} field={sendsAndEq.ezCharacter} />
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
