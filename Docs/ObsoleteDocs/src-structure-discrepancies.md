# Discrepancies: Expected vs Actual `src/` Structure

This document records observed discrepancies between the expected `src/` folder layout (see `Docs/src-folder-structure.md`) and the current repository state. It is an audit-style report to help plan the next cleanup/migration steps.

## Summary

- Expected: a tidy `src/` root with mostly directories (`components/`, `screens/`, `lib/`, `hooks/`, etc.) and only a few top-level entry files (`App.tsx`, `navigation.tsx`).
- Actual: many feature and component files remain directly under `src/` instead of in the expected subfolders. There are also likely duplicate or closely-related files spread between `src/` root and subfolders (e.g., protocol/map files that appear both at top-level and in `lib/`).

## Directories present under `src/` (observed)

- `components/`, `contexts/`, `hooks/`, `lib/`, `modules/`, `navigation/`, `screens/`, `services/`, `styles/`

These folders exist (good), but many files that should live inside them are currently in the `src/` root.

## Representative files sitting at `src/` root (should be reorganized)

The following files were observed at the `src/` root. Many of these are screens, components, hooks or lib files that should be moved into the corresponding subfolder.

- UI / Screens / Components currently at root:
  - `AdjustingTabBar.tsx`
  - `App.tsx`
  - `AppNavigationContainer.tsx`
  - `AsyncStorageUtils.tsx`
  - `BLEService.tsx`
  - `BluetoothDevicesView.android.tsx`
  - `BluetoothDevicesView.tsx`
  - `BluetoothDevicesView.web.tsx`
  - `BluetoothSettingsScreen.tsx`
  - `ContextualStyle.tsx`
  - `DocsDesignPage.tsx`
  - `FieldPlaceholder.tsx`
  - `FieldRow.tsx`
  - `FieldStyles.tsx`
  - `IoSetupScreen.tsx`
  - `LibraryPatchListNoResultsView.tsx`
  - `LibraryPatchListScreen.tsx`
  - `MIDINotAvailableView.tsx`
  - `MidiIo.tsx`
  - `PatchAssignsScreen.tsx`
  - `PatchEffects*` (many `PatchEffects*.tsx` files)
  - `PatchListView.tsx`
  - `PatchMainScreen.tsx`
  - `PatchMasterOtherScreen.tsx`
  - `PatchMasterPedalGkCtlScreen.tsx`
  - `PatchNameHeaderButton.tsx`
  - `PatchSaveAsScreen.tsx`
  - `PatchSaveHeaderButton.tsx`
  - `PatchTone*` (many `PatchTone*.tsx` files)
  - `PendingContentPlaceholders.tsx`
  - `Picker.ios.tsx`, `Picker.tsx`
  - `PopoverAwareScrollView.tsx`
  - `Popovers.tsx`
  - `RefreshControl.tsx`
  - `RemoteField*` (many `RemoteField*.tsx` files)
  - `RolandAddressMap.ts`
  - `RolandDataTransfer.tsx`
  - `RolandGR55AddressMap.ts`
  - `RolandGR55AssignsContainer.tsx`
  - `RolandGR55Commands.tsx`
  - `RolandGR55NotConnectedView.tsx`
  - `RolandGR55RemotePatchDescriptions.tsx`
  - `RolandIoSetup.tsx`
  - `RolandRemotePageContext.tsx`
  - `RolandRemotePatchSelection.tsx`
  - `RolandSysExProtocol.ts`
  - `SafeAreaUtils.tsx`
  - `SegmentedPicker.tsx`
  - `Slider.tsx`, `Slider.web.tsx`
  - `Theme.tsx`, `Themed*` components
  - `UserOptions.tsx`
  - `useAssignsMap.tsx`, `useLayout.tsx`, `usePatchMap.tsx`, `usePrompt.tsx`, `useRemoteField.tsx`, `useRenamePatchPrompt.tsx`, `useRolandRemotePageState.tsx`, `useRolandRemotePatchState.tsx`, `useRolandRemoteSystemState.tsx`, `useTopTabNavigatorDefaults.tsx`

Note: This is a representative list based on a repository snapshot; a full scan may reveal more files.

## Likely duplicates and cross-location confusion

- Protocols / maps vs copies: files like `RolandSysExProtocol.ts`, `RolandAddressMap.ts`, and `RolandGR55AddressMap.ts` exist at the `src/` root while there is also a `src/lib/` directory intended for protocol/device code. This indicates either duplicated implementations or confusion about where to import them from.
- Multiple `RemoteField*` components live at root rather than in `components/` or a `components/remote-fields/` subfolder.

A definitive duplicate-file report requires running a repository-wide search for same-named files and for modules that export the same symbol from different paths.

## Impact / Risks

- Import path churn: files in `src/` root are frequently imported with inconsistent relative paths, leading to incorrect `./src/...` prefixes and type errors.
- Hard-to-maintain codebase: mixing screens, components and low-level libraries at top-level makes it harder for contributors to find code and increases cognitive load.
- Cascading TypeScript errors: moving files without fixing imports causes many `Cannot find module` and type errors that block verification.
- Potential runtime duplication: if duplicate files are left under different paths, bundlers or packaging could include both variants or cause ambiguous imports.

## Suggested non-invasive next steps (audit-only)

1. Create an authoritative mapping (CSV or simple table) showing each file's current path and the intended final path (e.g., `src/RolandSysExProtocol.ts` -> `src/lib/RolandSysExProtocol.ts`).
2. Run a repo-wide duplicate-name scan to identify same-named files in multiple locations.
3. Prioritize moving high-impact domain modules to `src/lib/` first (Roland/MIDI protocol, address maps), then screens to `src/screens/`, and UI widgets to `src/components/`.
4. After each logical batch move, run `npx tsc --noEmit` to surface remaining import/type errors and fix incrementally.

## Proposed mapping (current -> proposed target)

Below is a non-destructive proposed mapping of files currently found at the `src/` root (and obvious candidates in subfolders) to their intended locations under `src/`. This is a guidance-only table for planning moves — no files will be moved by this document.

- `src/App.tsx` -> keep at `src/App.tsx` (app entry)
- `src/navigation.tsx`, `src/AppNavigationContainer.tsx` -> keep at `src/navigation.tsx` / `src/AppNavigationContainer.tsx`

- Screens (move to `src/screens/`):

  - `src/IoSetupScreen.tsx` -> `src/screens/IoSetupScreen.tsx`
  - `src/PatchMainScreen.tsx` -> `src/screens/PatchMainScreen.tsx`
  - `src/PatchListView.tsx` -> `src/screens/PatchListView.tsx`
  - `src/PatchAssignsScreen.tsx` -> `src/screens/PatchAssignsScreen.tsx`
  - `src/PatchEffects*.tsx` -> `src/screens/PatchEffects/*` (individual files kept with same names)
  - `src/PatchTone*.tsx` -> `src/screens/PatchTone/*`
  - `src/PatchMasterOtherScreen.tsx`, `src/PatchMasterPedalGkCtlScreen.tsx` -> `src/screens/`
  - `src/LibraryPatchListScreen.tsx`, `src/LibraryPatchListNoResultsView.tsx` -> `src/screens/`
  - `src/BluetoothSettingsScreen.tsx`, `src/BluetoothDevicesView*.tsx` -> `src/screens/`

- Components (move to `src/components/`):

  - `src/AdjustingTabBar.tsx` -> `src/components/AdjustingTabBar.tsx`
  - `src/FieldRow.tsx`, `src/FieldPlaceholder.tsx`, `src/FieldStyles.tsx` -> `src/components/fields/`
  - `src/Picker.tsx`, `src/Picker.ios.tsx` -> `src/components/Picker/`
  - `src/PopoverAwareScrollView.tsx`, `src/Popovers.tsx` -> `src/components/`
  - `src/ThemedText.tsx`, `src/ThemedPicker.tsx`, `src/ThemedSearchBar.tsx`, `src/Theme.tsx` -> `src/components/ui/` or `src/components/`
  - `src/Slider.tsx`, `src/Slider.web.tsx` -> `src/components/`
  - `src/RemoteField*.tsx` -> `src/components/remote-fields/`
  - `src/PatchNameHeaderButton.tsx`, `src/PatchSaveHeaderButton.tsx` -> `src/components/`

- Hooks (move to `src/hooks/`):

  - `src/useRemoteField.tsx` -> `src/hooks/useRemoteField.tsx`
  - `src/usePatchMap.tsx` -> `src/hooks/usePatchMap.tsx`
  - `src/useAssignsMap.tsx` -> `src/hooks/useAssignsMap.tsx`
  - `src/useLayout.tsx`, `src/usePrompt.tsx`, `src/useRenamePatchPrompt.tsx` -> `src/hooks/`

- Services (move to `src/services/`):

  - `src/MidiIo.tsx` -> `src/services/MidiIo.tsx`
  - `src/BLEService.tsx` -> `src/services/BLEService.tsx`
  - `src/RolandDataTransfer.tsx` -> `src/services/RolandDataTransfer.tsx`

- Low-level domain / protocol (move to `src/lib/`):

  - `src/RolandSysExProtocol.ts` -> `src/lib/RolandSysExProtocol.ts`
  - `src/RolandAddressMap.ts` -> `src/lib/RolandAddressMap.ts`
  - `src/RolandGR55AddressMap.ts` -> `src/lib/RolandGR55AddressMap.ts`
  - `src/RolandGR55*` maps/assigns/patch map files -> `src/lib/roland-gr55/` (grouped)

- Contexts (move to `src/contexts/`):

  - `src/RolandRemotePageContext.tsx` -> `src/contexts/RolandRemotePageContext.tsx`

- Navigation helpers (move to `src/navigation/`):

  - any small navigator defaults or helpers -> `src/navigation/` (the main `navigation.tsx` remains top-level or in `src/navigation/index.tsx`)

- Utilities / styles (move to `src/styles/` or `src/utils/`):
  - `src/SafeAreaUtils.tsx` -> `src/utils/SafeAreaUtils.tsx` or `src/components/`
  - `src/ContextualStyle.tsx` -> `src/styles/ContextualStyle.tsx`
  - `src/UserOptions.tsx` -> `src/components/` or `src/settings/`

This mapping is intentionally conservative: it groups files by their primary role (screen, component, hook, service, lib). After creating the authoritative mapping, each planned file move should be applied in small batches and followed by `npx tsc --noEmit` to catch broken imports.

## Notes and caveats

- This report is based on a snapshot of the repository and a recent `ls` listing of `src/` contents. A full programmatic audit (searching the whole tree for references and duplicates) will yield a more precise actionable plan.
- The repository currently includes many files under `src/` root; moving them requires careful import-updates (no re-exports) and repeated typechecks.

---

Generated: 21 December 2025
