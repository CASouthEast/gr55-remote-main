#!/usr/bin/env bash
set -euo pipefail

# Moves remaining .tsx files in src/ root (not subdirs) except App.tsx
# Usage: ./scripts/move_src_remaining.sh [--dry-run]

ROOT=src
DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then DRY_RUN=1; fi

shopt -s nullglob
for f in "$ROOT"/*.tsx; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  if [ "$base" = "App.tsx" ]; then
    echo "skip $base"
    continue
  fi

  target=""
  case "$base" in
    PatchEffects*) target="$ROOT/screens/PatchEffects" ;;
    PatchTone*) target="$ROOT/screens/PatchTone" ;;
    IoSetupScreen*|PatchMainScreen*|PatchListView*|PatchAssignsScreen*|LibraryPatchList*|LibraryPatchListNoResultsView*|PatchMaster*|PatchNameHeaderButton*|PatchSaveHeaderButton*) target="$ROOT/screens" ;;
    Bluetooth*|MIDINotAvailableView*|BluetoothSettingsScreen*|BluetoothDevicesView*) target="$ROOT/screens" ;;
    RemoteField*) target="$ROOT/components/remote-fields" ;;
    FieldRow*|FieldPlaceholder*|FieldStyles*) target="$ROOT/components/fields" ;;
    Picker* ) target="$ROOT/components/Picker" ;;
    Themed*|Theme*|ThemedText*|ThemedPicker*|ThemedSearchBar*) target="$ROOT/components/ui" ;;
    Popover*|PopoverAwareScrollView*|Popovers*) target="$ROOT/components" ;;
    AdjustingTabBar*|UserOptions*) target="$ROOT/components" ;;
    Slider* ) target="$ROOT/components" ;;
    use* ) target="$ROOT/hooks" ;;
    MidiIo*|BLEService*|RolandDataTransfer* ) target="$ROOT/services" ;;
    RolandGR55* ) target="$ROOT/lib/roland-gr55" ;;
    RolandSysExProtocol*|RolandAddressMap* ) target="$ROOT/lib" ;;
    Roland* ) target="$ROOT/lib" ;;
    *Context* ) target="$ROOT/contexts" ;;
    SafeAreaUtils* ) target="$ROOT/utils" ;;
    ContextualStyle* ) target="$ROOT/styles" ;;
    * ) target="$ROOT/components" ;;
  esac

  mkdir -p "$target"
  dest="$target/$base"

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] would move $f -> $dest"
    continue
  fi

  if [ -e "$dest" ]; then
    git rm -f --ignore-unmatch "$dest" || rm -f "$dest"
  fi
  git mv "$f" "$dest"
  echo "moved $f -> $dest"

done
shopt -u nullglob

echo "Done."
