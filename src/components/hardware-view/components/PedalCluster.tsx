import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";

import { Button } from "./Buttons";
import { Pedal } from "./Pedal";
import { BankSlot } from "./useGR55ControllerState";
import { hardwareColors, hardwareSpacing } from "../utils/hardwareViewTokens";

interface PedalClusterProps {
  activePedal: number;
  bankSlots: BankSlot[] | null;
  ctlStatus: boolean;
  ctlFunction: any;
  onCtlToggle: () => void;
  onSelectPedal: (pedal: number) => void;
  selectOrdinalInCurrentBank: (ordinal: 1 | 2 | 3) => void;
  gotoNextBank: () => void;
  gotoPrevBank: () => void;
}

export function PedalCluster({
  activePedal,
  bankSlots,
  ctlStatus,
  ctlFunction,
  onCtlToggle,
  onSelectPedal,
  selectOrdinalInCurrentBank,
  gotoNextBank,
  gotoPrevBank,
}: PedalClusterProps) {
  const pedal1Clicks = React.useRef<{ count: number; timeout?: any }>({
    count: 0,
  });
  const pedal2Clicks = React.useRef<{ count: number; timeout?: any }>({
    count: 0,
  });

  const handlePedalPress = React.useCallback(
    (pedal: 1 | 2 | 3) => {
      onSelectPedal(pedal);
      const ref = pedal === 1 ? pedal1Clicks.current : pedal2Clicks.current;
      const triggerBankNavigation = pedal === 1 ? gotoNextBank : gotoPrevBank;
      const triggerOrdinal = () => selectOrdinalInCurrentBank(pedal);

      if (pedal === 3) {
        selectOrdinalInCurrentBank(3);
        return;
      }

      ref.count += 1;
      if (ref.timeout) {
        clearTimeout(ref.timeout);
      }
      ref.timeout = setTimeout(() => {
        if (ref.count >= 2) {
          triggerBankNavigation();
        } else {
          triggerOrdinal();
        }
        ref.count = 0;
        ref.timeout = undefined;
      }, 250);
    },
    [gotoNextBank, gotoPrevBank, onSelectPedal, selectOrdinalInCurrentBank]
  );

  return (
    <View style={styles.pedalSection}>
      <View style={styles.pedals}>
        <View style={styles.pedalColumn}>
          <Pedal
            label="1"
            isActive={activePedal === 1}
            topLabel={bankSlots?.[0]?.name}
            onClick={() => handlePedalPress(1)}
            subLabel="BANK ▲"
          />
        </View>
        <View style={styles.pedalColumn}>
          <Pedal
            label="2"
            isActive={activePedal === 2}
            topLabel={bankSlots?.[1]?.name}
            onClick={() => handlePedalPress(2)}
            subLabel="BANK ▼"
          />
        </View>
        <View style={styles.pedalColumn}>
          <Pedal
            label="3"
            isActive={activePedal === 3}
            topLabel={bankSlots?.[2]?.name}
            onClick={() => handlePedalPress(3)}
            subLabel="PHRASE LOOP"
          />
        </View>
        <View style={styles.pedalColumn}>
          <Pedal
            label="CTL"
            isActive={ctlStatus}
            topLabel={ctlFunction}
            onClick={onCtlToggle}
            subLabel="REC/PLAY/DUB"
          />
        </View>
        <View style={styles.audioPlayerColumn}>
          <Text style={styles.audioPlayerLabel}>AUDIO PLAYER</Text>
          <Button label="" variant="rect" style={styles.audioPlayerButton} />
          <Text style={styles.usbMemoryLabel}>USB MEMORY</Text>

          <View style={styles.branding}>
            <View style={styles.grLogoContainer}>
              <Text style={styles.grLogoG}>G</Text>
              <Text style={styles.grLogoR}>R</Text>
            </View>
            <Text style={styles.cosmBadge}>COSM</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pedalSection: {
    paddingTop: hardwareSpacing.md,
    borderTopWidth: 1,
    borderTopColor: hardwareColors.border,
    position: "relative",
  },
  pedals: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
    paddingHorizontal: 40,
  },
  pedalColumn: {
    alignItems: "center",
    gap: hardwareSpacing.sm,
  },
  audioPlayerColumn: {
    alignItems: "center",
    gap: hardwareSpacing.sm,
  },
  audioPlayerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: hardwareColors.textMuted,
    marginBottom: hardwareSpacing.xs,
  },
  audioPlayerButton: {
    width: 56,
  },
  usbMemoryLabel: {
    fontSize: 10,
    backgroundColor: hardwareColors.black,
    color: hardwareColors.white,
    paddingHorizontal: hardwareSpacing.xs,
    marginTop: hardwareSpacing.xs,
  },
  branding: {
    marginTop: 40,
    alignItems: "center",
    opacity: 0.8,
  },
  grLogoContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 65,
  },
  grLogoG: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontSize: 57,
    fontWeight: "900",
    color: hardwareColors.accentAlt,
    letterSpacing: -1.3,
    marginBottom: 16,
  },
  grLogoR: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontSize: 57,
    fontWeight: "900",
    color: hardwareColors.accentAlt,
    letterSpacing: -2.6,
  },
  cosmBadge: {
    fontWeight: "700",
    color: hardwareColors.white,
    backgroundColor: hardwareColors.black,
    paddingHorizontal: hardwareSpacing.xs,
    fontStyle: "italic",
    transform: [{ skewX: "-10deg" }],
    borderWidth: 1,
    borderColor: hardwareColors.border,
  },
});
