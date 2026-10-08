import { requireNativeViewManager } from "expo-modules-core";
import React from "react";

import { MidiHardwareManagerViewProps } from "../modules/modules/midi-hardware-manager/src/MidiHardwareManager.types";

const NativeView: React.ComponentType<MidiHardwareManagerViewProps> =
  requireNativeViewManager("MidiHardwareManager");

export function BluetoothDevicesView(props: MidiHardwareManagerViewProps) {
  return <NativeView {...props} />;
}
