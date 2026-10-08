import React, { useState, useContext, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, Button } from "react-native";

import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { useRemoteField } from "../../hooks/useRemoteField";
import {
  BooleanField,
  EnumField,
  FieldDefinition,
  FieldReference,
  isBooleanField,
  isEnumField,
  isNumericField,
  NumericField,
} from "../../lib/RolandAddressMap";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";
import { PopoverAwareScrollView } from "../PopoverAwareScrollView";
import { RefreshControl } from "../RefreshControl";
import { ThemeVariantProvider, useThemedColors } from "../Theme";
import { ThemedText as Text } from "../ThemedText";
import { Section } from "../fields/Section";
import { PatchMasterPedalGkCtlTabParamList } from "../navigation";
import { RemoteFieldDynamic } from "../remote-fields/RemoteFieldDynamic";
import { RemoteFieldPicker } from "../remote-fields/RemoteFieldPicker";
import { RemoteFieldSlider } from "../remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitch } from "../remote-fields/RemoteFieldSwitch";
import { ThemedCard } from "../ui/ThemedCard";

// Helper functions from original file
function useModControlField(minOrMaxField: FieldReference<NumericField>) {
  const [modType] = useRemoteField(PATCH, GR55.temporaryPatch.ampModNs.modType);
  return useMemo(() => {
    let controlledField: FieldReference<
      | NumericField
      | EnumField<{ [encoded: number]: number | string }>
      | BooleanField
    >;
    switch (modType) {
      case "OD/DS":
        controlledField = GR55.temporaryPatch.ampModNs.odDsDrive;
        break;
      case "WAH":
        controlledField = GR55.temporaryPatch.ampModNs.wahPedalPosition;
        break;
      case "COMP":
        controlledField = GR55.temporaryPatch.ampModNs.compSustain;
        break;
      case "LIMITER":
        controlledField = GR55.temporaryPatch.ampModNs.limiterThreshold;
        break;
      case "OCTAVE":
        controlledField = GR55.temporaryPatch.ampModNs.octaveOctLevel;
        break;
      case "PHASER":
        controlledField = GR55.temporaryPatch.ampModNs.phaserRate;
        break;
      case "FLANGER":
        controlledField = GR55.temporaryPatch.ampModNs.flangerRate;
        break;
      case "TREMOLO":
        controlledField = GR55.temporaryPatch.ampModNs.tremoloRate;
        break;
      case "ROTARY":
        controlledField = GR55.temporaryPatch.ampModNs.rotarySelect;
        break;
      case "UNI-V":
        controlledField = GR55.temporaryPatch.ampModNs.uniVRate;
        break;
      case "PAN":
        controlledField = GR55.temporaryPatch.ampModNs.panRate;
        break;
      case "DELAY":
        controlledField = GR55.temporaryPatch.ampModNs.delayEffectLevel;
        break;
      case "CHORUS":
        controlledField = GR55.temporaryPatch.ampModNs.chorusEffectLevel;
        break;
      case "EQ":
        controlledField = GR55.temporaryPatch.ampModNs.eqHighMidCutoffFreq;
        break;
    }

    let remappedType;
    if (isNumericField(controlledField.definition.type)) {
      const { type } = controlledField.definition;
      const { min, max, encodedOffset, format } = type;
      remappedType = minOrMaxField.definition.type.remapped({
        min,
        max,
        encodedOffset,
        format: format.bind(type),
      });
    } else if (isEnumField(controlledField.definition.type)) {
      const { type } = controlledField.definition;
      remappedType = new EnumField(type.labels, minOrMaxField.definition.type);
    } else if (isBooleanField(controlledField.definition.type)) {
      const { type } = controlledField.definition;
      remappedType = new EnumField(
        type.invertedForDisplay
          ? { 0: type.trueLabel, 1: type.falseLabel }
          : { 0: type.falseLabel, 1: type.trueLabel },
        minOrMaxField.definition.type.remapped({ encodedOffset: 0 })
      );
    }
    if (remappedType) {
      return {
        ...minOrMaxField,
        definition: new FieldDefinition(
          minOrMaxField.definition.offset,
          minOrMaxField.definition.description +
            " (" +
            controlledField.definition.description +
            ")",
          remappedType
        ),
      };
    }
    throw new Error('Unhandled mod type "' + modType + '"');
  }, [minOrMaxField, modType]);
}

// Button config screen component
function ButtonConfigScreen({
  button,
  title,
}: {
  button:
    | typeof GR55.temporaryPatch.common.ctl
    | typeof GR55.temporaryPatch.common.expSw
    | typeof GR55.temporaryPatch.common.gkS1
    | typeof GR55.temporaryPatch.common.gkS2;
  title: string;
}) {
  const { reloadData } = useContext(PATCH);
  const colors = useThemedColors();
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();
  const [function_, setFunction] = useRemoteField(PATCH, button.function);

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[safeAreaStyle, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedCard>
        <Section heading={title} noBorder>
          {"status" in button && (
            <RemoteFieldSwitch page={PATCH} field={button.status} />
          )}
          <RemoteFieldPicker
            page={PATCH}
            field={button.function}
            value={function_}
            onValueChange={setFunction}
          />
          {"holdType" in button && function_ === "HOLD" && (
            <>
              <RemoteFieldPicker page={PATCH} field={button.holdType} />
              <RemoteFieldPicker page={PATCH} field={button.holdSwitchMode} />
              <RemoteFieldSwitch page={PATCH} field={button.holdPcmTone1} />
              <RemoteFieldSwitch page={PATCH} field={button.holdPcmTone2} />
            </>
          )}
          {function_ === "TONE SW" && (
            <>
              <RemoteFieldSwitch
                page={PATCH}
                field={button.offPcmTone1Switch}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={button.offPcmTone2Switch}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={button.offModelingToneSwitch}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={button.offNormalPuSwitch}
              />
              <RemoteFieldSwitch page={PATCH} field={button.onPcmTone1Switch} />
              <RemoteFieldSwitch page={PATCH} field={button.onPcmTone2Switch} />
              <RemoteFieldSwitch
                page={PATCH}
                field={button.onModelingToneSwitch}
              />
              <RemoteFieldSwitch page={PATCH} field={button.onNormalPuSwitch} />
            </>
          )}
        </Section>
      </ThemedCard>
    </PopoverAwareScrollView>
  );
}

// Pedal or knob config screen component
function PedalOrKnobConfigScreen({
  pedalOrKnob,
  modControlMinField,
  modControlMaxField,
  title,
}: {
  pedalOrKnob:
    | typeof GR55.temporaryPatch.common.expPdlOff
    | typeof GR55.temporaryPatch.common.expPdlOn
    | typeof GR55.temporaryPatch.common.gkVol;
  modControlMinField: FieldReference<NumericField>;
  modControlMaxField: FieldReference<NumericField>;
  title: string;
}) {
  const { reloadData } = useContext(PATCH);
  const colors = useThemedColors();
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();
  const [function_, setFunction] = useRemoteField(PATCH, pedalOrKnob.function);

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[safeAreaStyle, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedCard>
        <Section heading={title} noBorder>
          <RemoteFieldPicker
            page={PATCH}
            field={pedalOrKnob.function}
            value={function_}
            onValueChange={setFunction}
          />
          {function_ === "TONE VOLUME" && (
            <>
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.volumeSwitchPCMTone1}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.volumeSwitchPCMTone2}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.volumeSwitchModelingTone}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.volumeSwitchNormalPU}
              />
            </>
          )}
          {function_ === "PITCH BEND" && (
            <>
              <RemoteFieldSlider page={PATCH} field={pedalOrKnob.bendRange} />
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.bendSwitchPCMTone1}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.bendSwitchPCMTone2}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.bendSwitchModelingTone}
              />
            </>
          )}
          {function_ === "MODULATION" && (
            <>
              <RemoteFieldSlider
                page={PATCH}
                field={pedalOrKnob.modulationMin}
              />
              <RemoteFieldSlider
                page={PATCH}
                field={pedalOrKnob.modulationMax}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.modulationSwitchPCMTone1}
              />
              <RemoteFieldSwitch
                page={PATCH}
                field={pedalOrKnob.modulationSwitchPCMTone2}
              />
            </>
          )}
          {function_ === "CROSS FADER" && (
            <>
              <RemoteFieldPicker
                page={PATCH}
                field={pedalOrKnob.xfadePolarityPCMTone1}
              />
              <RemoteFieldPicker
                page={PATCH}
                field={pedalOrKnob.xfadePolarityPCMTone2}
              />
              <RemoteFieldPicker
                page={PATCH}
                field={pedalOrKnob.xfadePolarityModelingTone}
              />
              <RemoteFieldPicker
                page={PATCH}
                field={pedalOrKnob.xfadePolarityNormalPU}
              />
            </>
          )}
          {function_ === "DELAY LEVEL" && (
            <>
              <RemoteFieldSlider
                page={PATCH}
                field={pedalOrKnob.delayLevelMin}
              />
              <RemoteFieldSlider
                page={PATCH}
                field={pedalOrKnob.delayLevelMax}
              />
            </>
          )}
          {function_ === "REVERB LEVEL" && (
            <>
              <RemoteFieldSlider
                page={PATCH}
                field={pedalOrKnob.reverbLevelMin}
              />
              <RemoteFieldSlider
                page={PATCH}
                field={pedalOrKnob.reverbLevelMax}
              />
            </>
          )}
          {function_ === "CHORUS LEVEL" && (
            <>
              <RemoteFieldSlider
                page={PATCH}
                field={pedalOrKnob.chorusLevelMin}
              />
              <RemoteFieldSlider
                page={PATCH}
                field={pedalOrKnob.chorusLevelMax}
              />
            </>
          )}
          {function_ === "MOD CONTROL" && (
            <ModControlSection
              modControlMinField={modControlMinField}
              modControlMaxField={modControlMaxField}
            />
          )}
        </Section>
      </ThemedCard>
    </PopoverAwareScrollView>
  );
}

function ModControlSection({
  modControlMinField,
  modControlMaxField,
}: {
  modControlMinField: FieldReference<NumericField>;
  modControlMaxField: FieldReference<NumericField>;
}) {
  const reinterpretedModControlMinField =
    useModControlField(modControlMinField);
  const reinterpretedModControlMaxField =
    useModControlField(modControlMaxField);
  const [modType] = useRemoteField(PATCH, GR55.temporaryPatch.ampModNs.modType);

  return (
    <>
      <RemoteFieldDynamic
        page={PATCH}
        field={reinterpretedModControlMinField}
      />
      <RemoteFieldDynamic
        page={PATCH}
        field={reinterpretedModControlMaxField}
      />
      <View style={{ flex: 0, alignSelf: "flex-end" }}>
        <Button
          title={`MOD: ${modType} › `}
          onPress={() => {
            // TODO: Navigate to effects mod screen
            console.log("Navigate to effects mod screen");
          }}
        />
      </View>
    </>
  );
}

// Individual screen wrappers
function CtlWrapper() {
  return (
    <ButtonConfigScreen button={GR55.temporaryPatch.common.ctl} title="Ctl" />
  );
}

function ExpWrapper() {
  return (
    <PedalOrKnobConfigScreen
      pedalOrKnob={GR55.temporaryPatch.common.expPdlOff}
      modControlMinField={GR55.temporaryPatch.common.expPdlOffModControlMin}
      modControlMaxField={GR55.temporaryPatch.common.expPdlOffModControlMax}
      title="Exp"
    />
  );
}

function ExpOnWrapper() {
  return (
    <PedalOrKnobConfigScreen
      pedalOrKnob={GR55.temporaryPatch.common.expPdlOn}
      modControlMinField={GR55.temporaryPatch.common.expPdlOnModControlMin}
      modControlMaxField={GR55.temporaryPatch.common.expPdlOnModControlMax}
      title="Exp On"
    />
  );
}

function ExpSwWrapper() {
  return (
    <ButtonConfigScreen
      button={GR55.temporaryPatch.common.expSw}
      title="Exp Sw"
    />
  );
}

function GkS1Wrapper() {
  return (
    <ButtonConfigScreen
      button={GR55.temporaryPatch.common.gkS1}
      title="GK S1"
    />
  );
}

function GkS2Wrapper() {
  return (
    <ButtonConfigScreen
      button={GR55.temporaryPatch.common.gkS2}
      title="GK S2"
    />
  );
}

function GkVolWrapper() {
  return (
    <PedalOrKnobConfigScreen
      pedalOrKnob={GR55.temporaryPatch.common.gkVol}
      modControlMinField={GR55.temporaryPatch.common.gkVolModControlMin}
      modControlMaxField={GR55.temporaryPatch.common.gkVolModControlMax}
      title="GK Vol"
    />
  );
}

export const patchMasterPedalGkCtlTabs: {
  key: keyof PatchMasterPedalGkCtlTabParamList;
  title: string;
  component: React.ComponentType<any>;
}[] = [
  { key: "Ctl", title: "Ctl", component: CtlWrapper },
  { key: "Exp", title: "Exp", component: ExpWrapper },
  { key: "ExpOn", title: "Exp On", component: ExpOnWrapper },
  { key: "ExpSw", title: "Exp Sw", component: ExpSwWrapper },
  { key: "GkS1", title: "GK S1", component: GkS1Wrapper },
  { key: "GkS2", title: "GK S2", component: GkS2Wrapper },
  { key: "GkVol", title: "GK Vol", component: GkVolWrapper },
];

export function PatchMasterPedalGkCtlCustomNavigation(): JSX.Element {
  return (
    <ThemeVariantProvider variant="neutral">
      <PatchMasterPedalGkCtlCustomNavigationContent />
    </ThemeVariantProvider>
  );
}

function PatchMasterPedalGkCtlCustomNavigationContent(): JSX.Element {
  const [activeTab, setActiveTab] =
    useState<keyof PatchMasterPedalGkCtlTabParamList>("Ctl");
  const colors = useThemedColors();

  const ActiveComponent =
    patchMasterPedalGkCtlTabs.find((tab) => tab.key === activeTab)?.component ||
    CtlWrapper;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Tab Bar */}
      <View
        style={[styles.tabBar, { borderBottomColor: colors.accent + "33" }]}
      >
        {patchMasterPedalGkCtlTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && {
                backgroundColor: colors.accent + "11",
              },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && {
                  color: colors.accent,
                  fontWeight: "bold",
                },
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Tab Indicator */}
      <View style={[styles.indicator, { backgroundColor: colors.accent }]} />

      {/* Screen Content */}
      <View style={styles.content}>
        <ActiveComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    height: 50,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  indicator: {
    height: 3,
    width: "100%",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
});
