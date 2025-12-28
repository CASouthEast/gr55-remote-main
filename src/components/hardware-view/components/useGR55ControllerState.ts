import React, { useCallback, useMemo, useState } from "react";

import { RolandRemotePatchContext as PATCH } from "../../../contexts/RolandRemotePageContext";
import { useRemoteField } from "../../../hooks/useRemoteField";
import { useRolandRemotePatchSelection } from "../../../lib/RolandRemotePatchSelection";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../../lib/roland-gr55/RolandGR55AddressMap";
import { useRolandGR55RemotePatchDescriptions } from "../../../lib/roland-gr55/RolandGR55RemotePatchDescriptions";
import { GR55State, GR55Actions } from "../GR55HWView.types";
import { DEFAULT_GR55_STATE, DEFAULT_STYLES } from "../utils/constants";

export interface BankSlot {
  ordinal: 1 | 2 | 3;
  name: string;
}

export interface GR55ControllerState {
  state: GR55State;
  ledActiveStyle: GR55State["activeStyle"];
  bankSlots: BankSlot[] | null;
  activePedal: number;
  currentBankLabel?: string;
  actions: GR55Actions;
  navigation: {
    gotoNextBank: () => void;
    gotoPrevBank: () => void;
    selectOrdinalInCurrentBank: (ordinal: 1 | 2 | 3) => void;
    handleDataWheelRotate: (direction: "left" | "right") => void;
    handleDataWheelPress: (direction: "up" | "down" | "left" | "right") => void;
  };
  selectStylePatch: (styleId: GR55State["activeStyle"]) => void;
  remote: {
    ctlStatus: boolean;
    ctlFunction: any;
    expSwStatus: boolean;
    expSwFunction: any;
    patchLevel: any;
    setPatchLevel: (value: any) => void;
    guitarOutSource: any;
    gkS1Function: any;
    gkS2Function: any;
    gkVolFunction: any;
  };
  toggles: {
    handleCtlPedalToggle: () => void;
    handleExpSwToggle: () => void;
  };
}

export function useGR55ControllerState(
  initialState?: Partial<GR55State>,
  onStateChange?: (state: GR55State) => void
): GR55ControllerState {
  const [state, setState] = useState<GR55State>({
    ...DEFAULT_GR55_STATE,
    ...initialState,
  });

  // CTL pedal state and function from GR-55
  const [ctlStatus, setCtlStatus] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.ctl.status
  );
  const [ctlFunction] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.ctl.function
  );

  // EXP SW state and function from GR-55
  const [expSwStatus, setExpSwStatus] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.expSw.status
  );
  const [expSwFunction] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.expSw.function
  );

  // Patch Level from GR-55
  const [patchLevel, setPatchLevel] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.patchLevel
  );

  const [guitarOutSource] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.guitarOutSource
  );

  const [gkS1Function] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.gkS1.function
  );
  const [gkS2Function] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.gkS2.function
  );
  const [gkVolFunction] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.gkVol.function
  );

  const handleStateChange = useCallback(
    (newState: Partial<GR55State>) => {
      const updatedState = { ...state, ...newState };
      setState(updatedState);
      onStateChange?.(updatedState);
    },
    [state, onStateChange]
  );

  const actions: GR55Actions = useMemo(
    () => ({
      setActivePedal: (pedal: number) => {
        handleStateChange({
          activePedal: pedal,
          bank: `0${pedal}-1`,
        });
      },

      setPatchName: (name: string) => {
        handleStateChange({ patchName: name });
      },

      setActiveStyle: (style: GR55State["activeStyle"]) => {
        const styleConfig = DEFAULT_STYLES.find((s) => s.id === style);
        handleStateChange({
          activeStyle: style,
          patchName: styleConfig?.patch || state.patchName,
        });
      },
    }),
    [handleStateChange, state.patchName]
  );

  const handleCtlPedalToggle = useCallback(() => {
    setCtlStatus(!ctlStatus);
  }, [ctlStatus, setCtlStatus]);

  const handleExpSwToggle = useCallback(() => {
    setExpSwStatus(!expSwStatus);
  }, [expSwStatus, setExpSwStatus]);

  // Determine current patch sound type from remote selection and descriptions
  const { selectedPatch, setSelectedPatch } = useRolandRemotePatchSelection();
  const { patches } = useRolandGR55RemotePatchDescriptions();
  const currentPatch = patches?.find(
    (p) =>
      selectedPatch &&
      p.identity.bankMSB === selectedPatch.bankSelectMSB &&
      p.identity.pc === selectedPatch.pc
  );
  const remoteSoundType = currentPatch?.identity.styleLabel as
    | GR55State["activeStyle"]
    | undefined;
  const ledActiveStyle = remoteSoundType ?? state.activeStyle;

  const stylePatches = useMemo(
    () =>
      patches?.filter((p) => p.identity.styleLabel === ledActiveStyle) ?? [],
    [patches, ledActiveStyle]
  );

  const styleBanks = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    stylePatches.forEach((p) => {
      const bankLabel = p.identity.patchNumberLabel.split("-")[0];
      if (!seen.has(bankLabel)) {
        seen.add(bankLabel);
        order.push(bankLabel);
      }
    });
    return order;
  }, [stylePatches]);

  const currentBankIndex = useMemo(() => {
    const bankLabel = currentPatch?.identity.patchNumberLabel?.split("-")[0];
    if (!bankLabel) return -1;
    return styleBanks.findIndex((b) => b === bankLabel);
  }, [currentPatch, styleBanks]);

  const currentBankLabel = useMemo(() => {
    const label = currentPatch?.identity.patchNumberLabel?.split("-")[0];
    if (label) return label;
    const fallback = state.bank?.split("-")[0];
    return fallback;
  }, [currentPatch, state.bank]);

  const remoteActivePedal = useMemo(() => {
    const patchNumberLabel = currentPatch?.identity.patchNumberLabel;
    if (!patchNumberLabel) return undefined;
    const match = patchNumberLabel.match(/-(\d+)$/);
    if (!match) return undefined;
    const ordinal = parseInt(match[1], 10);
    return ordinal >= 1 && ordinal <= 3 ? ordinal : undefined;
  }, [currentPatch]);

  const activePedal = remoteActivePedal ?? state.activePedal;

  const gotoBank = useCallback(
    (bankLabel: string) => {
      const target =
        stylePatches.find(
          (p) => p.identity.patchNumberLabel === `${bankLabel}-1`
        ) ||
        stylePatches.find((p) =>
          p.identity.patchNumberLabel.startsWith(`${bankLabel}-`)
        );
      if (target) {
        setSelectedPatch({
          bankSelectMSB: target.identity.bankMSB,
          pc: target.identity.pc,
        });
      }
    },
    [stylePatches, setSelectedPatch]
  );

  const gotoNextBank = useCallback(() => {
    if (styleBanks.length === 0) return;
    const nextIdx =
      currentBankIndex >= 0 ? (currentBankIndex + 1) % styleBanks.length : 0;
    gotoBank(styleBanks[nextIdx]);
  }, [styleBanks, currentBankIndex, gotoBank]);

  const gotoPrevBank = useCallback(() => {
    if (styleBanks.length === 0) return;
    const prevIdx =
      currentBankIndex >= 0
        ? (currentBankIndex - 1 + styleBanks.length) % styleBanks.length
        : styleBanks.length - 1;
    gotoBank(styleBanks[prevIdx]);
  }, [styleBanks, currentBankIndex, gotoBank]);

  const selectOrdinalInCurrentBank = useCallback(
    (ordinal: 1 | 2 | 3) => {
      if (!currentBankLabel) return;
      const targetLabel = `${currentBankLabel}-${ordinal}`;
      const target = stylePatches.find(
        (p) => p.identity.patchNumberLabel === targetLabel
      );
      if (target) {
        setSelectedPatch({
          bankSelectMSB: target.identity.bankMSB,
          pc: target.identity.pc,
        });
      }
    },
    [currentBankLabel, stylePatches, setSelectedPatch]
  );

  const bankSlots = useMemo(() => {
    if (!currentBankLabel) return null;
    return ([1, 2, 3] as const).map((ordinal) => {
      const target = stylePatches.find(
        (p) => p.identity.patchNumberLabel === `${currentBankLabel}-${ordinal}`
      );
      const name =
        target?.data?.name ??
        (target?.status === "pending" ? "(loading…)" : undefined) ??
        "—";
      return { ordinal, name };
    });
  }, [currentBankLabel, stylePatches]);

  const handleDataWheelRotate = useCallback(
    (direction: "left" | "right") => {
      const currentPedal = state.activePedal;
      if (direction === "right" && currentPedal < 4) {
        actions.setActivePedal(currentPedal + 1);
      } else if (direction === "left" && currentPedal > 1) {
        actions.setActivePedal(currentPedal - 1);
      }
    },
    [state.activePedal, actions]
  );

  const handleDataWheelPress = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      switch (direction) {
        case "up": {
          const currentStyleIndex = DEFAULT_STYLES.findIndex(
            (s) => s.id === state.activeStyle
          );
          const nextStyleIndex =
            (currentStyleIndex + 1) % DEFAULT_STYLES.length;
          actions.setActiveStyle(
            DEFAULT_STYLES[nextStyleIndex].id as GR55State["activeStyle"]
          );
          break;
        }
        case "down": {
          const currentStyleIndexDown = DEFAULT_STYLES.findIndex(
            (s) => s.id === state.activeStyle
          );
          const prevStyleIndex =
            currentStyleIndexDown === 0
              ? DEFAULT_STYLES.length - 1
              : currentStyleIndexDown - 1;
          actions.setActiveStyle(
            DEFAULT_STYLES[prevStyleIndex].id as GR55State["activeStyle"]
          );
          break;
        }
        case "left":
          if (state.activePedal > 1) {
            actions.setActivePedal(state.activePedal - 1);
          }
          break;
        case "right":
          if (state.activePedal < 4) {
            actions.setActivePedal(state.activePedal + 1);
          }
          break;
      }
    },
    [state.activeStyle, state.activePedal, actions]
  );

  const selectStylePatch = useCallback(
    (styleId: GR55State["activeStyle"]) => {
      if (!patches || patches.length === 0) {
        actions.setActiveStyle(styleId);
        return;
      }
      const currentUiLabel = currentPatch?.identity.patchNumberLabel;
      let target = patches.find(
        (p) =>
          p.identity.styleLabel === styleId &&
          (currentUiLabel
            ? p.identity.patchNumberLabel === currentUiLabel
            : true)
      );
      if (!target) {
        target = patches.find((p) => p.identity.styleLabel === styleId);
      }
      if (target) {
        setSelectedPatch({
          bankSelectMSB: target.identity.bankMSB,
          pc: target.identity.pc,
        });
      } else {
        actions.setActiveStyle(styleId);
      }
    },
    [patches, currentPatch, actions, setSelectedPatch]
  );

  return {
    state,
    ledActiveStyle,
    bankSlots,
    activePedal,
    currentBankLabel,
    actions,
    navigation: {
      gotoNextBank,
      gotoPrevBank,
      selectOrdinalInCurrentBank,
      handleDataWheelRotate,
      handleDataWheelPress,
    },
    selectStylePatch,
    remote: {
      ctlStatus,
      ctlFunction,
      expSwStatus,
      expSwFunction,
      patchLevel,
      setPatchLevel,
      guitarOutSource,
      gkS1Function,
      gkS2Function,
      gkVolFunction,
    },
    toggles: {
      handleCtlPedalToggle,
      handleExpSwToggle,
    },
  };
}
