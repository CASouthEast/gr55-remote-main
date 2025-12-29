import { useTheme } from "@react-navigation/native";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { PopoverAwareScrollView } from "../components/PopoverAwareScrollView";
import { RefreshControl } from "../components/RefreshControl";
import { ThemedText as Text } from "../components/ThemedText";
import { RemoteFieldPicker } from "../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldSlider } from "../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitch } from "../components/remote-fields/RemoteFieldSwitch";
import { RolandRemoteSystemContext as SYSTEM } from "../contexts/RolandRemotePageContext";
import { RolandGR55AddressMapAbsolute as GR55 } from "../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../utils/SafeAreaUtils";

export function SystemScreen() {
  const { reloadData } = useContext(SYSTEM);
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();
  const theme = useTheme();

  const common = GR55.system.common;
  const ctl = GR55.system.ctl;

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={styles.container}
      contentContainerStyle={safeAreaStyle}
    >
      <Section heading="Global">
        <FieldRow label="Output Select">
          <RemoteFieldPicker page={SYSTEM} field={common.outputSelect} />
        </FieldRow>
        <FieldRow label="Mode (Guitar/Bass)">
          <RemoteFieldPicker page={SYSTEM} field={common.guitarBassSelect} />
        </FieldRow>
        <FieldRow label="GK Set">
          <RemoteFieldSlider page={SYSTEM} field={common.gkSetSelect} />
        </FieldRow>
        <FieldRow label="Patch Control Ch">
          <RemoteFieldSlider page={SYSTEM} field={common.patchControlChannel} />
        </FieldRow>
      </Section>

      <Section heading="Tuner">
        <FieldRow label="Pitch">
          <RemoteFieldSlider page={SYSTEM} field={common.tunerPitch} />
        </FieldRow>
        <FieldRow label="Mute">
          <RemoteFieldSwitch page={SYSTEM} field={common.tunerMuteSwitch} />
        </FieldRow>
      </Section>

      <Section heading="USB Audio">
        <FieldRow label="Direct Monitor">
          <RemoteFieldSwitch page={SYSTEM} field={common.usbDirectMonitor} />
        </FieldRow>
        <FieldRow label="In Level">
          <RemoteFieldSlider page={SYSTEM} field={common.usbAudioInLevel} />
        </FieldRow>
        <FieldRow label="Out Level">
          <RemoteFieldSlider page={SYSTEM} field={common.usbAudioOutLevel} />
        </FieldRow>
      </Section>

      <Section heading="Buttons & Pedals">
        <FieldRow label="CTL Function">
          <RemoteFieldPicker page={SYSTEM} field={ctl.ctlFunction} />
        </FieldRow>
        <FieldRow label="Exp Function">
          <RemoteFieldPicker page={SYSTEM} field={ctl.expFunction} />
        </FieldRow>
        <FieldRow label="GK S1 Function">
          <RemoteFieldPicker page={SYSTEM} field={ctl.gkS1Function} />
        </FieldRow>
        <FieldRow label="GK S2 Function">
          <RemoteFieldPicker page={SYSTEM} field={ctl.gkS2Function} />
        </FieldRow>
      </Section>
    </PopoverAwareScrollView>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionHeading,
          { borderBottomColor: theme.colors.border },
        ]}
      >
        {heading}
      </Text>
      {children}
    </View>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.fieldRow, { borderBottomColor: theme.colors.border }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    flex: 1,
    marginRight: 16,
  },
  fieldContent: {
    flex: 1.5,
    alignItems: "flex-end",
  },
});
