import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useCallback, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";

import { PopoverAwareScrollView } from "../../components/PopoverAwareScrollView";
import { RefreshControl } from "../../components/RefreshControl";
import { PatchEffectsTabParamList } from "../../components/navigation";
import { RemoteFieldPicker } from "../../components/remote-fields/RemoteFieldPicker";
import { RemoteFieldSegmentedSwitch } from "../../components/remote-fields/RemoteFieldSegmentedSwitch";
import { RemoteFieldSlider } from "../../components/remote-fields/RemoteFieldSlider";
import { RemoteFieldSwitch } from "../../components/remote-fields/RemoteFieldSwitch";
import { RemoteFieldSwitchedSection } from "../../components/remote-fields/RemoteFieldSwitchedSection";
import { RolandRemotePatchContext as PATCH } from "../../contexts/RolandRemotePageContext";
import { useRemoteField } from "../../hooks/useRemoteField";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../lib/roland-gr55/RolandGR55AddressMap";
import { useMainScrollViewSafeAreaStyle } from "../../utils/SafeAreaUtils";

export function PatchEffectsModScreen({
  navigation,
}: MaterialTopTabScreenProps<PatchEffectsTabParamList, "Mod">) {
  const { reloadData } = useContext(PATCH);

  const [modType, setModType] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.ampModNs.modType
  );

  // modSwitch is controlled by RemoteFieldSwitch inside the switched section

  // Get the appropriate level field based on the current effect type
  const getCurrentLevelField = useCallback(() => {
    switch (modType) {
      case "OD/DS":
        return GR55.temporaryPatch.ampModNs.odDsLevel;
      case "WAH":
        return GR55.temporaryPatch.ampModNs.wahLevel;
      case "COMP":
        return GR55.temporaryPatch.ampModNs.compLevel;
      case "LIMITER":
        return GR55.temporaryPatch.ampModNs.limiterLevel;
      case "PHASER":
        return GR55.temporaryPatch.ampModNs.phaserLevel;
      case "FLANGER":
        return GR55.temporaryPatch.ampModNs.flangerLevel;
      case "TREMOLO":
        return GR55.temporaryPatch.ampModNs.tremoloLevel;
      case "ROTARY":
        return GR55.temporaryPatch.ampModNs.rotaryLevel;
      case "UNI-V":
        return GR55.temporaryPatch.ampModNs.uniVLevel;
      case "PAN":
        return GR55.temporaryPatch.ampModNs.panLevel;
      case "DELAY":
        return GR55.temporaryPatch.ampModNs.delayEffectLevel;
      case "CHORUS":
        return GR55.temporaryPatch.ampModNs.chorusEffectLevel;
      case "EQ":
        return GR55.temporaryPatch.ampModNs.eqLevel;
      default:
        return GR55.temporaryPatch.ampModNs.odDsLevel; // fallback
    }
  }, [modType]);

  const [modLevel, setModLevel] = useRemoteField(PATCH, getCurrentLevelField());

  const handleModTypeChange = useCallback(
    (value: typeof modType) => {
      setModType(value);
      // TODO: Reset mod control min/max fields to appropriate values based on mod type
    },
    [setModType]
  );

  const safeAreaStyle = useMainScrollViewSafeAreaStyle();

  const renderEffectParameters = (effectType: typeof modType) => {
    switch (effectType) {
      case "OD/DS":
        return (
          <>
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.odDsType}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.odDsDrive}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.odDsTone}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.odDsLevel}
            />
          </>
        );
      case "WAH":
        return <WahSection />;
      case "COMP":
        return (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.compSustain}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.compAttack}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.compLevel}
            />
          </>
        );
      case "LIMITER":
        return (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.limiterThreshold}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.limiterRelease}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.limiterLevel}
            />
          </>
        );
      case "OCTAVE":
        return (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.octaveOctLevel}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.octaveDryLevel}
            />
          </>
        );
      case "PHASER":
        return (
          <>
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.phaserType}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.phaserRate}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.phaserDepth}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.phaserResonance}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.phaserLevel}
            />
          </>
        );
      case "FLANGER":
        return (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.flangerRate}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.flangerDepth}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.flangerManual}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.flangerResonance}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.flangerLevel}
            />
          </>
        );
      case "TREMOLO":
        return (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.tremoloRate}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.tremoloDepth}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.tremoloWaveShape}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.tremoloLevel}
            />
          </>
        );
      case "ROTARY":
        return (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.rotaryRateSlow}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.rotaryRateFast}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.rotaryDepth}
            />
            <RemoteFieldSegmentedSwitch
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.rotarySelect}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.rotaryLevel}
            />
          </>
        );
      case "UNI-V":
        return (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.uniVRate}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.uniVDepth}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.uniVLevel}
            />
          </>
        );
      case "PAN":
        return (
          <>
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.panRate}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.panDepth}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.panWaveShape}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.panLevel}
            />
          </>
        );
      case "DELAY":
        return (
          <>
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.delayType}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.delayTime}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.delayFeedback}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.delayEffectLevel}
            />
          </>
        );
      case "CHORUS":
        return (
          <>
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.chorusType}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.chorusRate}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.chorusDepth}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.chorusEffectLevel}
            />
          </>
        );
      case "EQ":
        return (
          <>
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqLowCutoffFreq}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqLowGain}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqLowMidCutoffFreq}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqLowMidQ}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqLowMidGain}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqHighMidCutoffFreq}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqHighMidQ}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqHighMidGain}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqHighGain}
            />
            <RemoteFieldPicker
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqHighCutoffFreq}
            />
            <RemoteFieldSlider
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.eqLevel}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <PopoverAwareScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={reloadData} />
      }
      style={safeAreaStyle}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.card}>
        {/* Header with title, effect type badge, and switch */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>MOD</Text>
            <View style={styles.effectTypeBadge}>
              <Text style={styles.effectTypeText}>{modType}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.switchLabel}>ON</Text>
            <RemoteFieldSwitch
              page={PATCH}
              field={GR55.temporaryPatch.ampModNs.modSwitch}
            />
          </View>
        </View>

        {/* Level section with slider and numeric input */}
        <View style={styles.section}>
          <View style={styles.levelHeader}>
            <Text style={styles.fieldLabel}>Level</Text>
            <View style={styles.levelValueContainer}>
              <Text style={styles.levelInput}>
                {typeof modLevel === "number"
                  ? String(modLevel)
                  : String(modLevel ?? "")}
              </Text>
              <TouchableOpacity style={styles.resetButton}>
                <Text style={styles.resetButtonText}>↻</Text>
              </TouchableOpacity>
            </View>
          </View>
          <RemoteFieldSlider page={PATCH} field={getCurrentLevelField()} />
        </View>

        {/* Effect Type Picker */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Effect Type</Text>
          <RemoteFieldPicker
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.modType}
            value={modType}
            onValueChange={handleModTypeChange}
          />
        </View>

        {/* Parameters section - dynamic based on effect type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parameters</Text>
          {renderEffectParameters(modType)}
        </View>

        {/* Pan control */}
        <View style={styles.section}>
          <View style={styles.levelHeader}>
            <Text style={styles.fieldLabel}>Pan</Text>
            <Text style={styles.parameterValue}>50</Text>
          </View>
          <RemoteFieldSlider
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.modPan}
          />
        </View>

        {/* Reset to Original button */}
        <TouchableOpacity style={styles.resetToOriginalButton}>
          <Text style={styles.resetToOriginalText}>↻ Reset to Original</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.copyButton}>
              <Text style={styles.copyButtonText}>📋 Copy</Text>
            </TouchableOpacity>
            {[25, 50, 75, 100].map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  styles.quickButton,
                  v === 25 && styles.quickButton25,
                  v === 50 && styles.quickButton50,
                  v === 75 && styles.quickButton75,
                  v === 100 && styles.quickButton100,
                ]}
                onPress={() => setModLevel(v)}
              >
                <Text
                  style={[
                    styles.quickButtonText,
                    v === 25 && styles.quickButtonText25,
                    v === 50 && styles.quickButtonText50,
                    v === 75 && styles.quickButtonText75,
                    v === 100 && styles.quickButtonText100,
                  ]}
                >
                  {v}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Noise Suppressor section */}
      <RemoteFieldSwitchedSection
        page={PATCH}
        field={GR55.temporaryPatch.ampModNs.nsSwitch}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Noise Suppressor</Text>
          <RemoteFieldSlider
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.nsThreshold}
          />
          <RemoteFieldSlider
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.nsReleaseTime}
          />
        </View>
      </RemoteFieldSwitchedSection>

      {/* Send Levels */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Send Levels</Text>
        <RemoteFieldSlider
          page={PATCH}
          field={GR55.temporaryPatch.ampModNs.modDelaySendLevel}
        />
        <RemoteFieldSlider
          page={PATCH}
          field={GR55.temporaryPatch.ampModNs.modReverbSendLevel}
        />
        <RemoteFieldSlider
          page={PATCH}
          field={GR55.temporaryPatch.ampModNs.modChorusSendLevel}
        />
      </View>
    </PopoverAwareScrollView>
  );
}

function WahSection() {
  const [wahMode, setWahMode] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.ampModNs.wahMode
  );
  return (
    <>
      <RemoteFieldPicker
        page={PATCH}
        field={GR55.temporaryPatch.ampModNs.wahMode}
        value={wahMode}
        onValueChange={setWahMode}
      />
      {wahMode === "MANUAL" && (
        <>
          <RemoteFieldPicker
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.wahType}
          />
          <RemoteFieldSlider
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.wahPedalPosition}
          />
        </>
      )}
      {(wahMode === "T.UP" || wahMode === "T.DOWN") && (
        <>
          <RemoteFieldSlider
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.wahSens}
          />
          <RemoteFieldSlider
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.wahFreq}
          />
          <RemoteFieldSlider
            page={PATCH}
            field={GR55.temporaryPatch.ampModNs.wahPeak}
          />
        </>
      )}
      <RemoteFieldSlider
        page={PATCH}
        field={GR55.temporaryPatch.ampModNs.wahLevel}
      />
    </>
  );
}
const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    elevation: 4,
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
      android: {},
      default: {},
    }),
    maxWidth: 600,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  effectTypeBadge: {
    backgroundColor: "#FFF5EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  effectTypeText: {
    color: "#FF8A00",
    fontSize: 12,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF5EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  switchLabel: {
    fontSize: 12,
    color: "#FF8A00",
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelInput: {
    backgroundColor: "#FFF5EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#FF8A00",
    minWidth: 50,
    borderWidth: 1,
    borderColor: "#FF8A00",
  },
  resetButton: {
    backgroundColor: "#FFF5EB",
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: "#FF8A00",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#FF8A00",
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  parameterValue: {
    fontSize: 14,
    color: "#FF8A00",
    fontWeight: "600",
  },
  resetToOriginalButton: {
    backgroundColor: "#FFF5EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  resetToOriginalText: {
    color: "#FF8A00",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  copyButton: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copyButtonText: {
    color: "#2196F3",
    fontSize: 12,
    fontWeight: "600",
  },
  quickButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickButton25: {
    backgroundColor: "#E3F2FD",
  },
  quickButton50: {
    backgroundColor: "#E8F5E8",
  },
  quickButton75: {
    backgroundColor: "#FFF3E0",
  },
  quickButton100: {
    backgroundColor: "#FFEBEE",
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  quickButtonText25: {
    color: "#2196F3",
  },
  quickButtonText50: {
    color: "#4CAF50",
  },
  quickButtonText75: {
    color: "#FF9800",
  },
  quickButtonText100: {
    color: "#F44336",
  },
});
