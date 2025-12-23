import type { MIDIMessageEvent } from "@motiz88/react-native-midi";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AllSysExConfigs, RolandGR55SysExConfig } from "./RolandDevices";
import * as RolandSysExProtocol from "./RolandSysExProtocol";
import { useStateWithStoredDefault } from "../components/AsyncStorageUtils";
import { MidiIoContext } from "../services/MidiIo";

function useRolandIoSetupImpl() {
  const [includeFakeDevice, setIncludeFakeDevice] =
    useStateWithStoredDefault<boolean>(
      "@motiz88/gr55-remote/RolandIoSetup/includeFakeDevice",
      false
    );

  const { inputPort, outputPort } = useContext(MidiIoContext);
  const connectedDevicesRef = useRef(new Map());
  const [connectedDevicesSnapshot, setConnectedDevicesSnapshot] = useState<
    ReadonlyMap<string, Readonly<DeviceDescriptor>>
  >(new Map());

  // TODO: Persist selected device key
  const [selectedDeviceKey, setSelectedDeviceKey] = useState<string>();

  useEffect(() => {
    const handleIdentity = (
      identity: RolandSysExProtocol.DeviceIdentity,
      isFake?: boolean
    ) => {
      let deviceDescriptor: DeviceDescriptor | undefined = undefined;
      const deviceKey = [
        identity.manufacturerId.toString(16),
        identity.deviceFamily.toString(16),
        identity.deviceModel.toString(16),
        identity.deviceId.toString(16),
        isFake ? "FAKE" : "",
      ]
        .filter(Boolean)
        .join("-");

      for (const sysExConfig of AllSysExConfigs) {
        const matches =
          identity.manufacturerId === sysExConfig.manufacturerId &&
          identity.deviceFamily === sysExConfig.familyCode &&
          identity.deviceModel === sysExConfig.modelNumber;
        console.log(
          `🔍 Checking against ${
            sysExConfig.description
          }: manufacturerId match=${
            identity.manufacturerId === sysExConfig.manufacturerId
          } (0x${identity.manufacturerId.toString(
            16
          )} vs 0x${sysExConfig.manufacturerId.toString(16)}), family match=${
            identity.deviceFamily === sysExConfig.familyCode
          } (0x${identity.deviceFamily
            .toString(16)
            .padStart(4, "0")} vs 0x${sysExConfig.familyCode
            .toString(16)
            .padStart(4, "0")}), model match=${
            identity.deviceModel === sysExConfig.modelNumber
          } (0x${identity.deviceModel
            .toString(16)
            .padStart(4, "0")} vs 0x${sysExConfig.modelNumber
            .toString(16)
            .padStart(4, "0")}) => ${matches}`
        );
        if (matches) {
          deviceDescriptor = {
            sysExConfig,
            description: sysExConfig.description + (isFake ? " (fake)" : ""),
            identity,
          };
          break;
        }
      }
      if (!deviceDescriptor) {
        deviceDescriptor = {
          sysExConfig: null,
          description: `Unknown device (manufacturer 0x${identity.manufacturerId.toString(
            16
          )}, family 0x${identity.deviceFamily.toString(
            16
          )}, model 0x${identity.deviceModel.toString(16)})`,
          identity,
        };
      }
      connectedDevicesRef.current.set(deviceKey, deviceDescriptor);
      setConnectedDevicesSnapshot(new Map(connectedDevicesRef.current));
      setSelectedDeviceKey(
        (currentSelectedKey) => currentSelectedKey ?? deviceKey
      );
    };

    const handleMidiMessage = (event: MIDIMessageEvent) => {
      const identity = RolandSysExProtocol.parseIdentityReplyMessage(
        event.data
      );
      if (identity) {
        console.log(
          `🔍 Received device identity: manufacturerId=0x${identity.manufacturerId
            .toString(16)
            .padStart(2, "0")}, deviceFamily=0x${identity.deviceFamily
            .toString(16)
            .padStart(4, "0")}, deviceModel=0x${identity.deviceModel
            .toString(16)
            .padStart(4, "0")}, deviceId=0x${identity.deviceId
            .toString(16)
            .padStart(2, "0")}`
        );
        handleIdentity(identity);
      } else {
        console.log(
          `🔍 Received MIDI message but not an identity reply: ${Array.from(
            event.data
          )
            .map((x) => "0x" + x.toString(16).padStart(2, "0"))
            .join(" ")}`
        );
      }
    };

    connectedDevicesRef.current.clear();

    if (includeFakeDevice) {
      handleIdentity(
        {
          manufacturerId: RolandGR55SysExConfig.manufacturerId,
          deviceFamily: RolandGR55SysExConfig.familyCode,
          deviceModel: RolandGR55SysExConfig.modelNumber,
          deviceId: 0x7f,
          softwareRevisionLevel: 0x0100,
        },
        /* isFake */ true
      );
    }
    setConnectedDevicesSnapshot(new Map(connectedDevicesRef.current));

    if (!inputPort || !outputPort) {
      return;
    }
    console.log("🔍 Sending MIDI Identity Request");
    outputPort.send(RolandSysExProtocol.BROADCAST_IDENTITY_REQUEST_MESSAGE);

    const myInputPort = inputPort;
    myInputPort.addEventListener("midimessage", handleMidiMessage);
    return () => {
      myInputPort.removeEventListener("midimessage", handleMidiMessage as any);
    };
  }, [inputPort, outputPort, includeFakeDevice, setSelectedDeviceKey]);

  const selectedDevice =
    selectedDeviceKey != null
      ? connectedDevicesSnapshot.get(selectedDeviceKey)
      : undefined;

  const rolandIoSetupContext = useMemo(
    () => ({
      connectedDevices: connectedDevicesSnapshot,
      selectedDevice,
      selectedDeviceKey,
      setSelectedDeviceKey,
      includeFakeDevice,
      setIncludeFakeDevice,
    }),
    [
      connectedDevicesSnapshot,
      includeFakeDevice,
      selectedDevice,
      selectedDeviceKey,
      setIncludeFakeDevice,
    ]
  );
  return rolandIoSetupContext;
}

export function RolandIoSetupContainer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const rolandIoSetupState = useRolandIoSetupImpl();
  return (
    <RolandIoSetupContext.Provider value={rolandIoSetupState}>
      {children}
    </RolandIoSetupContext.Provider>
  );
}

export type DeviceDescriptor = {
  sysExConfig: RolandSysExProtocol.RolandSysExConfig | null;
  description: string;
  identity: RolandSysExProtocol.DeviceIdentity;
};

export const RolandIoSetupContext = createContext<{
  connectedDevices: ReadonlyMap<string, Readonly<DeviceDescriptor>>;
  selectedDevice: Readonly<DeviceDescriptor> | undefined;
  selectedDeviceKey: string | undefined;
  setSelectedDeviceKey: (key?: string) => void;
  includeFakeDevice: boolean;
  setIncludeFakeDevice: (includeFakeDevice: boolean) => void;
}>({
  connectedDevices: new Map(),
  selectedDevice: undefined,
  selectedDeviceKey: undefined,
  setSelectedDeviceKey: () => {},
  includeFakeDevice: false,
  setIncludeFakeDevice: () => {},
});
