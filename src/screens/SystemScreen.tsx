import { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { PopoverAwareScrollView } from "../components/PopoverAwareScrollView";
import { RefreshControl } from "../components/RefreshControl";
import { ThemeVariantProvider, useThemedColors } from "../components/Theme";
import { Section } from "../components/fields/Section";
import {
  SidebarPageLayout,
  SidebarTab,
} from "../components/navigation/SidebarPageLayout";
import { RemoteFieldPicker } from "../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldSlider } from "../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitch } from "../components/remote-fields/RemoteFieldSwitch";
import { ThemedCard } from "../components/ui/ThemedCard";
import { RolandRemoteSystemContext as SYSTEM } from "../contexts/RolandRemotePageContext";
import { RolandGR55AddressMapAbsolute as GR55 } from "../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../utils/SafeAreaUtils";

function SystemSectionWrapper({ children }: { children: React.ReactNode }) {
  const { reloadData } = useContext(SYSTEM);
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
      <View style={styles.cardWrapper}>{children}</View>
    </PopoverAwareScrollView>
  );
}

function SystemGlobalSettings() {
  const common = GR55.system.common;
  return (
    <SystemSectionWrapper>
      <ThemedCard>
        <Section heading="Global" noBorder>
          <RemoteFieldPicker page={SYSTEM} field={common.outputSelect} />
          <RemoteFieldPicker page={SYSTEM} field={common.guitarBassSelect} />
          <RemoteFieldSlider page={SYSTEM} field={common.gkSetSelect} />
          <RemoteFieldSlider page={SYSTEM} field={common.patchControlChannel} />
        </Section>
      </ThemedCard>
    </SystemSectionWrapper>
  );
}

function SystemTunerSettings() {
  const common = GR55.system.common;
  return (
    <SystemSectionWrapper>
      <ThemedCard>
        <Section heading="Tuner" noBorder>
          <RemoteFieldSlider page={SYSTEM} field={common.tunerPitch} />
          <RemoteFieldSwitch page={SYSTEM} field={common.tunerMuteSwitch} />
        </Section>
      </ThemedCard>
    </SystemSectionWrapper>
  );
}

function SystemUsbAudioSettings() {
  const common = GR55.system.common;
  return (
    <SystemSectionWrapper>
      <ThemedCard>
        <Section heading="USB Audio" noBorder>
          <RemoteFieldSwitch page={SYSTEM} field={common.usbDirectMonitor} />
          <RemoteFieldSlider page={SYSTEM} field={common.usbAudioInLevel} />
          <RemoteFieldSlider page={SYSTEM} field={common.usbAudioOutLevel} />
        </Section>
      </ThemedCard>
    </SystemSectionWrapper>
  );
}

function SystemButtonsPedalsSettings() {
  const ctl = GR55.system.ctl;
  return (
    <SystemSectionWrapper>
      <ThemedCard>
        <Section heading="Buttons & Pedals" noBorder>
          <RemoteFieldPicker page={SYSTEM} field={ctl.ctlFunction} />
          <RemoteFieldPicker page={SYSTEM} field={ctl.expFunction} />
          <RemoteFieldPicker page={SYSTEM} field={ctl.gkS1Function} />
          <RemoteFieldPicker page={SYSTEM} field={ctl.gkS2Function} />
        </Section>
      </ThemedCard>
    </SystemSectionWrapper>
  );
}

const systemTabs: SidebarTab[] = [
  { key: "Global", title: "Global", component: SystemGlobalSettings },
  { key: "Tuner", title: "Tuner", component: SystemTunerSettings },
  { key: "USB", title: "USB Audio", component: SystemUsbAudioSettings },
  {
    key: "Buttons",
    title: "Buttons/Pedal",
    component: SystemButtonsPedalsSettings,
  },
];

export function SystemScreen() {
  return (
    <ThemeVariantProvider variant="neutral">
      <SidebarPageLayout tabs={systemTabs} title="System" defaultTab="Global" />
    </ThemeVariantProvider>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 600,
  },
});
