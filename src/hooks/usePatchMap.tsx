import { useContext } from "react";

import { useRemoteField } from "./useRemoteField";
import { RolandRemoteSystemContext as SYSTEM } from "../contexts/RolandRemotePageContext";
import type { RolandGR55PatchMap } from "../lib/RolandGR55PatchMap";
import { RolandIoSetupContext } from "../lib/RolandIoSetup";
import { RolandGR55AddressMapAbsolute as GR55 } from "../lib/roland-gr55/RolandGR55AddressMap";

export function usePatchMap(): RolandGR55PatchMap | undefined {
  const { selectedDevice } = useContext(RolandIoSetupContext);
  const gr55Config = selectedDevice?.sysExConfig?.gr55;
  const [guitarBassSelect] = useRemoteField(
    SYSTEM,
    GR55.system.common.guitarBassSelect
  );

  if (!gr55Config) {
    return undefined;
  }
  if (guitarBassSelect === "GUITAR") {
    return gr55Config.patchMapGuitarMode;
  }
  return gr55Config.patchMapBassMode;
}
