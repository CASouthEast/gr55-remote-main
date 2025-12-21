import { useContext } from "react";

import { useRolandRemotePageState } from "./useRolandRemotePageState";
import { RolandGR55SysExConfig } from "../lib/RolandDevices";
import { RolandIoSetupContext } from "../lib/RolandIoSetup";

export function useRolandRemoteSystemState() {
  const { selectedDevice } = useContext(RolandIoSetupContext);
  const sysExConfig = selectedDevice?.sysExConfig ?? RolandGR55SysExConfig;
  const addressMap = sysExConfig.addressMap;

  return useRolandRemotePageState(addressMap?.system, "read_utmost");
}
