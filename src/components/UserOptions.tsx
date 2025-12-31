import { createContext, useContext, useMemo } from "react";

import { useStateWithStoredDefault } from "./AsyncStorageUtils";

export type UserOptions = Readonly<{
  enableExperimentalFeatures: boolean;
  webTabBarPosition: "top" | "bottom";
  visibleTabs: {
    patch: boolean;
    library: boolean;
    system: boolean;
  };
  hardwareTheme: "metallicBlack" | "turquoise";
}>;

const DEFAULT_OPTIONS: UserOptions = {
  enableExperimentalFeatures: false,
  webTabBarPosition: "top",
  visibleTabs: {
    patch: true,
    library: true,
    system: true,
  },
  hardwareTheme: "metallicBlack",
};

const UserOptionsContext = createContext<
  readonly [UserOptions, (newOptions: Partial<UserOptions>) => void]
>([DEFAULT_OPTIONS, () => {}]);

export function UserOptionsContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enableExperimentalFeatures, setEnableExperimentalFeatures] =
    useStateWithStoredDefault<boolean>(
      "@motiz88/gr55-remote/UserOptions/enableExperimentalFeatures",
      DEFAULT_OPTIONS.enableExperimentalFeatures
    );
  const [webTabBarPosition, setWebTabBarPosition] = useStateWithStoredDefault<
    "top" | "bottom"
  >(
    "@motiz88/gr55-remote/UserOptions/webTabBarPosition",
    DEFAULT_OPTIONS.webTabBarPosition
  );
  const [visibleTabs, setVisibleTabs] = useStateWithStoredDefault<
    UserOptions["visibleTabs"]
  >(
    "@motiz88/gr55-remote/UserOptions/visibleTabs",
    DEFAULT_OPTIONS.visibleTabs
  );
  const [hardwareTheme, setHardwareTheme] = useStateWithStoredDefault<
    UserOptions["hardwareTheme"]
  >(
    "@motiz88/gr55-remote/UserOptions/hardwareTheme",
    DEFAULT_OPTIONS.hardwareTheme
  );

  const userOptionsAndSetter = useMemo(
    () =>
      [
        {
          enableExperimentalFeatures,
          webTabBarPosition,
          visibleTabs,
          hardwareTheme,
        },
        (newOptions: Partial<UserOptions>) => {
          if (newOptions.enableExperimentalFeatures != null) {
            setEnableExperimentalFeatures(
              newOptions.enableExperimentalFeatures
            );
          }
          if (newOptions.webTabBarPosition != null) {
            setWebTabBarPosition(newOptions.webTabBarPosition);
          }
          if (newOptions.visibleTabs != null) {
            setVisibleTabs({ ...visibleTabs, ...newOptions.visibleTabs });
          }
          if (newOptions.hardwareTheme != null) {
            setHardwareTheme(newOptions.hardwareTheme);
          }
        },
      ] as const,
    [
      enableExperimentalFeatures,
      webTabBarPosition,
      visibleTabs,
      hardwareTheme,
      setEnableExperimentalFeatures,
      setWebTabBarPosition,
      setVisibleTabs,
      setHardwareTheme,
    ]
  );
  return (
    <UserOptionsContext.Provider value={userOptionsAndSetter}>
      {children}
    </UserOptionsContext.Provider>
  );
}

export function useUserOptions() {
  return useContext(UserOptionsContext);
}
