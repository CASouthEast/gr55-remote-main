import { useCallback, useMemo } from "react";

import { usePrompt } from "./usePrompt";
import { roundTripEncode } from "../lib/RolandAddressMap";
import { RolandGR55AddressMapAbsolute as GR55 } from "../lib/roland-gr55/RolandGR55AddressMap";

export function useRenamePatchPrompt({
  patchName,
  setPatchName,
}: {
  patchName: string;
  setPatchName: (newValue: string) => void;
}): { renamePatch: () => Promise<void> } {
  const { prompt } = usePrompt();
  const renamePatch = useCallback(async () => {
    const newPatchName = await prompt(
      "Edit patch name",
      patchName || "Untitled"
    );
    if (newPatchName == null || newPatchName === "") {
      return;
    }
    setPatchName(
      // Round-trip encode in order to provide an accurate preview
      roundTripEncode(
        newPatchName,
        GR55.temporaryPatch.common.patchName.definition.type
      )
    );
  }, [patchName, prompt, setPatchName]);
  return useMemo(() => ({ renamePatch }), [renamePatch]);
}
