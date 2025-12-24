import { useNavigation } from "@react-navigation/native";
import React, { useState, useCallback, useContext, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { useAssignsMap } from "../../hooks/useAssignsMap";
import { useRemoteField } from "../../hooks/useRemoteField";
import { FieldReference, NumericField } from "../../lib/RolandAddressMap";
import { AssignDefinition, AssignsMap } from "../../lib/RolandGR55Assigns";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useRolandGR55Assigns } from "../../lib/roland-gr55/RolandGR55AssignsContainer";
import { RolandGR55NotConnectedView } from "../../lib/roland-gr55/RolandGR55NotConnectedView";
import { MIDINotAvailableView } from "../../screens/MIDINotAvailableView";
import { useMidiIoContext } from "../../services/MidiIo";
import { ContextualStyleProvider } from "../../styles/ContextualStyle";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";
import { PopoverAwareScrollView } from "../PopoverAwareScrollView";
import { RefreshControl } from "../RefreshControl";
import { useTheme } from "../Theme";
import { ThemedText } from "../ThemedText";
import { PatchAssignsTabParamList } from "../navigation";
import { RemoteFieldDynamic } from "../remote-fields/RemoteFieldDynamic";
import { RemoteFieldPicker } from "../remote-fields/RemoteFieldPicker";
import { RemoteFieldSlider } from "../remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitchedSection } from "../remote-fields/RemoteFieldSwitchedSection";
import { RemoteFieldWaveShapePicker } from "../remote-fields/RemoteFieldWaveShapePicker";

const assignsByRouteName = {
  Assign1: GR55.temporaryPatch.common.assign1,
  Assign2: GR55.temporaryPatch.common.assign2,
  Assign3: GR55.temporaryPatch.common.assign3,
  Assign4: GR55.temporaryPatch.common.assign4,
  Assign5: GR55.temporaryPatch.common.assign5,
  Assign6: GR55.temporaryPatch.common.assign6,
  Assign7: GR55.temporaryPatch.common.assign7,
  Assign8: GR55.temporaryPatch.common.assign8,
};

// Individual assign screen component
function PatchAssignScreen({
  assignKey,
}: {
  assignKey: keyof PatchAssignsTabParamList;
}) {
  const { reloadData } = useContext(PATCH);
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();
  const theme = useTheme();
  const assignsMap = useAssignsMap()!;
  const assign = assignsByRouteName[assignKey];

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[
        { backgroundColor: theme.colors.assigns.background },
        styles.container,
      ]}
      contentContainerStyle={safeAreaStyle}
    >
      <ContextualStyleProvider
        value={{
          backgroundColor: theme.colors.assigns.background,
        }}
      >
        <AssignSection assignsMap={assignsMap} assign={assign} />
      </ContextualStyleProvider>
    </PopoverAwareScrollView>
  );
}

// Helper functions from original file
function useAssignTargetRangeField(
  assignDef: AssignDefinition,
  minOrMaxField: FieldReference<NumericField>,
  isMax: boolean
) {
  const reinterpretedField = useMemo(() => {
    return assignDef.reinterpretAssignValueField(minOrMaxField);
  }, [assignDef, minOrMaxField]);
  return { field: reinterpretedField };
}

function useAssign(
  assignsMap: AssignsMap,
  assign: typeof GR55.temporaryPatch.common.assign1,
  target: number
) {
  const assignDef = assignsMap.getByIndex(target);
  const { field: targetMinField } = useAssignTargetRangeField(
    assignDef,
    assign.targetMin,
    false
  );
  const { field: targetMaxField } = useAssignTargetRangeField(
    assignDef,
    assign.targetMax,
    true
  );
  return { targetMinField, targetMaxField, assignDef };
}

function useAssignTargetField(
  assignsMap: AssignsMap,
  targetField: FieldReference<NumericField>
) {
  return useMemo(
    () => assignsMap.reinterpretTargetField(targetField),
    [assignsMap, targetField]
  );
}

function AssignSection({
  assign,
  assignsMap,
}: {
  assign: typeof GR55.temporaryPatch.common.assign1;
  assignsMap: AssignsMap;
}) {
  const { setAssignTarget } = useRolandGR55Assigns();
  const [source, setSource] = useRemoteField(PATCH, assign.source);
  const [target, setTarget] = useRemoteField(PATCH, assign.target);
  const targetField = useAssignTargetField(assignsMap, assign.target);
  const { targetMinField, targetMaxField } = useAssign(
    assignsMap,
    assign,
    target
  );

  const handleTargetChange = useCallback(
    (nextTarget: number) => {
      setAssignTarget(assign, nextTarget);
      setTarget(nextTarget);
    },
    [setAssignTarget, assign, setTarget]
  );

  return (
    <>
      <RemoteFieldSwitchedSection
        page={PATCH}
        field={assign.switch}
        key={assign.address}
      >
        <RemoteFieldPicker
          page={PATCH}
          field={targetField}
          value={target}
          onValueChange={handleTargetChange}
        />
        <RemoteFieldDynamic
          page={PATCH}
          field={targetMinField}
          key={target + "min"}
        />
        <RemoteFieldDynamic
          page={PATCH}
          field={targetMaxField}
          key={target + "max"}
        />
        <RemoteFieldPicker
          page={PATCH}
          field={assign.source}
          value={source}
          onValueChange={setSource}
        />
        <RemoteFieldPicker page={PATCH} field={assign.sourceMode} />
        <RemoteFieldSlider page={PATCH} field={assign.activeRangeLo} />
        <RemoteFieldSlider page={PATCH} field={assign.activeRangeHi} />
        {source === "INT PDL" && (
          <>
            <RemoteFieldPicker
              page={PATCH}
              field={assign.internalPedalTrigger}
            />
            <RemoteFieldSlider page={PATCH} field={assign.internalPedalTime} />
            <RemoteFieldPicker page={PATCH} field={assign.internalPedalCurve} />
          </>
        )}
        {source === "WAVE PDL" && (
          <>
            <RemoteFieldSlider page={PATCH} field={assign.wavePedalRate} />
            <RemoteFieldWaveShapePicker
              page={PATCH}
              field={assign.wavePedalForm}
            />
          </>
        )}
      </RemoteFieldSwitchedSection>
    </>
  );
}

// Wrapper components for each assign
function Assign1Wrapper() {
  return <PatchAssignScreen assignKey="Assign1" />;
}

function Assign2Wrapper() {
  return <PatchAssignScreen assignKey="Assign2" />;
}

function Assign3Wrapper() {
  return <PatchAssignScreen assignKey="Assign3" />;
}

function Assign4Wrapper() {
  return <PatchAssignScreen assignKey="Assign4" />;
}

function Assign5Wrapper() {
  return <PatchAssignScreen assignKey="Assign5" />;
}

function Assign6Wrapper() {
  return <PatchAssignScreen assignKey="Assign6" />;
}

function Assign7Wrapper() {
  return <PatchAssignScreen assignKey="Assign7" />;
}

function Assign8Wrapper() {
  return <PatchAssignScreen assignKey="Assign8" />;
}

// Custom tab label component
function AssignTabLabel({
  assigned,
  children,
  color,
  focused,
}: {
  assigned: boolean;
  children: React.ReactNode;
  focused: boolean;
  color: string;
}) {
  return (
    <ThemedText
      style={[
        tabLabelStyles.label,
        { color },
        assigned && tabLabelStyles.labelAssigned,
      ]}
    >
      {children}
    </ThemedText>
  );
}

const tabs: {
  key: keyof PatchAssignsTabParamList;
  title: string;
  component: React.ComponentType<any>;
}[] = [
  { key: "Assign1", title: "1", component: Assign1Wrapper },
  { key: "Assign2", title: "2", component: Assign2Wrapper },
  { key: "Assign3", title: "3", component: Assign3Wrapper },
  { key: "Assign4", title: "4", component: Assign4Wrapper },
  { key: "Assign5", title: "5", component: Assign5Wrapper },
  { key: "Assign6", title: "6", component: Assign6Wrapper },
  { key: "Assign7", title: "7", component: Assign7Wrapper },
  { key: "Assign8", title: "8", component: Assign8Wrapper },
];

export function PatchAssignsCustomNavigation(): JSX.Element {
  const [activeTab, setActiveTab] =
    useState<keyof PatchAssignsTabParamList>("Assign1");
  const theme = useTheme();
  const assignsMap = useAssignsMap();
  const navigation = useNavigation();
  const { midiStatus } = useMidiIoContext();

  // Get assign switch states for tab styling
  const [assign1Switch] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign1.switch
  );
  const [assign2Switch] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign2.switch
  );
  const [assign3Switch] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign3.switch
  );
  const [assign4Switch] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign4.switch
  );
  const [assign5Switch] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign5.switch
  );
  const [assign6Switch] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign6.switch
  );
  const [assign7Switch] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign7.switch
  );
  const [assign8Switch] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign8.switch
  );

  const getAssignedState = useCallback(
    (tabTitle: string) => {
      return (
        (tabTitle === "1" && assign1Switch) ||
        (tabTitle === "2" && assign2Switch) ||
        (tabTitle === "3" && assign3Switch) ||
        (tabTitle === "4" && assign4Switch) ||
        (tabTitle === "5" && assign5Switch) ||
        (tabTitle === "6" && assign6Switch) ||
        (tabTitle === "7" && assign7Switch) ||
        (tabTitle === "8" && assign8Switch)
      );
    },
    [
      assign1Switch,
      assign2Switch,
      assign3Switch,
      assign4Switch,
      assign5Switch,
      assign6Switch,
      assign7Switch,
      assign8Switch,
    ]
  );

  if (midiStatus === "not-supported" || midiStatus === "permission-denied") {
    return <MIDINotAvailableView reason={midiStatus} />;
  }

  if (!assignsMap) {
    return <RolandGR55NotConnectedView navigation={navigation as any} />;
  }

  const ActiveComponent =
    tabs.find((tab) => tab.key === activeTab)?.component || Assign1Wrapper;

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.colors.assigns.tabBarBackground },
        ]}
      >
        {tabs.map((tab) => {
          const isAssigned = getAssignedState(tab.title);
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                  isAssigned && styles.assignedTabText,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Tab Indicator */}
      <View style={styles.indicator} />

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
    backgroundColor: "#ffffff",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    height: 50,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#f0f0f0",
  },
  tabText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
    textTransform: "uppercase",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  assignedTabText: {
    fontWeight: "bold",
  },
  indicator: {
    height: 3,
    backgroundColor: "#007AFF",
    width: "100%",
  },
  content: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

const tabLabelStyles = StyleSheet.create({
  label: {
    textAlign: "center",
    textTransform: "uppercase",
    fontSize: 18,
    margin: 4,
    backgroundColor: "transparent",
  },
  labelAssigned: {
    fontWeight: "bold",
    fontSize: 18,
  },
});
