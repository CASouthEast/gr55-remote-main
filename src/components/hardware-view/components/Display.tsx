import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";

import { HoveredItem } from "./PreviewPane";
import { RolandRemotePatchContext as PATCH } from "../../../contexts/RolandRemotePageContext";
import { useRemoteField } from "../../../hooks/useRemoteField";
import { getAllPcmToneLabels } from "../../../lib/RolandGR55ToneMap";
import { useRolandRemotePatchSelection } from "../../../lib/RolandRemotePatchSelection";
import { RolandGR55AddressMapAbsolute as GR55 } from "../../../lib/roland-gr55/RolandGR55AddressMap";
import { useRolandGR55RemotePatchDescriptions } from "../../../lib/roland-gr55/RolandGR55RemotePatchDescriptions";

interface DisplayProps {
  patchName: string;
  bank: string;
  mode: string;
  style?: any;
  onHoverChange?: (item: HoveredItem) => void;
}

/**
 * LCD Display component that replicates the Roland GR-55 screen
 * Maintains the visual design and layout from GR55HWDesign.png
 * Adapted for React Native compatibility
 */
export function Display({
  patchName,
  bank,
  mode,
  style,
  onHoverChange,
}: DisplayProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const flatListRef = React.useRef<FlatList>(null);
  // Current patch selection and description
  const { selectedPatch, setSelectedPatch } = useRolandRemotePatchSelection();
  const { patches } = useRolandGR55RemotePatchDescriptions();
  const currentPatch = patches?.find(
    (p) =>
      selectedPatch &&
      p.identity.bankMSB === selectedPatch.bankSelectMSB &&
      p.identity.pc === selectedPatch.pc
  );
  const soundType = currentPatch?.identity.styleLabel;
  const uiLocation = currentPatch?.identity.patchNumberLabel;
  // const rawLocation = selectedPatch
  //   ? `${selectedPatch.bankSelectMSB}:${selectedPatch.pc}`
  //   : undefined;
  const patchDescription = currentPatch?.data?.name ?? undefined;
  const filteredPatches = useMemo(() => {
    if (!patches) {
      return null;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return patches;
    }
    return patches.filter((p) => {
      const name = p.data?.name?.toLowerCase?.() ?? "";
      const label = `${p.identity.styleLabel} ${p.identity.patchNumberLabel}`
        .toLowerCase()
        .trim();
      return name.includes(q) || label.includes(q);
    });
  }, [patches, searchQuery]);

  // Calculate the scroll position to center current patch
  const scrollToIndex = useMemo(() => {
    if (!filteredPatches || !selectedPatch || searchQuery.trim()) {
      return undefined;
    }
    const currentIndex = filteredPatches.findIndex(
      (p) =>
        p.identity.bankMSB === selectedPatch.bankSelectMSB &&
        p.identity.pc === selectedPatch.pc
    );
    if (currentIndex === -1) {
      return undefined;
    }
    // For LEAD 01-1 to 01-3 (first 3 patches), start at index 0
    if (currentIndex <= 2) {
      return 0;
    }
    // Otherwise, show current patch as 3rd item (index - 2)
    return currentIndex - 2;
  }, [filteredPatches, selectedPatch, searchQuery]);

  // Scroll to current patch when picker opens
  useEffect(() => {
    if (isPickerOpen && scrollToIndex !== undefined && flatListRef.current) {
      // Use setTimeout to ensure the list has rendered
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: scrollToIndex,
          animated: false,
          viewPosition: 0,
        });
      }, 100);
    }
  }, [isPickerOpen, scrollToIndex]);

  const updateHoveredItem = (item: HoveredItem) => {
    onHoverChange?.(item);
  };
  // Live tone switches so the top bar mirrors the active sources on the current patch
  const [pcm1Muted, setPcm1Muted] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.patchPCMTone1.muteSwitch
  );
  const [pcm2Muted, setPcm2Muted] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.patchPCMTone2.muteSwitch
  );
  const [modelMuted, setModelMuted] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.modelingTone.muteSwitch
  );
  const [normalPuMuted, setNormalPuMuted] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.normalPuMute
  );

  // Tone selections for PCM1, PCM2, and Modeling Tone
  const [pcm1ToneSelect] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.patchPCMTone1.toneSelect
  );
  const [pcm2ToneSelect] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.patchPCMTone2.toneSelect
  );
  const [modelingToneCategory] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.modelingTone.toneCategory_guitar
  );
  const [modelingToneEGtrGuitar] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.modelingTone.toneNumberEGtr_guitar
  );
  const [modelingToneAcGuitar] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.modelingTone.toneNumberAc_guitar
  );
  const [modelingToneEBassGuitar] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.modelingTone.toneNumberEBass_guitar
  );
  const [modelingToneSynthGuitar] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.modelingTone.toneNumberSynth_guitar
  );

  // Helper function to get tone category name and tone name from PCM tone name
  const getPcmToneCategoryAndName = (
    toneName: string | undefined
  ): { category: string; name: string } | null => {
    if (toneName === undefined || toneName === null) {
      return null;
    }

    const allLabels = getAllPcmToneLabels();
    const toneIndex = allLabels.indexOf(toneName);

    if (toneIndex === -1) return null;

    // Create a simple tone range map (0-based indices to category names)
    const ranges = [
      { name: "Ac.Piano", range: [0, 15] },
      { name: "Pop Piano", range: [16, 18] },
      { name: "E.Grand Piano", range: [19, 20] },
      { name: "E.Piano1", range: [21, 45] },
      { name: "E.Piano2", range: [46, 58] },
      { name: "E.Organ", range: [59, 90] },
      { name: "Pipe Organ", range: [91, 95] },
      { name: "Reed Organ", range: [96, 96] },
      { name: "Harpsichord", range: [97, 104] },
      { name: "Vibraphone", range: [105, 119] },
      { name: "Bell", range: [120, 140] },
      { name: "Mallet", range: [141, 162] },
      { name: "Ac.Guitar", range: [163, 180] },
      { name: "E.Guitar", range: [181, 198] },
      { name: "Dist.Guitar", range: [199, 209] },
      { name: "Ac.Bass", range: [210, 227] },
      { name: "E.Bass", range: [228, 245] },
      { name: "Slap Bass", range: [246, 253] },
      { name: "Fretless Bass", range: [254, 256] },
      { name: "Strings", range: [257, 283] },
      { name: "Pad/Strings", range: [284, 297] },
      { name: "Choir", range: [298, 304] },
      { name: "Wind", range: [305, 319] },
      { name: "Reed", range: [320, 337] },
      { name: "Pipe", range: [338, 350] },
      { name: "Synth Bell", range: [351, 365] },
      { name: "Lead", range: [366, 367] },
      { name: "Solo Brass", range: [368, 378] },
      { name: "Ensemble Brass", range: [379, 385] },
      { name: "Synth Wood", range: [386, 392] },
      { name: "Synth Mallet", range: [393, 398] },
      { name: "Synth Lead", range: [399, 445] },
      { name: "Synth Brass", range: [446, 568] },
      { name: "Synth Pad/Strings", range: [569, 608] },
      { name: "Synth Bellpad", range: [609, 692] },
      { name: "Synth PolyKey", range: [693, 709] },
      { name: "Synth FX", range: [710, 754] },
      { name: "Synth Seq/Pop", range: [755, 785] },
      { name: "Pulsating", range: [786, 796] },
      { name: "Beat&Groove", range: [797, 828] },
      { name: "Hit", range: [829, 839] },
      { name: "Sound FX", range: [840, 846] },
      { name: "Percussion", range: [847, 883] },
      { name: "Drums", range: [884, 909] },
    ];

    let categoryName = "";
    for (const { name, range } of ranges) {
      if (toneIndex >= range[0] && toneIndex <= range[1]) {
        categoryName = name;
        break;
      }
    }

    return categoryName ? { category: categoryName, name: toneName } : null;
  };

  // Get modeling tone name based on category
  const getModelingToneName = (): string | null => {
    if (modelingToneCategory === "E.GTR" && modelingToneEGtrGuitar) {
      return modelingToneEGtrGuitar;
    }
    if (modelingToneCategory === "AC" && modelingToneAcGuitar) {
      return modelingToneAcGuitar;
    }
    if (modelingToneCategory === "E.BASS" && modelingToneEBassGuitar) {
      return modelingToneEBassGuitar;
    }
    if (modelingToneCategory === "SYNTH" && modelingToneSynthGuitar) {
      return modelingToneSynthGuitar;
    }
    return null;
  };

  const pcm1Info = getPcmToneCategoryAndName(pcm1ToneSelect);
  const pcm2Info = getPcmToneCategoryAndName(pcm2ToneSelect);
  const modelingToneName = getModelingToneName();

  const [patchTempo, setPatchTempo] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.patchTempo
  );
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [tempoInput, setTempoInput] = useState("");
  const lastTempoClickRef = useRef<number>(0);
  const tempoSingleClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const clampTempo = (value: number) => {
    return Math.max(20, Math.min(250, Math.round(value)));
  };

  const currentTempo = clampTempo(patchTempo ?? 120);

  const commitTempo = (value: string | number) => {
    const numeric = typeof value === "number" ? value : parseInt(value, 10);
    if (Number.isFinite(numeric)) {
      const next = clampTempo(numeric);
      setPatchTempo(next);
    }
    setIsEditingTempo(false);
  };

  useEffect(() => {
    return () => {
      if (tempoSingleClickTimeout.current) {
        clearTimeout(tempoSingleClickTimeout.current);
      }
    };
  }, []);

  // Effect switches for bottom parameter rows
  const [mfxOn, setMfxOn] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.mfx.mfxSwitch
  );
  const [delayOn, setDelayOn] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.sendsAndEq.delaySwitch
  );
  const [chorusOn, setChorusOn] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.sendsAndEq.chorusSwitch
  );
  const [reverbOn, setReverbOn] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.sendsAndEq.reverbSwitch
  );
  const [ampOn, setAmpOn] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.ampModNs.ampSwitch
  );
  const [nsOn, setNsOn] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.modelingTone.nsSwitch
  );
  const [modOn, setModOn] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.ampModNs.modSwitch
  );
  const [eqOn, setEqOn] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.sendsAndEq.eqSwitch
  );

  // Assign switches (1..8)
  const [assign1On, setAssign1On] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign1.switch
  );
  const [assign2On, setAssign2On] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign2.switch
  );
  const [assign3On, setAssign3On] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign3.switch
  );
  const [assign4On, setAssign4On] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign4.switch
  );
  const [assign5On, setAssign5On] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign5.switch
  );
  const [assign6On, setAssign6On] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign6.switch
  );
  const [assign7On, setAssign7On] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign7.switch
  );
  const [assign8On, setAssign8On] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.assign8.switch
  );

  const renderStatusChip = (
    label: string,
    isMuted: boolean,
    onPress: () => void,
    isGuitar?: boolean
  ) => (
    <Pressable
      onPress={onPress}
      onHoverIn={() =>
        Platform.OS === "web" && updateHoveredItem({ type: "tone", id: label })
      }
      onHoverOut={() => Platform.OS === "web" && updateHoveredItem(null)}
      style={({ pressed }) => [
        styles.statusChip,
        pressed && styles.statusChipPressed,
        isMuted ? styles.statusChipInactive : styles.statusChipActive,
        isGuitar && styles.statusChipGuitar,
      ]}
    >
      {({ pressed }) => (
        <Text
          style={
            pressed
              ? styles.statusChipTextPressed
              : isMuted
              ? [styles.statusText, styles.statusTextInactive]
              : styles.statusText
          }
        >
          {label}
        </Text>
      )}
    </Pressable>
  );

  const renderParameterButton = (
    label: string,
    isActive: boolean,
    onPress: () => void,
    type: "effect" | "assign" = "effect"
  ) => (
    <Pressable
      onPress={onPress}
      onHoverIn={() =>
        Platform.OS === "web" && updateHoveredItem({ type, id: label })
      }
      onHoverOut={() => Platform.OS === "web" && updateHoveredItem(null)}
      style={({ pressed }) => [
        styles.parameterButton,
        pressed && styles.parameterButtonPressed,
        isActive
          ? styles.parameterButtonActive
          : styles.parameterButtonInactive,
      ]}
    >
      {({ pressed }) => (
        <Text
          style={
            pressed
              ? styles.parameterTextPressed
              : [
                  styles.parameterText,
                  !isActive && styles.parameterTextInactive,
                ]
          }
        >
          {label}
        </Text>
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.innerBezel} />

      <View style={styles.screenContent}>
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            <View style={styles.statusChipColumn}>
              {renderStatusChip(
                "GUITAR",
                normalPuMuted,
                () => setNormalPuMuted(!normalPuMuted),
                true
              )}
            </View>
            <View style={styles.statusChipColumn}>
              {renderStatusChip("PCM1", pcm1Muted, () =>
                setPcm1Muted(!pcm1Muted)
              )}
              {pcm1Info && !pcm1Muted && (
                <>
                  <Text style={styles.toneLabel}>{pcm1Info.category}</Text>
                  <Text style={styles.toneName}>{pcm1Info.name}</Text>
                </>
              )}
            </View>
            <View style={styles.statusChipColumn}>
              {renderStatusChip("PCM2", pcm2Muted, () =>
                setPcm2Muted(!pcm2Muted)
              )}
              {pcm2Info && !pcm2Muted && (
                <>
                  <Text style={styles.toneLabel}>{pcm2Info.category}</Text>
                  <Text style={styles.toneName}>{pcm2Info.name}</Text>
                </>
              )}
            </View>
            <View style={styles.statusChipColumn}>
              {renderStatusChip("MODEL", modelMuted, () =>
                setModelMuted(!modelMuted)
              )}
              {modelingToneCategory && !modelMuted && (
                <>
                  <Text style={styles.toneLabel}>{modelingToneCategory}</Text>
                  {modelingToneName && (
                    <Text style={styles.toneName}>{modelingToneName}</Text>
                  )}
                </>
              )}
            </View>
          </View>
          <View style={styles.bpmContainer}>
            <Text style={styles.bpmLabel}>BPM:</Text>
            {isEditingTempo ? (
              <TextInput
                value={tempoInput}
                onChangeText={setTempoInput}
                onBlur={() => commitTempo(tempoInput)}
                onSubmitEditing={() => commitTempo(tempoInput)}
                keyboardType="numeric"
                style={styles.bpmInput}
                autoFocus
              />
            ) : (
              <Pressable
                onPress={() => {
                  if (Platform.OS === "web") {
                    if (tempoSingleClickTimeout.current) {
                      clearTimeout(tempoSingleClickTimeout.current);
                      tempoSingleClickTimeout.current = null;
                    }

                    const now = Date.now();
                    const isDoubleClick = now - lastTempoClickRef.current < 300;

                    if (isDoubleClick) {
                      lastTempoClickRef.current = 0;
                      setTempoInput(String(currentTempo));
                      setIsEditingTempo(true);
                      return;
                    }

                    lastTempoClickRef.current = now;
                    tempoSingleClickTimeout.current = setTimeout(() => {
                      commitTempo(currentTempo);
                      tempoSingleClickTimeout.current = null;
                      lastTempoClickRef.current = 0;
                    }, 250);
                    return;
                  }

                  commitTempo(currentTempo);
                }}
                onLongPress={() => {
                  if (Platform.OS !== "web") {
                    setTempoInput(String(currentTempo));
                    setIsEditingTempo(true);
                  }
                }}
              >
                <Text style={styles.bpmText} selectable={false}>
                  {currentTempo}
                </Text>
              </Pressable>
            )}
            <View style={styles.bpmArrows}>
              <Pressable
                onPress={() => commitTempo(currentTempo + 1)}
                style={styles.bpmArrowButton}
              >
                <Text style={styles.bpmArrowText}>▲</Text>
              </Pressable>
              <Pressable
                onPress={() => commitTempo(currentTempo - 1)}
                style={styles.bpmArrowButton}
              >
                <Text style={styles.bpmArrowText}>▼</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.bankText}>{uiLocation ?? bank}</Text>
          <View style={styles.patchInfo}>
            <Text style={styles.modeText}>{soundType ?? mode}</Text>
            <Pressable onPress={() => setIsPickerOpen(true)}>
              <Text style={styles.patchNameText} numberOfLines={1}>
                {patchDescription ?? patchName}
              </Text>
            </Pressable>
          </View>
        </View>

        {isPickerOpen && (
          <Pressable
            style={styles.popoverBackdrop}
            onPress={() => setIsPickerOpen(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation?.()}
              style={styles.popover}
            >
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search patches"
                placeholderTextColor="rgba(30, 58, 138, 0.5)"
                style={styles.searchInput}
                autoFocus
              />
              <FlatList
                ref={flatListRef}
                data={filteredPatches}
                keyExtractor={(item) =>
                  `${item.identity.bankMSB}-${item.identity.pc}`
                }
                showsVerticalScrollIndicator={false}
                style={styles.popoverList}
                contentContainerStyle={styles.popoverListContent}
                getItemLayout={(data, index) => ({
                  length: 56,
                  offset: 56 * index,
                  index,
                })}
                onScrollToIndexFailed={(info) => {
                  // Fallback if scroll fails
                  setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                      index: info.index,
                      animated: false,
                      viewPosition: 0,
                    });
                  }, 100);
                }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setIsPickerOpen(false);
                      setSearchQuery("");
                      setSelectedPatch({
                        bankSelectMSB: item.identity.bankMSB,
                        pc: item.identity.pc,
                      });
                    }}
                    style={({ pressed }) => [
                      styles.popoverItem,
                      pressed && styles.popoverItemPressed,
                      selectedPatch?.bankSelectMSB === item.identity.bankMSB &&
                      selectedPatch?.pc === item.identity.pc
                        ? styles.popoverItemActive
                        : null,
                    ]}
                  >
                    <Text style={styles.popoverItemLabel}>
                      {item.identity.styleLabel}{" "}
                      {item.identity.patchNumberLabel}
                    </Text>
                    {item.data ? (
                      <Text style={styles.popoverItemName} numberOfLines={1}>
                        {item.data.name}
                      </Text>
                    ) : item.status === "pending" ? (
                      <Text style={styles.popoverItemName}>Loading…</Text>
                    ) : null}
                  </Pressable>
                )}
              />
            </Pressable>
          </Pressable>
        )}

        <View style={styles.parameters}>
          <View style={styles.parameterRow}>
            {renderParameterButton("MFX", mfxOn, () => setMfxOn(!mfxOn))}
            {renderParameterButton("DELAY", delayOn, () =>
              setDelayOn(!delayOn)
            )}
            {renderParameterButton("CHORUS", chorusOn, () =>
              setChorusOn(!chorusOn)
            )}
            {renderParameterButton("REVERB", reverbOn, () =>
              setReverbOn(!reverbOn)
            )}
          </View>

          <View style={styles.parameterRow}>
            {renderParameterButton("AMP", ampOn, () => setAmpOn(!ampOn))}
            {renderParameterButton("NS", nsOn, () => setNsOn(!nsOn))}
            {renderParameterButton("MOD", modOn, () => setModOn(!modOn))}
            {renderParameterButton("EQ", eqOn, () => setEqOn(!eqOn))}
          </View>

          {/* Assigns section */}
          <View style={styles.assignsSection}>
            <Text style={styles.assignsHeading}>Assigns</Text>
            <View style={styles.assignsRow}>
              {renderParameterButton(
                "1",
                assign1On,
                () => setAssign1On(!assign1On),
                "assign"
              )}
              {renderParameterButton(
                "2",
                assign2On,
                () => setAssign2On(!assign2On),
                "assign"
              )}
              {renderParameterButton(
                "3",
                assign3On,
                () => setAssign3On(!assign3On),
                "assign"
              )}
              {renderParameterButton(
                "4",
                assign4On,
                () => setAssign4On(!assign4On),
                "assign"
              )}
              {renderParameterButton(
                "5",
                assign5On,
                () => setAssign5On(!assign5On),
                "assign"
              )}
              {renderParameterButton(
                "6",
                assign6On,
                () => setAssign6On(!assign6On),
                "assign"
              )}
              {renderParameterButton(
                "7",
                assign7On,
                () => setAssign7On(!assign7On),
                "assign"
              )}
              {renderParameterButton(
                "8",
                assign8On,
                () => setAssign8On(!assign8On),
                "assign"
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e0e7ff", // indigo-100
    borderWidth: 12,
    borderColor: "#27272a", // zinc-800
    borderRadius: 8,
    position: "relative",
    overflow: Platform.select({
      web: "visible",
      default: "hidden",
    }) as any,
    ...Platform.select({
      web: {
        boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
      default: {
        // React Native doesn't support inset shadows
        backgroundColor: "#c7d2fe", // Slightly darker for inset effect
      },
    }),
  },
  innerBezel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: "none",
    ...Platform.select({
      web: {
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.5)",
      },
      default: {
        // Visual approximation for React Native
        borderWidth: 2,
        borderColor: "rgba(0, 0, 0, 0.2)",
      },
    }),
  },
  screenContent: {
    height: "100%",
    width: "100%",
    padding: 24,
    minHeight: 300,
    justifyContent: "space-between",
    backgroundColor: "#dbeafe", // blue-100
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(30, 58, 138, 0.2)", // blue-900/20
    paddingBottom: 8,
  },
  statusLeft: {
    flexDirection: "row",
    gap: 4,
    alignItems: "flex-start",
  },
  statusChipColumn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  toneLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#f97316",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  toneName: {
    fontSize: 8,
    fontWeight: "600",
    color: "#f97316",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  statusTextInactive: {
    color: "rgba(30, 58, 138, 0.5)", // blue-900/50
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusChipActive: {
    backgroundColor: "#bfdbfe", // blue-200
  },
  statusChipGuitar: {
    paddingHorizontal: 10,
  },
  statusChipInactive: {
    opacity: 0.6,
  },
  statusChipPressed: {
    backgroundColor: "#1e3a8a", // blue-900
  },
  statusChipTextPressed: {
    fontWeight: "700",
    fontSize: 14,
    color: "#ffffff",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  bpmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  bpmLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e3a8a",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  bpmContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bpmInput: {
    width: 40,
    borderWidth: 1,
    borderColor: "rgba(30, 58, 138, 0.4)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: Platform.OS === "web" ? 3 : 5,
    fontSize: 14,
    fontWeight: "700",
    color: "#1e3a8a",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "#f8fafc",
  },
  bpmArrows: {
    flexDirection: "column",
    gap: 2,
  },
  bpmArrowButton: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: "#e0e7ff",
  },
  bpmArrowText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e3a8a",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 16,
  },
  bankText: {
    fontSize: 60,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 60,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  patchInfo: {
    paddingBottom: 8,
    flex: 1,
  },
  patchMeta: {
    marginTop: 4,
    gap: 2,
  },
  patchMetaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    opacity: 0.8,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    opacity: 0.6,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  patchNameText: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    maxWidth: 300,
  },
  popoverBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "rgba(219, 234, 254, 0.6)", // blue-100/60 within LCD
  },
  popover: {
    width: "90%",
    maxWidth: 360,
    maxHeight: 260,
    backgroundColor: "#e0e7ff", // indigo-100
    borderColor: "#1e3a8a", // blue-900
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.12)",
      },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "rgba(30, 58, 138, 0.2)",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#1e3a8a",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "#f8fafc",
  },
  popoverList: {
    width: "100%",
  },
  popoverListContent: {
    gap: 6,
  },
  popoverItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  popoverItemPressed: {
    backgroundColor: "#dbeafe",
  },
  popoverItemActive: {
    borderWidth: 1,
    borderColor: "#1e3a8a",
    backgroundColor: "#dbeafe",
  },
  popoverItemLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e3a8a",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  popoverItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  parameters: {
    flexDirection: "column",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "rgba(30, 58, 138, 0.2)", // blue-900/20
  },
  parameterRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  assignsSection: {
    flexDirection: "column",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1, // thin divider between parameters and assigns
    borderTopColor: "rgba(30, 58, 138, 0.2)",
  },
  assignsHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.6,
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  assignsRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  parameterButton: {
    flex: 1,
    padding: 4,
    alignItems: "center",
    borderRadius: 4,
  },
  parameterButtonActive: {
    backgroundColor: "#bfdbfe", // blue-200
  },
  parameterButtonInactive: {
    backgroundColor: "#e0e7ff", // blue-100
  },
  parameterButtonPressed: {
    backgroundColor: "#1e3a8a", // blue-900
  },
  parameterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e3a8a", // blue-900
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  parameterTextInactive: {
    color: "rgba(30, 58, 138, 0.3)", // blue-900/30
  },
  parameterTextPressed: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
