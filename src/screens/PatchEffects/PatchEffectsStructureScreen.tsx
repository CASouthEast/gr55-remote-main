import { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { PopoverAwareScrollView } from "../../components/PopoverAwareScrollView";
import { RefreshControl } from "../../components/RefreshControl";
import { ThemeVariantProvider, useThemedColors } from "../../components/Theme";
import { Section } from "../../components/fields/Section";
import { RemoteFieldPicker } from "../../components/remote-fields/RemoteFieldPicker";
import { ThemedCard } from "../../components/ui/ThemedCard";
import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";

const { common, patchPCMTone1, patchPCMTone2 } = GR55.temporaryPatch;

export function PatchEffectsStructureScreen() {
  return (
    <ThemeVariantProvider variant="lavender">
      <PatchEffectsStructureScreenContent />
    </ThemeVariantProvider>
  );
}

function PatchEffectsStructureScreenContent() {
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
      <ThemedCard>
        <Section heading="Structure" noBorder>
          <RemoteFieldPicker page={PATCH} field={common.effectStructure} />
          <Section heading="PCM 1 Output" noBorder>
            <RemoteFieldPicker
              page={PATCH}
              field={patchPCMTone1.partOutputMFXSelect}
            />
          </Section>
          <Section heading="PCM 2 Output" noBorder>
            <RemoteFieldPicker
              page={PATCH}
              field={patchPCMTone2.partOutputMFXSelect}
            />
          </Section>
          <RemoteFieldPicker page={PATCH} field={common.lineSelectModel} />
          <RemoteFieldPicker page={PATCH} field={common.lineSelectNormalPU} />
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
