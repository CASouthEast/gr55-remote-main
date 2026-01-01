import { MIDIMessageEvent } from "@motiz88/react-native-midi";
import { useFocusEffect } from "@react-navigation/native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { MidiIoContext } from "./MidiIo";
import { useUserOptions } from "../components/UserOptions";
import { MultiQueueScheduler } from "../lib/MultiQueueScheduler";
import {
  AtomDefinition,
  FieldDefinition,
  AtomReference,
  fetchAndTokenize,
  RawDataBag,
  StructDefinition,
} from "../lib/RolandAddressMap";
import { RolandGR55SysExConfig } from "../lib/RolandDevices";
import { RolandIoSetupContext } from "../lib/RolandIoSetup";
import {
  parseDataResponseMessage,
  isValidChecksum,
  makeDataRequestMessage,
  ALL_DEVICES,
  makeDataSetMessage,
  GAP_BETWEEN_MESSAGES_MS,
  unpack7,
  makeRawDataRequestMessage,
  pack7,
} from "../lib/RolandSysExProtocol";

type PendingFetch = {
  inputPortId: string;
  outputPortId: string | undefined;
  selectedDeviceKey: string | undefined;
  address: number;
  expectedLength: number | null;
  resolve: (value: Uint8Array) => void;
  reject: (reason?: any) => void;
  bytesReceived: number;
};

function useRolandDataTransferImpl() {
  const { outputPort, inputPort } = useContext(MidiIoContext);
  const { selectedDevice, selectedDeviceKey } =
    useContext(RolandIoSetupContext);
  const refCountByQueueId = useRef(new Map<string, number>());
  const scheduler = useRef<MultiQueueScheduler<string>>(null);
  if (!scheduler.current) {
    scheduler.current = new MultiQueueScheduler([
      "write_utmost",
      "read_utmost",
      "read_default",
    ]);
  }
  const updateSchedulerPriorities = useCallback(() => {
    // Scheduling priorities explained:
    // 1. Always send write commands before read commands, so reads are never stale
    //    with respect to a pending user action.
    // 2. Writes as part of user interactions are time-sensitive and therefore have
    //    "write_immediate" priority, which is the default. Other writes (e.g.
    //    auto-save) can be deferred to keep the time-sensitive writes flowing.
    //    We use "write_after_deferred" when we need to know all deferred writes are
    //    complete (e.g.)
    // 3. We reserve the "read_utmost" priority for reading fundamental system parameters
    //    that we can't function without (e.g. SYSTEM page on GR-55).
    // 4. Just above "read_default" are the dynamic read priorities, controlled by
    //    registerQueueAsPriority / unregisterQueueAsPriority (e.g. based on the current
    //    screen).
    // 5. Any named queues not included in the current priority order are read from last
    //    (no particular order is guaranteed).
    scheduler.current!.setPriorityOrder([
      "write_utmost",
      "read_utmost",
      ...refCountByQueueId.current.keys(),
      "read_default",
    ]);
  }, []);
  const registerQueueAsPriority = useCallback(
    (queueId: string) => {
      const refCount = refCountByQueueId.current.get(queueId) ?? 0;
      refCountByQueueId.current.set(queueId, refCount + 1);
      updateSchedulerPriorities();
    },
    [updateSchedulerPriorities]
  );
  const unregisterQueueAsPriority = useCallback(
    (queueId: string) => {
      const refCount = refCountByQueueId.current.get(queueId) ?? 0;
      if (refCount <= 1) {
        refCountByQueueId.current.delete(queueId);
        updateSchedulerPriorities();
      } else {
        refCountByQueueId.current.set(queueId, refCount - 1);
      }
    },
    [updateSchedulerPriorities]
  );
  const pendingFetches = useRef(new Set<PendingFetch>());
  const sysExConfig = selectedDevice?.sysExConfig ?? RolandGR55SysExConfig;
  const deviceId = selectedDevice?.identity.deviceId;
  useEffect(() => {
    if (deviceId == null) {
      return;
    }
    if (!inputPort) {
      return;
    }
    const handleMidiMessage = ({ data }: MIDIMessageEvent) => {
      const parsed = parseDataResponseMessage(sysExConfig, data);
      if (!parsed) {
        return;
      }
      if (deviceId != null && parsed.deviceId !== deviceId) {
        return;
      }

      // TODO: check address
      // Checksum validation is slow, save it for last
      if (!isValidChecksum(parsed)) {
        return;
      }

      for (const fetch of pendingFetches.current) {
        if (
          fetch.selectedDeviceKey !== selectedDeviceKey ||
          fetch.inputPortId !== inputPort.id ||
          fetch.outputPortId !== outputPort?.id
        ) {
          fetch.reject(new Error("Cancelled"));
          pendingFetches.current.delete(fetch);
          continue;
        }
        if (
          parsed.address === fetch.address &&
          (fetch.expectedLength == null ||
            parsed.address + parsed.valueBytes.length ===
              fetch.address + fetch.expectedLength)
        ) {
          fetch.resolve(parsed.valueBytes);
          pendingFetches.current.delete(fetch);
        }
      }
    };
    const myInputPort = inputPort;
    myInputPort.addEventListener("midimessage", handleMidiMessage);
    return () => {
      myInputPort.removeEventListener("midimessage", handleMidiMessage as any);
    };
  }, [inputPort, outputPort, selectedDeviceKey, deviceId, sysExConfig]);

  const [{ enableExperimentalFeatures }] = useUserOptions();

  return useMemo(() => {
    if (!outputPort || !inputPort || !selectedDevice) {
      return {
        requestData: undefined,
        requestNonDataCommand: undefined,
        setField: undefined,
        registerQueueAsPriority,
        unregisterQueueAsPriority,
      };
    }
    const myOutputPort = outputPort;

    const fetchContiguous = (
      address: number,
      length: number
    ): Promise<Uint8Array> => {
      return new Promise((resolve, reject) => {
        const thisFetch: PendingFetch = {
          resolve,
          reject,
          address,
          expectedLength: length,
          bytesReceived: 0,
          selectedDeviceKey,
          inputPortId: inputPort.id,
          outputPortId: outputPort.id,
        };
        pendingFetches.current.add(thisFetch);
        setTimeout(() => {
          pendingFetches.current.delete(thisFetch);
          reject(new Error("Data request timed out"));
        }, 5000);
        try {
          const message = makeDataRequestMessage(
            sysExConfig,
            deviceId ?? ALL_DEVICES,
            address,
            length
          );
          if (enableExperimentalFeatures) {
            console.log(
              "📤 SysEx Request:",
              message
                .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
                .join(" ")
            );
          }
          myOutputPort.send(message);
        } catch (e) {
          pendingFetches.current.delete(thisFetch);
          throw e;
        }
      });
    };

    async function requestData<T extends AtomDefinition>(
      definition: T,
      baseAddress: number = 0,
      signal?: AbortSignal,
      queueID: string = "read_default"
    ): Promise<RawDataBag> {
      let lastQueueStartTimestamp = performance.now();
      let totalQueueTime = 0,
        totalDelayTime = 0,
        totalFetchTime = 0;
      let chunkCount = 0,
        atomCount = 0;
      let didError = false;
      try {
        return await fetchAndTokenize(definition, baseAddress, (...args) =>
          scheduler.current!.enqueue(async () => {
            if (signal?.aborted) {
              throw new Error("Aborted");
            }
            ++chunkCount;

            const dequeueTimestamp = performance.now();
            totalQueueTime += dequeueTimestamp - lastQueueStartTimestamp;

            const beforeFetchTimestamp = performance.now();
            const result = await fetchContiguous(...args);
            const afterFetchTimestamp = performance.now();
            totalFetchTime += afterFetchTimestamp - beforeFetchTimestamp;

            const beforeDelayTimestamp = performance.now();
            await delay(GAP_BETWEEN_MESSAGES_MS);
            const afterDelayTimestamp = performance.now();
            totalDelayTime += afterDelayTimestamp - beforeDelayTimestamp;
            lastQueueStartTimestamp = performance.now();
            atomCount += Object.keys(result).length;
            return result;
          }, queueID)
        );
      } catch (e) {
        didError = true;
        throw e;
      } finally {
        if (enableExperimentalFeatures) {
          // Performance logging is an "experimental feature", until we possibly split it out into its own option
          console.log(
            "🧪 " +
              `${signal?.aborted ? "(ABORTED) " : ""}${
                didError && !signal?.aborted ? "(ERROR) " : ""
              }[${queueID}] Request for ${definition.description} (0x${unpack7(
                baseAddress
              )
                .toString(16)
                .padStart(8, "0")}) queued for ${Math.round(
                totalQueueTime
              )}ms, fetched in ${Math.round(
                totalFetchTime
              )}ms, delayed for ${Math.round(
                totalDelayTime
              )}ms (${atomCount} atoms in ${chunkCount} chunk(s))`
          );
        }
      }
    }

    // Some Roland devices implement a variant of the RQ1 command that:
    // 1. Has no length field in the request
    // 2. Performs some action on the device
    // 3. Potentially returns *multiple* responses at different addresses, not necessarily including the requested address
    //
    // Here we provide a way to send such commands and receive the responses.
    // Note that the queue is blocked until all expected responses are received.
    async function requestNonDataCommand(
      address: number,
      args: Uint8Array | readonly number[] = [],
      responseAddresses: readonly number[] = [address],
      signal?: AbortSignal,
      // Commands are generally mutations so give them the same priority as writes by default
      queueID: string = "write_utmost"
    ): Promise<RawDataBag> {
      const result: RawDataBag = {};
      let receivedResponseCount = 0;
      const responsePromises = responseAddresses.map((responseAddress) =>
        new Promise<Uint8Array>((resolve, reject) => {
          const thisFetch: PendingFetch = {
            resolve,
            reject,
            address: responseAddress,
            expectedLength: null /* unknown */,
            bytesReceived: 0,
            selectedDeviceKey,
            inputPortId: inputPort!.id,
            outputPortId: outputPort!.id,
          };
          pendingFetches.current.add(thisFetch);
          setTimeout(() => {
            pendingFetches.current.delete(thisFetch);
            reject(new Error("Data request timed out"));
          }, 5000);
        }).then((valueBytes) => {
          result[responseAddress] = valueBytes;
          if (enableExperimentalFeatures) {
            // Logging is an "experimental feature", until we possibly split it out into its own option
            ++receivedResponseCount;
            console.log(
              `🧪 Received response at 0x${unpack7(responseAddress)
                .toString(16)
                .padStart(8, "0")} (${receivedResponseCount} of ${
                responseAddresses.length
              }) for command at 0x${unpack7(address)
                .toString(16)
                .padStart(8, "0")}: ${Array.from(valueBytes)
                .map((x) => x.toString(16).padStart(2, "0"))
                .join(" ")}`
            );
          }
        })
      );

      const lastQueueStartTimestamp = performance.now();

      await scheduler.current!.enqueue(async () => {
        const totalQueueTime = performance.now() - lastQueueStartTimestamp;
        try {
          if (signal?.aborted) {
            throw new Error("Aborted");
          }
          myOutputPort.send(
            makeRawDataRequestMessage(
              sysExConfig,
              deviceId ?? ALL_DEVICES,
              address,
              args
            )
          );
          await Promise.all(responsePromises);
          await delay(GAP_BETWEEN_MESSAGES_MS);
        } finally {
          if (enableExperimentalFeatures) {
            // Logging is an "experimental feature", until we possibly split it out into its own option
            console.log(
              "🧪 " +
                `${
                  signal?.aborted ? "(ABORTED) " : ""
                }[${queueID}] Command at (0x${unpack7(address)
                  .toString(16)
                  .padStart(8, "0")}) queued for ${Math.round(
                  totalQueueTime
                )}ms`
            );
          }
        }
      }, queueID);

      return result;
    }

    // GR-55 System data uses a special bulk retrieval pattern:
    // Send ONE request to address 0x01000000 with args [01, 01, 00, 00]
    // Receive THIRTEEN responses at different addresses (Setup + System Common + CTL + 10 GK Sets)
    async function requestSystemBulk(
      signal?: AbortSignal,
      queueID: string = "read_utmost"
    ): Promise<RawDataBag> {
      console.log("� SYSBULK: Starting requestSystemBulk");

      // Define all expected response addresses based on traffic log
      const SYSTEM_BULK_RESPONSE_ADDRESSES = [
        pack7(0x01000000), // Setup (will be present but not used for System)
        pack7(0x02000000), // System Common
        pack7(0x02000200), // System CTL
        pack7(0x02000400), // GK Set 1
        pack7(0x02000500), // GK Set 2
        pack7(0x02000600), // GK Set 3
        pack7(0x02000700), // GK Set 4
        pack7(0x02000800), // GK Set 5
        pack7(0x02000900), // GK Set 6
        pack7(0x02000a00), // GK Set 7
        pack7(0x02000b00), // GK Set 8
        pack7(0x02000c00), // GK Set 9
        pack7(0x02000d00), // GK Set 10
      ];

      // Send request to address 0x01000000 with args [01, 01, 00, 00]
      const responseMap = await requestNonDataCommand(
        pack7(0x01000000),
        [0x01, 0x01, 0x00, 0x00],
        SYSTEM_BULK_RESPONSE_ADDRESSES,
        signal,
        queueID
      );

      console.log(
        `� SYSBULK: Received ${Object.keys(responseMap).length} responses`
      );
      const addresses = Object.keys(responseMap).map(
        (k) => `0x${unpack7(Number(k)).toString(16)}`
      );
      console.log(`🟦 SYSBULK: Response addresses:`, addresses);
      console.log(
        `🟦 SYSBULK: responseMap type:`,
        typeof responseMap,
        responseMap instanceof Map
      );
      console.log(
        `🟦 SYSBULK: Object.entries length:`,
        Object.entries(responseMap).length
      );

      // Map each response to structure offsets and tokenize
      // The System structure is at base 0x02000000, with sub-structures at specific offsets
      const result: RawDataBag = {};
      const systemBase = pack7(0x02000000);
      const systemStruct = sysExConfig.addressMap!.system!.definition.$; // Get the actual struct fields

      console.log(
        `� SYSBULK: Starting to process ${
          Object.keys(responseMap).length
        } responses...`
      );

      // Map each response to its offset relative to the System base address
      for (const [address, data] of Object.entries(responseMap)) {
        const addr = Number(address);
        console.log(
          `🟦 SYSBULK: Processing response at 0x${unpack7(addr).toString(
            16
          )}, data length: ${data.length} bytes`
        );

        if (addr === pack7(0x01000000)) {
          // Skip Setup data - not part of System structure
          console.log(`🟦 SYSBULK: Skipping Setup data`);
          continue;
        }

        // Find which sub-structure this response belongs to (common, ctl, gkSet1-10)
        // by matching the address against each sub-structure's base address
        let subDef: StructDefinition<any> | null = null;
        let subBaseAddr = addr;

        console.log(
          `🟦 SYSBULK: Looking for match for address 0x${unpack7(addr).toString(
            16
          )}, systemBase=0x${unpack7(systemBase).toString(16)}`
        );
        console.log(
          `🟦 SYSBULK: systemStruct keys:`,
          Object.keys(systemStruct)
        );

        try {
          for (const [key, value] of Object.entries(systemStruct)) {
            if (value instanceof StructDefinition) {
              const subAddr = pack7(
                unpack7(systemBase) + unpack7(value.offset)
              );
              console.log(
                `🟦 SYSBULK:     ${key}: offset=0x${unpack7(
                  value.offset
                ).toString(16)}, subAddr=0x${unpack7(subAddr).toString(
                  16
                )}, addr===subAddr: ${addr === subAddr}`
              );
              if (addr === subAddr) {
                subDef = value;
                subBaseAddr = subAddr;
                console.log(
                  `🟦 SYSBULK: ✅ Matched to sub-structure: ${key} (${value.description})`
                );
                break;
              }
            }
          }
        } catch (matchError) {
          console.error(`🟦 SYSBULK: ❌ Error during matching:`, matchError);
        }

        console.log(
          `🟦 SYSBULK: After matching: subDef=${
            subDef ? subDef.description : "NULL"
          }`
        );

        if (!subDef) {
          console.warn(
            `🟦 SYSBULK: ⚠️ No sub-structure definition found for address 0x${unpack7(
              addr
            ).toString(16)}`
          );
          continue;
        }

        // Tokenize this specific sub-structure's data blob
        console.log(
          `🟦 SYSBULK: Tokenizing ${subDef.description} at 0x${unpack7(
            addr
          ).toString(16)} with ${data.length} bytes`
        );

        try {
          const tokenizedData = await fetchAndTokenize(
            subDef.definition,
            subBaseAddr,
            async (def, baseAddr) => {
              return { [addr]: data };
            }
          );

          const tokenKeys = Object.keys(tokenizedData).slice(0, 10);
          console.log(
            `🟦 SYSBULK: ✅ Tokenized into ${
              Object.keys(tokenizedData).length
            } fields. First 10 keys:`,
            tokenKeys.map((k) => `0x${unpack7(Number(k)).toString(16)}`)
          );

          // Merge tokenized data into result
          Object.assign(result, tokenizedData);
        } catch (error) {
          console.error(
            `🟦 SYSBULK: ❌ Error tokenizing ${subDef.description}:`,
            error
          );
        }
      }

      const totalKeys = Object.keys(result).length;
      console.log(
        `🟦 SYSBULK: 🎯 Returning ${totalKeys} field addresses total`
      );
      if (totalKeys > 0) {
        const sampleKeys = Object.keys(result).slice(0, 5);
        console.log(
          `Sample keys:`,
          sampleKeys.map((k) => `0x${unpack7(Number(k)).toString(16)}`)
        );
      }

      return result;
    }

    function setField<T extends FieldDefinition<any>>(
      field: AtomReference<T>,
      newValue: Uint8Array | ReturnType<T["type"]["decode"]>,
      queueID: string = "write_utmost"
    ): void {
      let valueBytes;
      if (newValue instanceof Uint8Array) {
        valueBytes = newValue;
      } else {
        valueBytes = new Uint8Array(field.definition.size);
        field.definition.type.encode(
          newValue,
          valueBytes,
          0,
          field.definition.size
        );
      }
      const data = makeDataSetMessage(
        sysExConfig,
        deviceId ?? ALL_DEVICES,
        field.address,
        valueBytes
      );
      const lastQueueStartTimestamp = performance.now();
      scheduler.current!.enqueue(async () => {
        if (enableExperimentalFeatures) {
          const totalQueueTime = performance.now() - lastQueueStartTimestamp;
          // Performance logging is an "experimental feature", until we possibly split it out into its own option
          console.log(
            "🧪 " +
              `[${queueID}] Write of ${
                field.definition.description
              } (0x${unpack7(field.address)
                .toString(16)
                .padStart(8, "0")}) queued for ${Math.round(totalQueueTime)}ms`
          );
        }
        myOutputPort.send(data);
        await delay(GAP_BETWEEN_MESSAGES_MS);
      }, queueID);
    }
    return {
      requestData,
      requestNonDataCommand,
      requestSystemBulk,
      setField,
      registerQueueAsPriority,
      unregisterQueueAsPriority,
    };
  }, [
    outputPort,
    inputPort,
    selectedDevice,
    registerQueueAsPriority,
    unregisterQueueAsPriority,
    selectedDeviceKey,
    sysExConfig,
    deviceId,
    enableExperimentalFeatures,
  ]);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useQueryPriority(queueID: string): void {
  const { registerQueueAsPriority, unregisterQueueAsPriority } = useContext(
    RolandDataTransferContext
  );
  useEffect(() => {
    registerQueueAsPriority(queueID);
    return () => {
      unregisterQueueAsPriority(queueID);
    };
  }, [queueID, registerQueueAsPriority, unregisterQueueAsPriority]);
}

export function useFocusQueryPriority(queueID: string): void {
  const { registerQueueAsPriority, unregisterQueueAsPriority } = useContext(
    RolandDataTransferContext
  );
  useFocusEffect(
    useCallback(() => {
      registerQueueAsPriority(queueID);
      return () => {
        unregisterQueueAsPriority(queueID);
      };
    }, [queueID, registerQueueAsPriority, unregisterQueueAsPriority])
  );
}

export const RolandDataTransferContext = createContext<{
  requestData:
    | undefined
    | (<T extends AtomDefinition>(
        block: T,
        baseAddress?: number,
        signal?: AbortSignal,
        queueID?: string
      ) => Promise<RawDataBag>);
  requestNonDataCommand:
    | undefined
    | ((
        address: number,
        args?: Uint8Array | readonly number[],
        responseAddresses?: readonly number[],
        signal?: AbortSignal,
        queueID?: string
      ) => Promise<RawDataBag>);
  requestSystemBulk:
    | undefined
    | ((signal?: AbortSignal, queueID?: string) => Promise<RawDataBag>);
  setField:
    | undefined
    | (<T extends FieldDefinition<any>>(
        field: AtomReference<T>,
        newValue: Uint8Array | ReturnType<T["type"]["decode"]>,
        queueID?: string
      ) => void);
  registerQueueAsPriority: (queueID: string) => void;
  unregisterQueueAsPriority: (queueID: string) => void;
}>({
  requestData: undefined,
  requestNonDataCommand: undefined,
  requestSystemBulk: undefined,
  setField: undefined,
  registerQueueAsPriority: () => {},
  unregisterQueueAsPriority: () => {},
});

export function RolandDataTransferContainer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const rolandDataTransfer = useRolandDataTransferImpl();
  return (
    <RolandDataTransferContext.Provider value={rolandDataTransfer}>
      {children}
    </RolandDataTransferContext.Provider>
  );
}
