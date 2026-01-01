import EventEmitter from "events";
import { useRef, useCallback, useContext, useMemo, useState } from "react";

import useCancellablePromise from "../hooks/useCancellablePromise";
import {
  FieldDefinition,
  FieldType,
  RawDataBag,
  AtomReference,
} from "../lib/RolandAddressMap";
import { RolandGR55SysExConfig } from "../lib/RolandDevices";
import { RolandIoSetupContext } from "../lib/RolandIoSetup";
import { pack7 } from "../lib/RolandSysExProtocol";
import { RolandDataTransferContext } from "../services/RolandDataTransfer";

export function useRolandRemoteSystemState() {
  const { selectedDevice } = useContext(RolandIoSetupContext);
  const { selectedDeviceKey } = useContext(RolandIoSetupContext);
  const { requestSystemBulk, setField } = useContext(RolandDataTransferContext);
  const sysExConfig = selectedDevice?.sysExConfig ?? RolandGR55SysExConfig;
  const addressMap = sysExConfig.addressMap;

  const [invalidationCount, setInvalidationCount] = useState(0);

  const [pageData, pageReadError, pageReadStatus] = useCancellablePromise(
    useCallback(
      async (signal) => {
        // Manually register a dependency on the device to force a refetch when it changes.
        // eslint-disable-next-line no-unused-expressions
        selectedDeviceKey;
        // Manually register a dependency on the invalidation count to force a refetch in invalidateData.
        // eslint-disable-next-line no-unused-expressions
        invalidationCount;
        if (!requestSystemBulk) {
          return Promise.reject(new Error("No device available"));
        }
        if (!addressMap?.system) {
          return Promise.reject(new Error("No address map available"));
        }
        const remoteData = await requestSystemBulk(signal, "read_utmost");
        const oldLocalOverrides = localOverrides.current;
        localOverrides.current = {};
        for (const address of Object.keys(oldLocalOverrides)) {
          subscriptions.current!.emit(
            address,
            remoteData[address as unknown as number]
          );
        }
        return remoteData;
      },
      [selectedDeviceKey, invalidationCount, requestSystemBulk, addressMap]
    )
  );

  const invalidateData = useMemo(
    () => () => {
      setInvalidationCount((x) => x + 1);
    },
    []
  );

  const localOverrides = useRef<RawDataBag>({});

  const setLocalOverride = useCallback(
    <T extends FieldDefinition<FieldType<any>>>(
      field: AtomReference<T>,
      value: Uint8Array | ReturnType<T["type"]["decode"]>
    ) => {
      let valueBytes;
      if (value instanceof Uint8Array) {
        valueBytes = value;
      } else {
        valueBytes = new Uint8Array(field.definition.size);
        field.definition.type.encode(
          value,
          valueBytes,
          0,
          field.definition.size
        );
      }
      localOverrides.current[field.address] = valueBytes;
      subscriptions.current!.emit(field.address.toString(), valueBytes);
    },
    []
  );

  const subscriptions = useRef<EventEmitter>(null);
  if (!subscriptions.current) {
    subscriptions.current = new EventEmitter();
    subscriptions.current.setMaxListeners(1000);
  }
  const subscribeToField = useCallback(
    <T extends FieldDefinition<any>>(
      field: AtomReference<T>,
      listener: (valueBytes: Uint8Array) => void
    ) => {
      subscriptions.current!.addListener(field.address.toString(), listener);
      return () => {
        subscriptions.current!.removeListener(
          field.address.toString(),
          listener
        );
      };
    },
    []
  );

  const setRemoteField = useCallback(
    <T extends FieldDefinition<any>>(
      field: AtomReference<T>,
      value: Uint8Array | ReturnType<T["type"]["decode"]>
    ) => {
      setField?.(field, value);
      setLocalOverride(field, value);
    },
    [setField, setLocalOverride]
  );

  return useMemo(
    () => ({
      pageData,
      pageReadError,
      pageReadStatus,
      reloadData: invalidateData,
      localOverrides: localOverrides.current,
      subscribeToField,
      setLocalOverride,
      setRemoteField,
    }),
    [
      pageData,
      pageReadError,
      pageReadStatus,
      invalidateData,
      localOverrides,
      subscribeToField,
      setLocalOverride,
      setRemoteField,
    ]
  );
}
