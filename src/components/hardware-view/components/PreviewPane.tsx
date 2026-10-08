import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";

export type HoveredItem = {
  type: "effect" | "tone" | "assign";
  id: string;
} | null;

interface PreviewPaneProps {
  hoveredItem: HoveredItem;
}

export function PreviewPane({ hoveredItem }: PreviewPaneProps) {
  if (!hoveredItem || Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {hoveredItem.type === "effect" && renderEffectPreview(hoveredItem.id)}
        {hoveredItem.type === "tone" && renderTonePreview(hoveredItem.id)}
        {hoveredItem.type === "assign" && renderAssignPreview(hoveredItem.id)}
      </ScrollView>
    </View>
  );
}

function renderEffectPreview(effectId: string) {
  switch (effectId) {
    case "MOD":
      return <MODPreview />;
    case "MFX":
      return <MFXPreview />;
    case "DELAY":
      return <DelayPreview />;
    case "CHORUS":
      return <ChorusPreview />;
    case "REVERB":
      return <ReverbPreview />;
    case "AMP":
      return <AMPPreview />;
    case "NS":
      return <NSPreview />;
    case "EQ":
      return <EQPreview />;
    default:
      return null;
  }
}

function renderTonePreview(toneId: string) {
  switch (toneId) {
    case "GUITAR":
      return <GuitarPreview />;
    case "PCM1":
      return <PCM1Preview />;
    case "PCM2":
      return <PCM2Preview />;
    case "MODEL":
      return <ModelPreview />;
    default:
      return null;
  }
}

function renderAssignPreview(assignId: string) {
  return <AssignPreview assignNumber={assignId} />;
}

// Effect Preview Components

function MODPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>MOD</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>PHASER</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Type" value="PHASER" />
      <ParameterSection label="Rate" value="2.5 Hz" />
      <ParameterSection label="Depth" value="75" />
      <ParameterSection label="Resonance" value="50" />
      <ParameterSection label="Level" value="85" />
    </View>
  );
}

function MFXPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>MFX</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>EQ</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Low Freq" value="100 Hz" />
      <ParameterSection label="Low Gain" value="+3 dB" />
      <ParameterSection label="Mid Freq" value="800 Hz" />
      <ParameterSection label="Mid Gain" value="-2 dB" />
      <ParameterSection label="High Freq" value="5.0 kHz" />
      <ParameterSection label="High Gain" value="+5 dB" />
      <ParameterSection label="Level" value="90" />
    </View>
  );
}

function DelayPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>DELAY</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>STEREO</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Type" value="STEREO" />
      <ParameterSection label="Time" value="450 ms" />
      <ParameterSection label="Feedback" value="40" />
      <ParameterSection label="HF Damp" value="6.3 kHz" />
      <ParameterSection label="Effect Level" value="75" />
    </View>
  );
}

function ChorusPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>CHORUS</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>MONO</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Type" value="MONO" />
      <ParameterSection label="Rate" value="1.5 Hz" />
      <ParameterSection label="Depth" value="60" />
      <ParameterSection label="Effect Level" value="70" />
    </View>
  );
}

function ReverbPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>REVERB</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>HALL</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Type" value="HALL" />
      <ParameterSection label="Time" value="3.5 s" />
      <ParameterSection label="High Cut" value="8.0 kHz" />
      <ParameterSection label="Effect Level" value="65" />
    </View>
  );
}

function AMPPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>AMP</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>JC-120</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Type" value="JC-120" />
      <ParameterSection label="Gain" value="50" />
      <ParameterSection label="Bass" value="55" />
      <ParameterSection label="Middle" value="60" />
      <ParameterSection label="Treble" value="65" />
      <ParameterSection label="Presence" value="50" />
      <ParameterSection label="Level" value="80" />
    </View>
  );
}

function NSPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>NS</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>NOISE SUPPRESSOR</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Threshold" value="25" />
      <ParameterSection label="Release" value="40 ms" />
    </View>
  );
}

function EQPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>EQ</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>EQUALIZER</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Low Cutoff" value="200 Hz" />
      <ParameterSection label="Low Gain" value="+2 dB" />
      <ParameterSection label="Low Mid Freq" value="800 Hz" />
      <ParameterSection label="Low Mid Gain" value="-1 dB" />
      <ParameterSection label="High Mid Freq" value="3.2 kHz" />
      <ParameterSection label="High Mid Gain" value="+3 dB" />
      <ParameterSection label="High Gain" value="+1 dB" />
    </View>
  );
}

// Tone Preview Components

function GuitarPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>GUITAR</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>NORMAL PU</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Level" value="100" />
    </View>
  );
}

function PCM1Preview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>PCM1</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>A.PIANO 1</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Tone" value="A.PIANO 1" />
      <ParameterSection label="Level" value="90" />
      <ParameterSection label="Octave Shift" value="0" />
      <ParameterSection label="Pan" value="CENTER" />
      <ParameterSection label="Coarse Tune" value="0" />
    </View>
  );
}

function PCM2Preview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>PCM2</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>STRINGS 1</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Tone" value="STRINGS 1" />
      <ParameterSection label="Level" value="85" />
      <ParameterSection label="Octave Shift" value="+1" />
      <ParameterSection label="Pan" value="CENTER" />
      <ParameterSection label="Coarse Tune" value="0" />
    </View>
  );
}

function ModelPreview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>MODEL</Text>
          <View style={styles.effectTypeBadge}>
            <Text style={styles.effectTypeText}>E.GTR</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Category" value="E.GTR" />
      <ParameterSection label="Tone" value="ST SINGLE 1" />
      <ParameterSection label="Level" value="95" />
      <ParameterSection label="12-String" value="OFF" />
    </View>
  );
}

// Assign Preview Component

function AssignPreview({ assignNumber }: { assignNumber: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>ASSIGN {assignNumber}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.switchLabel}>ON</Text>
          <View style={styles.switchPlaceholder} />
        </View>
      </View>

      <ParameterSection label="Target" value="MFX Level" />
      <ParameterSection label="Target Min" value="0" />
      <ParameterSection label="Target Max" value="100" />
      <ParameterSection label="Source" value="CC#11 (Expression)" />
      <ParameterSection label="Active Range Lo" value="0" />
      <ParameterSection label="Active Range Hi" value="127" />
    </View>
  );
}

// Helper Components

function ParameterSection({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.parameterSection}>
      <View style={styles.parameterHeader}>
        <Text style={styles.parameterLabel}>{label}</Text>
        <Text style={styles.parameterValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute" as any,
    top: 100, // Align with Display top (accounting for header and padding)
    left: "70%", // Position to the right of the left column
    marginLeft: -32, // Pull back 32px to create the gap
    width: 380,
    maxHeight: 540,
    backgroundColor: "transparent",
    pointerEvents: "none" as any,
    zIndex: 500,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600" as any,
    color: "#333",
  },
  effectTypeBadge: {
    backgroundColor: "#FFF5EB",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FF8A00",
  },
  effectTypeText: {
    fontSize: 12,
    fontWeight: "600" as any,
    color: "#FF8A00",
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500" as any,
    color: "#666",
  },
  switchPlaceholder: {
    width: 40,
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
  },
  parameterSection: {
    marginBottom: 12,
  },
  parameterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  parameterLabel: {
    fontSize: 14,
    fontWeight: "500" as any,
    color: "#666",
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: "600" as any,
    color: "#FF8A00",
  },
});
