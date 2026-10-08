import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
} from "react";
import { View, StyleSheet } from "react-native";

import { LibraryPatchListNoResultsView } from "./LibraryPatchListNoResultsView";
import { PatchListView } from "./PatchListView";
import { ThemedSearchBar } from "../components/ThemedSearchBar";
import { RootTabParamList } from "../components/navigation";
import {
  SidebarPageLayout,
  SidebarTab,
} from "../components/navigation/SidebarPageLayout";
import { useRolandRemotePatchSelection } from "../lib/RolandRemotePatchSelection";
import { RolandGR55NotConnectedView } from "../lib/roland-gr55/RolandGR55NotConnectedView";
import {
  useRolandGR55RemotePatchDescriptions,
  RolandGR55PatchDescription,
} from "../lib/roland-gr55/RolandGR55RemotePatchDescriptions";
import { MIDINotAvailableView } from "../screens/MIDINotAvailableView";
import { useMidiIoContext } from "../services/MidiIo";
import { useFocusQueryPriority } from "../services/RolandDataTransfer";
import { useMainScrollViewSafeAreaStyle } from "../utils/SafeAreaUtils";

// Context to share state between the screen and tab components
const LibraryContext = createContext<{
  patches: RolandGR55PatchDescription[] | null;
  search: string;
  selectedPatch: any;
  setSelectedPatch: (patch: any) => void;
  safeAreaStyle: any;
  anyPatchesPending: boolean;
}>({
  patches: null,
  search: "",
  selectedPatch: null,
  setSelectedPatch: () => {},
  safeAreaStyle: {},
  anyPatchesPending: false,
});

function LibraryTabContent({ filterStyle }: { filterStyle: string }) {
  const {
    patches,
    search,
    selectedPatch,
    setSelectedPatch,
    safeAreaStyle,
    anyPatchesPending,
  } = useContext(LibraryContext);
  const deferredSearch = useDeferredValue(search);
  const patchListRef = useRef<React.ComponentRef<typeof PatchListView>>(null);

  const filteredPatchList = useMemo(() => {
    if (!patches) {
      return null;
    }
    // If searching, ignore filterStyle and show all matching results
    if (deferredSearch) {
      return patches.filter((patch) => {
        return patch.data?.name
          .toLowerCase()
          .includes(deferredSearch.toLowerCase());
      });
    }
    // Otherwise filter by style
    return patches.filter((patch) => patch.identity.styleLabel === filterStyle);
  }, [deferredSearch, patches, filterStyle]);

  // Scroll to selected patch if needed
  const isPendingScroll = useRef<boolean>(false);
  useEffect(() => {
    // Logic from original file to scroll to selection.
    // We might need to adjust this since now tabs change.
    // For now, simpler implementation:
  }, [selectedPatch]);

  if (
    search !== "" &&
    !(anyPatchesPending || deferredSearch !== search) &&
    filteredPatchList &&
    !filteredPatchList.length
  ) {
    return <LibraryPatchListNoResultsView />;
  }

  return (
    <PatchListView
      ref={patchListRef}
      data={filteredPatchList}
      selectedPatch={selectedPatch}
      onSelectedPatchChange={setSelectedPatch}
      contentContainerStyle={safeAreaStyle}
    />
  );
}

// Tab Components
function LeadTab() {
  return <LibraryTabContent filterStyle="LEAD" />;
}
function RhythmTab() {
  return <LibraryTabContent filterStyle="RHYTHM" />;
}
function OtherTab() {
  return <LibraryTabContent filterStyle="OTHER" />;
}
function UserTab() {
  return <LibraryTabContent filterStyle="USER" />;
}

const libraryTabs: SidebarTab[] = [
  { key: "LEAD", title: "Lead", component: LeadTab },
  { key: "RHYTHM", title: "Rhythm", component: RhythmTab },
  { key: "OTHER", title: "Other", component: OtherTab },
  { key: "USER", title: "User", component: UserTab },
];

export function LibraryPatchListScreen({
  navigation,
}: BottomTabScreenProps<RootTabParamList, "LibraryPatchList", "RootTab">) {
  const safeAreaStyle = useMainScrollViewSafeAreaStyle();
  const [search, setSearch] = useState("");
  const { patches } = useRolandGR55RemotePatchDescriptions();
  const { selectedPatch, setSelectedPatch } = useRolandRemotePatchSelection();

  const handleChangeText = useCallback((value: string) => {
    setSearch(value);
  }, []);

  useFocusQueryPriority("read_patch_list");

  const anyPatchesPending = useMemo(
    () => patches?.some((patch) => patch.status === "pending") ?? false,
    [patches]
  );

  const deferredSearch = useDeferredValue(search);

  const { midiStatus } = useMidiIoContext();
  if (midiStatus === "not-supported" || midiStatus === "permission-denied") {
    return <MIDINotAvailableView reason={midiStatus} />;
  }

  if (!patches) {
    return <RolandGR55NotConnectedView navigation={navigation} />;
  }

  return (
    <LibraryContext.Provider
      value={{
        patches,
        search,
        selectedPatch,
        setSelectedPatch,
        safeAreaStyle,
        anyPatchesPending,
      }}
    >
      <View style={styles.container}>
        <ThemedSearchBar
          placeholder="Search patches..."
          onChangeText={handleChangeText}
          value={search}
          showLoading={anyPatchesPending || deferredSearch !== search}
        />
        <SidebarPageLayout
          tabs={libraryTabs}
          title="Library"
          defaultTab="USER"
          contentContainerStyle={styles.contentContainer}
        />
      </View>
    </LibraryContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 0, // PatchListView handles its own padding/safe area
  },
});
