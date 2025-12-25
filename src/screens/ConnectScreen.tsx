import { useTheme } from "@react-navigation/native";
import React, { useContext } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

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
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  // Check if we have a connected GR-55 device
  const hasConnectedDevice = rolandIoSetupContext.connectedDevices.size > 0;

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
        <Image
          source={
            hasConnectedDevice
              ? require("../../assets/gr-55-bk_top_gal.jpg")
              : require("../../assets/gr55-pixel-masked.png")
          }
          style={[
            styles.hardwareImage,
            !hasConnectedDevice && styles.blurredImage,
          ]}
          resizeMode="contain"
        />
        {!hasConnectedDevice && (
          <View style={styles.imageOverlay}>
            <Text style={styles.overlayText}>Not Connected</Text>
            <Text style={styles.overlaySubtext}>Configure MIDI to connect</Text>
          </View>
        )}
        {hasConnectedDevice && (
          <View style={[styles.imageOverlay, styles.connectedOverlay]}>
            <Text style={[styles.overlayText, styles.connectedText]}>
              ✓ Connected
            </Text>
            <Text style={[styles.overlaySubtext, styles.connectedSubtext]}>
              Roland GR-55 Ready
            </Text>
          </View>
        )}
      </View>

      {/* Connection Status */}
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: hasConnectedDevice
              ? "#10b981"
              : theme.colors.border || "#374151",
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
                backgroundColor: hasConnectedDevice ? "#10b981" : "#ef4444",
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.statusText,
            {
              color: hasConnectedDevice
                ? "#10b981"
                : theme.colors.text || "#9ca3af",
            },
          ]}
        >
          {hasConnectedDevice
            ? `Connected to ${rolandIoSetupContext.connectedDevices.size} device(s)`
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
  overlayText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  connectedText: {
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
