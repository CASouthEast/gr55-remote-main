import { useTheme, useNavigation } from "@react-navigation/native";
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";

import { PopoverAwareScrollView } from "../components/PopoverAwareScrollView";
import { ThemedPicker as Picker } from "../components/ThemedPicker";
import { RolandIoSetupContext } from "../lib/RolandIoSetup";
import { MidiIoSetupContext } from "../services/MidiIo";
import { useMainScrollViewSafeAreaStyle } from "../utils/SafeAreaUtils";

export function ConnectScreen() {
  const {
    inputs,
    outputs,
    setCurrentInputId,
    currentInputId,
    setCurrentOutputId,
    currentOutputId,
  } = useContext(MidiIoSetupContext);

  const rolandIoSetupContext = useContext(RolandIoSetupContext);
  const theme = useTheme();
  const navigation = useNavigation();
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  // Check device connection and selection status
  const hasConnectedDevice = rolandIoSetupContext.connectedDevices.size > 0;
  const hasSelectedDevice = rolandIoSetupContext.selectedDeviceKey !== null;

  // Get the selected device to check its type
  const selectedDevice =
    hasSelectedDevice && rolandIoSetupContext.selectedDeviceKey
      ? rolandIoSetupContext.connectedDevices.get(
          rolandIoSetupContext.selectedDeviceKey
        )
      : null;

  // Check if selected device is a real GR-55 (0x10 device ID)
  const isRealGR55Selected = selectedDevice?.identity?.deviceId === 0x10;

  // Check if selected device is a fake GR-55
  const isFakeGR55Selected = hasSelectedDevice && !isRealGR55Selected;

  // Determine connection status and colors
  const connectionStatus = isRealGR55Selected
    ? "real"
    : isFakeGR55Selected
    ? "fake"
    : "none";

  const handleHardwareImagePress = () => {
    if (isRealGR55Selected) {
      navigation.navigate("Hardware" as never);
    }
  };

  return (
    <PopoverAwareScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[safeAreaStyle, styles.contentContainer]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Connect to GR-55
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Configure your MIDI connection
        </Text>
      </View>

      {/* Hardware Image */}
      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={handleHardwareImagePress}
          disabled={!isRealGR55Selected}
          style={[
            styles.imageButton,
            isRealGR55Selected && styles.imageButtonActive,
          ]}
          accessible
          accessibilityLabel={
            isRealGR55Selected
              ? "Connected real GR-55 hardware - tap to view hardware interface"
              : isFakeGR55Selected
              ? "Fake GR-55 selected - hardware interface not available"
              : "GR-55 hardware not connected"
          }
          accessibilityRole="button"
        >
          <Image
            source={
              isRealGR55Selected
                ? require("../../assets/gr-55-bk_top_gal.jpg")
                : isFakeGR55Selected
                ? require("../../assets/gr-55_blue.png")
                : require("../../assets/gr55-pixel-masked.png")
            }
            style={[
              styles.hardwareImage,
              connectionStatus === "none" && styles.blurredImage,
            ]}
            resizeMode="contain"
          />
          {connectionStatus === "none" && (
            <View style={styles.imageOverlay}>
              <Text style={styles.overlayText}>Not Connected</Text>
              <Text style={styles.overlaySubtext}>
                Configure MIDI to connect
              </Text>
            </View>
          )}
          {isRealGR55Selected && (
            <View style={[styles.imageOverlay, styles.connectedOverlay]}>
              <Text style={[styles.overlayText, styles.connectedText]}>
                ✓ Connected
              </Text>
              <Text style={[styles.overlaySubtext, styles.connectedSubtext]}>
                Tap to view hardware
              </Text>
            </View>
          )}
          {isFakeGR55Selected && (
            <View style={[styles.imageOverlay, styles.fakeOverlay]}>
              <Text style={[styles.overlayText, styles.fakeText]}>
                ⚠ Fake Device
              </Text>
              <Text style={[styles.overlaySubtext, styles.fakeSubtext]}>
                For testing only
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Connection Status */}
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: theme.colors.card,
            borderColor:
              connectionStatus === "real"
                ? "#10b981" // Green for real GR-55
                : connectionStatus === "fake"
                ? "#f59e0b" // Yellow for fake GR-55
                : theme.colors.border || "#374151", // Gray for no connection
          },
        ]}
      >
        <View style={styles.statusHeader}>
          <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
            Connection Status
          </Text>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  connectionStatus === "real"
                    ? "#10b981" // Green for real GR-55
                    : connectionStatus === "fake"
                    ? "#f59e0b" // Yellow for fake GR-55
                    : "#ef4444", // Red for no connection
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.statusText,
            {
              color:
                connectionStatus === "real"
                  ? "#10b981" // Green for real GR-55
                  : connectionStatus === "fake"
                  ? "#f59e0b" // Yellow for fake GR-55
                  : theme.colors.text || "#9ca3af", // Gray for no connection
            },
          ]}
        >
          {connectionStatus === "real"
            ? `Real GR-55 connected and ready (Device ID: 0x${selectedDevice?.identity?.deviceId
                ?.toString(16)
                .padStart(2, "0")
                .toUpperCase()})`
            : connectionStatus === "fake"
            ? `Fake GR-55 selected for testing (Device ID: 0x${selectedDevice?.identity?.deviceId
                ?.toString(16)
                .padStart(2, "0")
                .toUpperCase()})`
            : hasConnectedDevice
            ? "Device connected but not selected"
            : "No devices connected"}
        </Text>
      </View>

      {/* MIDI Configuration */}
      <View style={styles.configSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          MIDI Configuration
        </Text>

        {/* MIDI Input */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
            MIDI Input
          </Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            {inputs ? (
              <Picker
                onValueChange={setCurrentInputId}
                selectedValue={currentInputId}
                style={styles.picker}
              >
                {[...inputs.entries()].map(([key, input]) => (
                  <Picker.Item label={input.name} key={key} value={key} />
                ))}
              </Picker>
            ) : (
              <Text
                style={[styles.noDevicesText, { color: theme.colors.text }]}
              >
                No MIDI inputs available
              </Text>
            )}
          </View>
        </View>

        {/* MIDI Output */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
            MIDI Output
          </Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            {outputs ? (
              <Picker
                onValueChange={setCurrentOutputId}
                selectedValue={currentOutputId}
                style={styles.picker}
              >
                {[...outputs.entries()].map(([key, output]) => (
                  <Picker.Item label={output.name} key={key} value={key} />
                ))}
              </Picker>
            ) : (
              <Text
                style={[styles.noDevicesText, { color: theme.colors.text }]}
              >
                No MIDI outputs available
              </Text>
            )}
          </View>
        </View>

        {/* Connected Device */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
            Connected Device
          </Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            {rolandIoSetupContext.connectedDevices.size > 0 ? (
              <Picker
                onValueChange={rolandIoSetupContext.setSelectedDeviceKey}
                selectedValue={rolandIoSetupContext.selectedDeviceKey}
                style={styles.picker}
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
            ) : (
              <Text
                style={[styles.noDevicesText, { color: theme.colors.text }]}
              >
                No Roland devices detected
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Help Text */}
      <View
        style={[
          styles.helpCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border || "#374151",
          },
        ]}
      >
        <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
          Connection Help
        </Text>
        <Text style={[styles.helpText, { color: theme.colors.text }]}>
          • Connect your Roland GR-55 via USB or MIDI interface
        </Text>
        <Text style={[styles.helpText, { color: theme.colors.text }]}>
          • Select the appropriate MIDI input and output ports
        </Text>
        <Text style={[styles.helpText, { color: theme.colors.text }]}>
          • The device will appear automatically when connected
        </Text>
        <Text style={[styles.helpText, { color: theme.colors.text }]}>
          • For more options, visit the Setup tab
        </Text>
      </View>
    </PopoverAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 24,
    alignItems: "center",
  },
  imageButton: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  imageButtonActive: {
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 8px rgba(16, 185, 129, 0.3)",
      },
      ios: {
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {
        elevation: 8,
      },
    }),
  },
  hardwareImage: {
    width: 320,
    height: 240,
    borderRadius: 12,
  },
  blurredImage: {
    opacity: 0.6,
  },
  imageOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -80 }, { translateY: -25 }],
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 160,
  },
  connectedOverlay: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
  },
  fakeOverlay: {
    backgroundColor: "rgba(245, 158, 11, 0.9)",
  },
  overlayText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  connectedText: {
    color: "#ffffff",
  },
  fakeText: {
    color: "#ffffff",
  },
  overlaySubtext: {
    color: "#e5e7eb",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  connectedSubtext: {
    color: "#f0fdf4",
  },
  fakeSubtext: {
    color: "#fefce8",
  },
  statusCard: {
    width: "100%",
    maxWidth: 400,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  configSection: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  noDevicesText: {
    padding: 15,
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.7,
  },
  helpCard: {
    width: "100%",
    maxWidth: 400,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
});
