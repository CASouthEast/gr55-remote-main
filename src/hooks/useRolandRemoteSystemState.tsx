import { useContext } from "react";

import { RolandIoSetupContext } from "./RolandIoSetup";
import { useRolandRemotePageState } from "./hooks/useRolandRemotePageState";
import { RolandGR55SysExConfig } from "./lib/RolandDevices";

export function useRolandRemoteSystemState() {
  const { selectedDevice } = useContext(RolandIoSetupContext);
  const sysExConfig = selectedDevice?.sysExConfig ?? RolandGR55SysExConfig;
  const addressMap = sysExConfig.addressMap;

  return useRolandRemotePageState(addressMap?.system, "read_utmost");
}
