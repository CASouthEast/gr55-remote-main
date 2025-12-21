import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { DrawerToggleButton } from "@react-navigation/drawer";
import {
  StackActions,
  useNavigation,
  useTheme as useNavigationTheme,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { MIDINotAvailableView } from "../MIDINotAvailableView";
import { useMidiIoContext } from "../MidiIo";
import { PatchNameHeaderButton } from "../PatchNameHeaderButton";
import { PendingTextPlaceholder } from "../PendingContentPlaceholders";
import { PopoverAwareScrollView } from "../PopoverAwareScrollView";
import { usePopovers } from "../Popovers";
import { RefreshControl } from "../RefreshControl";
import { RemoteFieldSlider } from "../RemoteFieldSlider";
import { RemoteFieldSwitch } from "../RemoteFieldSwitch";
import {
  BooleanField,
  FieldReference,
  FieldType,
  NumericField,
} from "../RolandAddressMap";
import { RolandGR55AddressMapAbsolute as GR55 } from "../RolandGR55AddressMap";
import { RolandGR55NotConnectedView } from "../RolandGR55NotConnectedView";
import { RolandIoSetupContext } from "../RolandIoSetup";
import {
  RolandRemotePatchContext as PATCH,
  RolandRemoteSystemContext as SYSTEM,
  RolandRemotePageContext,
} from "../RolandRemotePageContext";
import { useMainScrollViewSafeAreaStyle } from "../SafeAreaUtils";
import { ThemedText as Text } from "../ThemedText";
import {
  GlobalNavigationProp,
  PatchStackParamList,
  RootTabParamList,
} from "../navigation/navigation";
import { useRemoteField } from "../useRemoteField";

export function PatchMainScreen({
  navigation,
}: NativeStackScreenProps<
  PatchStackParamList,
  "PatchMain",
  "RootTab" | "PatchDrawer" | "PatchStack"
>) {
  const { selectedDevice } = useContext(RolandIoSetupContext) as any;
  const [patchName, setPatchName, patchNameStatus] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.patchName
  );
  const theme = useNavigationTheme();

  useEffect(() => {
    const renderHeaderTitle = ({
      children,
      tintColor,
    }: {
      children: React.ReactNode;
      tintColor?: string | undefined;
    }) => {
      return (
        <PatchNameHeaderButton
          tintColor={tintColor}
          patchName={patchName}
          setPatchName={setPatchName}
        >
          {patchName ?? "GR-55 Editor"}
        </PatchNameHeaderButton>
      );
    };
    // TODO: Refactor to avoid duplication with all the other screens
    if (patchNameStatus === "pending") {
      navigation.setOptions({
        headerTitle() {
          return <PendingTextPlaceholder chars={16} />;
        },
      });
    } else if (selectedDevice && patchName) {
      navigation.setOptions({
        headerTitle: renderHeaderTitle,
        // TODO: Global solution for forking headerTitle (with patch name) from title (without patch name)
        title: "Overview",
      });
    } else {
      navigation.setOptions({
        headerTitle: renderHeaderTitle,
        title: "Overview",
      });
    }
    navigation.setOptions({
      headerLeft: () =>
        selectedDevice ? (
          <DrawerToggleButton tintColor={theme.colors.primary} />
        ) : (
          <DrawerToggleButton
            // @ts-expect-error DrawerToggleButton passes props to Pressable which supports `disabled`
            disabled
            tintColor={theme.colors.border}
          />
        ),
    });
  }, [
    navigation,
    patchName,
    patchNameStatus,
    selectedDevice,
    setPatchName,
    theme.colors,
  ]);

  // TODO: Also reload SYSTEM page on manual refresh
  const { reloadData } = useContext(PATCH) as any;

  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  const { midiStatus } = useMidiIoContext();
  if (midiStatus === "not-supported" || midiStatus === "permission-denied") {
    return <MIDINotAvailableView reason={midiStatus} />;
  }

  if (!selectedDevice) {
    return <RolandGR55NotConnectedView navigation={navigation} />;
  }

  const styles = StyleSheet.create({ container: { flex: 1 } });

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={[styles.container]}
      contentContainerStyle={safeAreaStyle}
    >
      {/* Screen content omitted for brevity in src copy; original file preserved at root as re-export */}
    </PopoverAwareScrollView>
  );
}
