import React from "react";
import { StyleSheet, View, Text } from "react-native";

import { SoundStyleButton, Button } from "./Buttons";
import { StyleButtonConfig, GR55State } from "../GR55HWView.types";
import { hardwareColors, hardwareSpacing } from "../utils/hardwareViewTokens";

interface SoundStylePanelProps {
  stylesConfig: StyleButtonConfig[];
  ledActiveStyle: GR55State["activeStyle"];
  onSelectStyle: (styleId: GR55State["activeStyle"]) => void;
}

export function SoundStylePanel({
  stylesConfig,
  ledActiveStyle,
  onSelectStyle,
}: SoundStylePanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>SOUND STYLE</Text>
      </View>
      <View style={styles.styleButtons}>
        <SoundStyleButton label="V-LINK" active={false} onClick={() => {}} />

        {stylesConfig.map((style) => (
          <SoundStyleButton
            key={style.id}
            label={style.label}
            active={ledActiveStyle === style.id}
            onClick={() => onSelectStyle(style.id as GR55State["activeStyle"])}
          />
        ))}

        <View style={styles.ezEditSection}>
          <Text style={styles.ezEditLabel}>EZ EDIT</Text>
          <Button label="" variant="rect" style={styles.ezEditButton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: hardwareSpacing.md,
    borderTopWidth: 1,
    borderTopColor: hardwareColors.border,
    position: "relative",
  },
  header: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: hardwareColors.surface,
    paddingHorizontal: hardwareSpacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: hardwareColors.textMuted,
    textTransform: "uppercase",
  },
  styleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: hardwareSpacing.sm,
  },
  ezEditSection: {
    marginLeft: hardwareSpacing.md,
    alignItems: "center",
    paddingTop: hardwareSpacing.sm,
  },
  ezEditLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: hardwareColors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  ezEditButton: {
    width: 64,
    height: 32,
  },
});
