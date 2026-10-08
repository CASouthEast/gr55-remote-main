import {
  RolandGR55PatchAssignsMapBassMode,
  RolandGR55PatchAssignsMapGuitarMode,
} from "./RolandGR55AssignsMap";
import {
  RolandGR55PatchMapBassMode,
  RolandGR55PatchMapGuitarMode,
} from "./RolandGR55PatchMap";
import { RolandSysExConfig } from "./RolandSysExProtocol";
import { RolandGR55AddressMapAbsolute } from "./roland-gr55/RolandGR55AddressMap";
import * as RolandGR55Commands from "./roland-gr55/RolandGR55Commands";

export const RolandGR55SysExConfig: RolandSysExConfig = {
  description: "Roland GR-55",
  manufacturerId: 0x41,
  addressBytes: 4,
  modelId: [0x00, 0x00, 0x53],
  familyCode: 0x5302,
  modelNumber: 0x0000,
  addressMap: {
    temporaryPatch: RolandGR55AddressMapAbsolute.temporaryPatch,
    system: RolandGR55AddressMapAbsolute.system,
    setup: RolandGR55AddressMapAbsolute.setup,
  },
  gr55: {
    assignsMapGuitarMode: RolandGR55PatchAssignsMapGuitarMode,
    assignsMapBassMode: RolandGR55PatchAssignsMapBassMode,
    patchMapGuitarMode: RolandGR55PatchMapGuitarMode,
    patchMapBassMode: RolandGR55PatchMapBassMode,
  },
  commands: RolandGR55Commands,
};

export const AllSysExConfigs: readonly RolandSysExConfig[] = [
  RolandGR55SysExConfig,
];
