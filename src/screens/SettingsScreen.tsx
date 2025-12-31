import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@rneui/themed";
import { useCallback, useContext, useEffect } from "react";
import { Platform, StyleSheet, Switch, View } from "react-native";

import {
  BluetoothSettingsScreen,
  canShowBluetoothSettings,
} from "./BluetoothSettingsScreen";
import { PopoverAwareScrollView } from "../components/PopoverAwareScrollView";
import { ThemedPicker as Picker } from "../components/ThemedPicker";
import { ThemedText as Text } from "../components/ThemedText";
import { useUserOptions } from "../components/UserOptions";
import { SetupStackParamList } from "../components/navigation";
import { RolandIoSetupContext } from "../lib/RolandIoSetup";
import { MidiIoSetupContext } from "../services/MidiIo";
import { useMainScrollViewSafeAreaStyle } from "../utils/SafeAreaUtils";

export function SettingsScreen({
  navigation,
}: NativeStackScreenProps<SetupStackParamList, "Settings", "SetupStack">) {
  const {
    inputs,
    outputs,
    setCurrentInputId,
    currentInputId,
    setCurrentOutputId,
    currentOutputId,
  } = useContext(MidiIoSetupContext);

  const rolandIoSetupContext = useContext(RolandIoSetupContext);
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();
  const [userOptions, setUserOptions] = useUserOptions();
  const theme = useTheme();

  const setEnableExperimentalFeatures = useCallback(
    (enableExperimentalFeatures: boolean) =>
      setUserOptions({ enableExperimentalFeatures }),
    [setUserOptions]
  );

  const setWebTabBarPosition = useCallback(
    (position: "top" | "bottom") =>
      setUserOptions({ webTabBarPosition: position }),
    [setUserOptions]
  );

  const toggleTabVisibility = useCallback(
    (tab: keyof typeof userOptions.visibleTabs) => {
      setUserOptions({
        visibleTabs: {
          ...userOptions.visibleTabs,
          [tab]: !userOptions.visibleTabs[tab],
        },
      });
    },
    [userOptions, setUserOptions]
  );

  useEffect(() => {
    if (canShowBluetoothSettings) {
      const navigateToBluetoothSettings = () => {
        navigation.navigate("BluetoothSettings", {});
      };
      navigation.setOptions({
        headerRight: ({ tintColor }) => (
          <Button type="clear" onPress={navigateToBluetoothSettings}>
            <MaterialCommunityIcons
              name="bluetooth"
              size={24}
              color={tintColor ?? theme.colors.primary}
            />
          </Button>
        ),
      });
    }
  }, [navigation, theme.colors.primary]);

  return (
    <PopoverAwareScrollView
      style={styles.container}
      contentContainerStyle={safeAreaStyle}
    >
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Navigation</Text>
        <View style={styles.row}>
          <Text>Show Patch Tab</Text>
          <Switch
            value={userOptions.visibleTabs.patch}
            onValueChange={() => toggleTabVisibility("patch")}
          />
        </View>
        <View style={styles.row}>
          <Text>Show Library Tab</Text>
          <Switch
            value={userOptions.visibleTabs.library}
            onValueChange={() => toggleTabVisibility("library")}
          />
        </View>
        <View style={styles.row}>
          <Text>Show System Tab</Text>
          <Switch
            value={userOptions.visibleTabs.system}
            onValueChange={() => toggleTabVisibility("system")}
          />
        </View>
      </View>

      {Platform.OS === "web" && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Appearance (Web)</Text>
          <View style={styles.row}>
            <Text>Menu Position</Text>
            <Picker
              selectedValue={userOptions.webTabBarPosition}
              onValueChange={(val) =>
                setWebTabBarPosition(val as "top" | "bottom")
              }
            >
              <Picker.Item label="Top" value="top" />
              <Picker.Item label="Bottom" value="bottom" />
            </Picker>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>MIDI Connections</Text>
        {inputs && outputs && (
          <>
            <Text style={styles.label}>Input</Text>
            <Picker
              onValueChange={setCurrentInputId}
              selectedValue={currentInputId}
            >
              {[...inputs.entries()].map(([key, input]) => (
                <Picker.Item label={input.name} key={key} value={key} />
              ))}
            </Picker>
            <Text style={styles.label}>Output</Text>
            <Picker
              onValueChange={setCurrentOutputId}
              selectedValue={currentOutputId}
            >
              {[...outputs.entries()].map(([key, output]) => (
                <Picker.Item label={output.name} key={key} value={key} />
              ))}
            </Picker>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Device</Text>
        <Text style={styles.label}>Connected devices</Text>
        <Picker
          onValueChange={rolandIoSetupContext.setSelectedDeviceKey}
          selectedValue={rolandIoSetupContext.selectedDeviceKey}
        >
          {[...rolandIoSetupContext.connectedDevices.entries()].map(
            ([key, device]) => {
              const deviceIdHexTag =
                "[0x" +
                device.identity.deviceId.toString(16).padStart(2, "0") +
                "]";

              return (
                <Picker.Item
                  label={deviceIdHexTag + " " + device.description}
                  key={key}
                  value={key}
                />
              );
            }
          )}
        </Picker>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Advanced</Text>
        <View style={styles.row}>
          <Text>Include fake GR-55</Text>
          <Switch
            onValueChange={rolandIoSetupContext.setIncludeFakeDevice}
            value={rolandIoSetupContext.includeFakeDevice}
          />
        </View>
        <View style={styles.row}>
          <Text>Enable experimental options 🧪</Text>
          <Switch
            onValueChange={setEnableExperimentalFeatures}
            value={userOptions.enableExperimentalFeatures}
          />
        </View>
      </View>
    </PopoverAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    opacity: 0.8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    marginBottom: 4,
    marginTop: 8,
  },
});
