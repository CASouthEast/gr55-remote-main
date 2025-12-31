import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useContext } from "react";
import { StyleSheet } from "react-native";

import { PopoverAwareScrollView } from "../../components/PopoverAwareScrollView";
import { RefreshControl } from "../../components/RefreshControl";
import { ThemeVariantProvider, useThemedColors } from "../../components/Theme";
import { Section } from "../../components/fields/Section";
import { PatchEffectsTabParamList } from "../../components/navigation";
import { RemoteFieldSlider } from "../../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitchedSection } from "../../components/remote-fields/RemoteFieldSwitchedSection";
import { ThemedCard } from "../../components/ui/ThemedCard";
import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";

export function PatchEffectsNSScreen(
  props: MaterialTopTabScreenProps<PatchEffectsTabParamList, "NS">
) {
  return (
    <ThemeVariantProvider variant="orange">
      <PatchEffectsNSScreenContent {...props} />
    </ThemeVariantProvider>
  );
}

function PatchEffectsNSScreenContent({
  navigation,
  route,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "NS">) {
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
      <RemoteFieldSwitchedSection
        page={PATCH}
        field={GR55.temporaryPatch.ampModNs.nsSwitch}
      >
        <ThemedCard>
          <Section heading="Noise Suppressor" noBorder>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.nsThreshold}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.nsReleaseTime}
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
