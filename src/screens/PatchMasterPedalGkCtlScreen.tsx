import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";

import { PatchStackParamList } from "../components/navigation";
import { PatchMasterPedalGkCtlCustomNavigation } from "../components/navigation/PatchMasterPedalGkCtlCustomNavigation";
import { RolandRemotePatchContext as PATCH } from "../contexts/RolandRemotePageContext";
import { useRemoteField } from "../hooks/useRemoteField";
import { RolandGR55AddressMapAbsolute as GR55 } from "../lib/roland-gr55/RolandGR55AddressMap";

export function PatchMasterPedalGkCtlScreen({
  navigation,
}: NativeStackScreenProps<PatchStackParamList, "PatchMasterPedalGkCtl">) {
  const [patchName] = useRemoteField(
    PATCH,
    GR55.temporaryPatch.common.patchName
  );
  useEffect(() => {
    navigation.setOptions({
      title: patchName + " > Pedal / GK Control",
    });
  }, [navigation, patchName]);

  return <PatchMasterPedalGkCtlCustomNavigation />;
}
