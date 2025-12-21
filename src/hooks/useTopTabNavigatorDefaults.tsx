import { useMemo } from "react";

import { renderAdjustingMaterialTopTabBar } from "../components/AdjustingTabBar";
import { usePopovers } from "../components/Popovers";

export function useTopTabNavigatorDefaults() {
  const { closeAllPopovers } = usePopovers();

  return useMemo(
    () =>
      ({
        backBehavior: "history",
        screenListeners: {
          swipeStart: () => {
            closeAllPopovers();
          },
          tabPress: () => {
            closeAllPopovers();
          },
          blur: () => {
            closeAllPopovers();
          },
        },
        tabBar: renderAdjustingMaterialTopTabBar,
      } as const),
    [closeAllPopovers]
  );
}
