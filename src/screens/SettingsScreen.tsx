import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@rneui/themed";
import { useCallback, useContext, useEffect } from "react";
import { Platform, StyleSheet, Switch, View } from "react-native";

import { PopoverAwareScrollView } from "../components/PopoverAwareScrollView";
import { ThemeVariantProvider, useThemedColors } from "../components/Theme";
import { ThemedPicker as Picker } from "../components/ThemedPicker";
import { useUserOptions } from "../components/UserOptions";
import { FieldRow } from "../components/fields/FieldRow";
import { Section } from "../components/fields/Section";
import { SetupStackParamList } from "../components/navigation";
import { ThemedCard } from "../components/ui/ThemedCard";
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
  const baseTheme = useTheme();

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
              color={tintColor ?? baseTheme.colors.primary}
            />
          </Button>
        ),
      });
    }
  }, [navigation, baseTheme.colors.primary]);

  return (
    <ThemeVariantProvider variant="neutral">
      <SettingsScreenContent
        navigation={navigation}
        inputs={inputs}
        outputs={outputs}
        currentInputId={currentInputId}
        setCurrentInputId={setCurrentInputId}
        currentOutputId={currentOutputId}
        setCurrentOutputId={setCurrentOutputId}
        rolandIoSetupContext={rolandIoSetupContext}
        userOptions={userOptions}
        toggleTabVisibility={toggleTabVisibility}
        setWebTabBarPosition={setWebTabBarPosition}
        setEnableExperimentalFeatures={setEnableExperimentalFeatures}
        safeAreaStyle={safeAreaStyle}
      />
    </ThemeVariantProvider>
  );
}

const canShowBluetoothSettings =
  Platform.OS === "ios" || Platform.OS === "android";

function SettingsScreenContent({
  inputs,
  outputs,
  currentInputId,
  setCurrentInputId,
  currentOutputId,
  setCurrentOutputId,
  rolandIoSetupContext,
  userOptions,
  toggleTabVisibility,
  setWebTabBarPosition,
  setEnableExperimentalFeatures,
  safeAreaStyle,
}: any) {
  const colors = useThemedColors();

  return (
    <PopoverAwareScrollView
      style={[safeAreaStyle, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.cardWrapper}>
        <ThemedCard>
          <Section heading="Navigation">
            <FieldRow description="Show Patch Tab">
              <Switch
                value={userOptions.visibleTabs.patch}
                onValueChange={() => toggleTabVisibility("patch")}
              />
            </FieldRow>
            <FieldRow description="Show Library Tab">
              <Switch
                value={userOptions.visibleTabs.library}
                onValueChange={() => toggleTabVisibility("library")}
              />
            </FieldRow>
            <FieldRow description="Show System Tab">
              <Switch
                value={userOptions.visibleTabs.system}
                onValueChange={() => toggleTabVisibility("system")}
              />
            </FieldRow>
          </Section>
        </ThemedCard>

        {Platform.OS === "web" && (
          <ThemedCard>
            <Section heading="Appearance (Web)">
              <FieldRow description="Menu Position">
                <Picker
                  selectedValue={userOptions.webTabBarPosition}
                  onValueChange={(val) =>
                    setWebTabBarPosition(val as "top" | "bottom")
                  }
                >
                  <Picker.Item label="Top" value="top" />
                  <Picker.Item label="Bottom" value="bottom" />
                </Picker>
              </FieldRow>
            </Section>
          </ThemedCard>
        )}

        <ThemedCard>
          <Section heading="MIDI Connections">
            {inputs && outputs && (
              <>
                <FieldRow description="Input">
                  <Picker
                    onValueChange={setCurrentInputId}
                    selectedValue={currentInputId}
                  >
                    {[...inputs.entries()].map(
                      ([key, input]: [string, any]) => (
                        <Picker.Item label={input.name} key={key} value={key} />
                      )
                    )}
                  </Picker>
                </FieldRow>
                <FieldRow description="Output">
                  <Picker
                    onValueChange={setCurrentOutputId}
                    selectedValue={currentOutputId}
                  >
                    {[...outputs.entries()].map(
                      ([key, output]: [string, any]) => (
                        <Picker.Item
                          label={output.name}
                          key={key}
                          value={key}
                        />
                      )
                    )}
                  </Picker>
                </FieldRow>
              </>
            )}
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Device">
            <FieldRow description="Connected devices">
              <Picker
                onValueChange={rolandIoSetupContext.setSelectedDeviceKey}
                selectedValue={rolandIoSetupContext.selectedDeviceKey}
              >
                {[...rolandIoSetupContext.connectedDevices.entries()].map(
                  ([key, device]: [string, any]) => {
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
            </FieldRow>
          </Section>
        </ThemedCard>

        <ThemedCard>
          <Section heading="Advanced">
            <FieldRow description="Include fake GR-55">
              <Switch
                onValueChange={rolandIoSetupContext.setIncludeFakeDevice}
                value={rolandIoSetupContext.includeFakeDevice}
              />
            </FieldRow>
            <FieldRow description="Enable experimental options 🧪">
              <Switch
                onValueChange={setEnableExperimentalFeatures}
                value={userOptions.enableExperimentalFeatures}
              />
            </FieldRow>
          </Section>
        </ThemedCard>
      </View>
    </PopoverAwareScrollView>
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
