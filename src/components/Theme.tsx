import {
  createTheme as createRNETheme,
  darkColors,
  lightColors,
  ThemeProvider as RNEThemeProvider,
} from "@rneui/themed";
import { createContext, useContext, useMemo } from "react";
import { Platform, useColorScheme } from "react-native";
import {
  MD2LightTheme,
  MD2DarkTheme,
  Provider as PaperProvider,
} from "react-native-paper";

// TypeScript interfaces for theme structure
export interface NavigationTabBarColors {
  background: string;
  activeText: string;
  inactiveText: string;
  indicator: string;
  border: string;
  hoverBackground: string;
  pressBackground: string;
}

export interface NavigationColors {
  tabBar: NavigationTabBarColors;
}

export interface ThemeColors {
  assigns: {
    background: string;
    tabBarBackground: string;
  };
  library: {
    selectedPatch: string;
  };
  navigation: NavigationColors;
  pendingTextPlaceholder: string;
  searchBarText: string;
  saveAsSummaryBackground: string;
  slider: {
    trackMaximum: string;
    trackMinimum: string;
    labelText: string;
    labelTextShadow: string;
    labelTextBackground: string;
  };
}

export interface AppTheme {
  colors: ThemeColors;
}

export const DefaultTheme: AppTheme = {
  colors: {
    assigns: {
      // 10/11ths of the way from cornflowerblue to #f2f2f2
      background: "#E5EAF2",
      // 10/11ths of the way from cornflowerblue to #ffffff
      tabBarBackground: "#F1F5FD",
    },
    library: {
      selectedPatch: "#73b2f9",
    },
    navigation: {
      tabBar: {
        background: "rgb(242, 242, 242)",
        activeText: "rgb(0, 122, 255)",
        inactiveText: "rgb(28, 28, 30)",
        indicator: "rgb(0, 122, 255)",
        border: "rgb(216, 216, 216)",
        hoverBackground: "rgba(0, 122, 255, 0.1)",
        pressBackground: "rgba(0, 122, 255, 0.2)",
      },
    },
    pendingTextPlaceholder: "rgb(216, 216, 216)",
    searchBarText: "#000000",
    saveAsSummaryBackground: "#a3ff9e",
    slider: {
      trackMaximum: "rgb(227, 227, 228)",
      trackMinimum: "rgb(180, 180, 180)",
      labelText: "black",
      labelTextShadow: "rgb(227, 227, 228)",
      labelTextBackground: "transparent",
    },
  },
};

export const DarkTheme: AppTheme = {
  colors: {
    assigns: {
      // 10/11ths of the way from cornflowerblue to #010101
      background: "#0A0E16",
      // 10/11ths of the way from cornflowerblue to #121212
      tabBarBackground: "#191E26",
    },
    library: {
      selectedPatch: "#05448b",
    },
    navigation: {
      tabBar: {
        background: "rgb(28, 28, 30)",
        activeText: "rgb(0, 122, 255)",
        inactiveText: "rgb(255, 255, 255)",
        indicator: "rgb(0, 122, 255)",
        border: "rgb(39, 39, 41)",
        hoverBackground: "rgba(0, 122, 255, 0.15)",
        pressBackground: "rgba(0, 122, 255, 0.25)",
      },
    },
    pendingTextPlaceholder: "rgb(39, 39, 41)",
    searchBarText: "#ffffff",
    saveAsSummaryBackground: "#1A4D26",
    slider: {
      trackMinimum: "rgb(91, 91, 96)",
      trackMaximum: "rgb(29, 29, 32)",
      labelText: "white",
      labelTextShadow: "black",
      labelTextBackground: "transparent",
    },
  },
};

export const rneTheme = createRNETheme({
  lightColors: {
    primary: "rgb(0, 122, 255)",
    background: "rgb(242, 242, 242)",
    white: "rgb(255, 255, 255)",
    black: "rgb(28, 28, 30)",
    divider: "rgb(216, 216, 216)",
    error: "rgb(255, 59, 48)",

    // Colors selected mostly to make SearchBar look passable on web
    grey0: "rgb(0, 0, 0)",
    grey1: "rgb(16, 16, 16)",
    grey2: "rgb(76, 76, 76)",
    grey3: "rgb(96, 96, 96)",
    grey4: "rgb(216, 216, 216)",
    grey5: "rgb(242, 242, 242)",
    ...Platform.select({
      ios: lightColors.platform.ios,
      android: lightColors.platform.android,
    }),
  },
  darkColors: {
    background: "rgb(28, 28, 30)",
    black: "rgb(255, 255, 255)",
    white: "rgb(28, 28, 30)",
    divider: "rgb(39, 39, 41)",
    error: "rgb(255, 69, 58)",

    // Colors selected mostly to make SearchBar look passable on web
    grey0: "rgb(0, 0, 0)",
    grey1: "rgb(16, 16, 16)",
    grey2: "rgb(76, 76, 76)",
    grey3: "rgb(229, 229, 231)",
    grey4: "rgb(242, 242, 242)",
    grey5: "rgb(255, 255, 255)",
    ...Platform.select({
      ios: darkColors.platform.ios,
      android: darkColors.platform.android,
    }),
    primary: "rgb(0, 122, 255)",
  },
});

const paperThemeDark = {
  ...MD2DarkTheme,
  colors: {
    ...MD2DarkTheme.colors,
    primary: rneTheme.darkColors?.primary,
  },
};

const paperThemeLight = {
  ...MD2LightTheme,
  colors: {
    ...MD2LightTheme.colors,
    primary: rneTheme.lightColors?.primary,
  },
};

const ThemeContext = createContext<AppTheme>(DefaultTheme);

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme;
  const rneThemeWithMode = useMemo(
    () =>
      createRNETheme({
        ...rneTheme,
        mode: scheme === "dark" ? "dark" : "light",
      }),
    [scheme]
  );
  return (
    <ThemeContext.Provider value={theme}>
      <RNEThemeProvider key={scheme} theme={rneThemeWithMode}>
        <PaperProvider
          theme={scheme === "dark" ? paperThemeDark : paperThemeLight}
        >
          {children}
        </PaperProvider>
      </RNEThemeProvider>
    </ThemeContext.Provider>
  );
}
