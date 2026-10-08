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
          <RemoteFieldSwitch page={SYSTEM} field={common.assignHold} />
          <RemoteFieldSwitch page={SYSTEM} field={common.rxSwitch} />
          <RemoteFieldSwitch page={SYSTEM} field={common.txSwitch} />
          <RemoteFieldPicker page={SYSTEM} field={common.rxMapSelect} />
          <RemoteFieldPicker
            page={SYSTEM}
            field={common.guitarOutSourceSelect}
          />
        </Section>
        <Section heading="Tuner">
          <RemoteFieldSlider page={SYSTEM} field={common.tunerPitch} />
          <RemoteFieldSwitch page={SYSTEM} field={common.tunerMuteSwitch} />
        </Section>
        <Section heading="USB Audio">
          <RemoteFieldSwitch page={SYSTEM} field={common.usbDirectMonitor} />
          <RemoteFieldSlider page={SYSTEM} field={common.usbAudioInLevel} />
          <RemoteFieldSlider page={SYSTEM} field={common.usbAudioOutLevel} />
        </Section>
      </ThemedCard>
    </SystemSectionWrapper>
  );
}

function SystemGuitarMidiSettings() {
  const common = GR55.system.common;
  return (
    <SystemSectionWrapper>
      <ThemedCard>
        <Section heading="Guitar to MIDI" noBorder>
          <RemoteFieldSwitch page={SYSTEM} field={common.guitarToMidiSwitch} />
          <RemoteFieldPicker page={SYSTEM} field={common.guitarToMidiMode} />
          <RemoteFieldSwitch
            page={SYSTEM}
            field={common.guitarToMidiChromatic}
          />
          <RemoteFieldPicker
            page={SYSTEM}
            field={common.guitarToMidiStringChannel}
          />
          <RemoteFieldSwitch
            page={SYSTEM}
            field={common.guitarToMidiDataThin}
          />
          <RemoteFieldSlider
            page={SYSTEM}
            field={common.guitarToMidiCtlPdlCc}
          />
          <RemoteFieldSlider
            page={SYSTEM}
            field={common.guitarToMidiExpPdlCc}
          />
          <RemoteFieldSlider
            page={SYSTEM}
            field={common.guitarToMidiExpPdlBendRange}
          />
          <RemoteFieldSlider page={SYSTEM} field={common.guitarToMidiGkVolCc} />
          <RemoteFieldSlider page={SYSTEM} field={common.guitarToMidiGkS1Cc} />
          <RemoteFieldSlider page={SYSTEM} field={common.guitarToMidiGkS2Cc} />
        </Section>
      </ThemedCard>
    </SystemSectionWrapper>
  );
}

function SystemControllerSettings() {
  const ctl = GR55.system.ctl;
  return (
    <SystemSectionWrapper>
      <ThemedCard>
        <Section heading="CTL Pedal" noBorder>
          <RemoteFieldPicker page={SYSTEM} field={ctl.ctlFunction} />
          <RemoteFieldSlider page={SYSTEM} field={ctl.ctlHoldType} />
          <RemoteFieldPicker page={SYSTEM} field={ctl.ctlHoldSwitchMode} />
          <RemoteFieldSwitch page={SYSTEM} field={ctl.ctlHoldPcmTone1} />
          <RemoteFieldSwitch page={SYSTEM} field={ctl.ctlHoldPcmTone2} />
        </Section>
        <Section heading="EXP Pedal OFF">
          <RemoteFieldPicker page={SYSTEM} field={ctl.expOffFunction} />
          <RemoteFieldSlider page={SYSTEM} field={ctl.expOffModMin} />
          <RemoteFieldSlider page={SYSTEM} field={ctl.expOffModMax} />
        </Section>
        <Section heading="EXP Pedal ON">
          <RemoteFieldPicker page={SYSTEM} field={ctl.expOnFunction} />
          <RemoteFieldSlider page={SYSTEM} field={ctl.expOnModMin} />
          <RemoteFieldSlider page={SYSTEM} field={ctl.expOnModMax} />
        </Section>
        <Section heading="GK Controllers">
          <RemoteFieldPicker page={SYSTEM} field={ctl.gkVolFunction} />
          <RemoteFieldPicker page={SYSTEM} field={ctl.gkS1Function} />
          <RemoteFieldPicker page={SYSTEM} field={ctl.gkS2Function} />
        </Section>
      </ThemedCard>
    </SystemSectionWrapper>
  );
}

function SystemGKSettings() {
  const gk = GR55.system.gkSet1; // TODO: Support selecting between 1-10 based on common.gkSetSelect
  return (
    <SystemSectionWrapper>
      <ThemedCard>
        <Section heading="GK Set 1" noBorder>
          <RemoteFieldSlider page={SYSTEM} field={gk.normalPuGain} />
          <RemoteFieldPicker page={SYSTEM} field={gk.puType} />
          <RemoteFieldSlider page={SYSTEM} field={gk.scale} />
          <RemoteFieldPicker page={SYSTEM} field={gk.puPhase} />
          <RemoteFieldPicker page={SYSTEM} field={gk.puDirection} />
          <RemoteFieldPicker page={SYSTEM} field={gk.s1s2Pos} />
          <RemoteFieldSlider page={SYSTEM} field={gk.piezoLow} />
          <RemoteFieldSlider page={SYSTEM} field={gk.piezoHigh} />
        </Section>
        <Section heading="String Distance">
          <RemoteFieldSlider page={SYSTEM} field={gk.string1Dist} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string2Dist} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string3Dist} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string4Dist} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string5Dist} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string6Dist} />
        </Section>
        <Section heading="String Sensitivity">
          <RemoteFieldSlider page={SYSTEM} field={gk.string1Sens} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string2Sens} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string3Sens} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string4Sens} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string5Sens} />
          <RemoteFieldSlider page={SYSTEM} field={gk.string6Sens} />
        </Section>
        <Section heading="Velocity">
          <RemoteFieldSlider page={SYSTEM} field={gk.velocityDynamics} />
          <RemoteFieldSlider page={SYSTEM} field={gk.velocityLowCut} />
          <RemoteFieldSlider page={SYSTEM} field={gk.pcmVelocitySens} />
        </Section>
        <Section heading="Nuance">
          <RemoteFieldSlider page={SYSTEM} field={gk.nuanceDynamics} />
          <RemoteFieldSlider page={SYSTEM} field={gk.nuanceTrim} />
        </Section>
        <Section heading="Tuning">
          <RemoteFieldSlider page={SYSTEM} field={gk.downTuning} />
        </Section>
      </ThemedCard>
    </SystemSectionWrapper>
  );
}

const systemTabs: SidebarTab[] = [
  { key: "Global", title: "Global", component: SystemGlobalSettings },
  { key: "MIDI", title: "Guitar to MIDI", component: SystemGuitarMidiSettings },
  { key: "Pedals", title: "Pedals/GK", component: SystemControllerSettings },
  { key: "GK", title: "GK Setup", component: SystemGKSettings },
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
