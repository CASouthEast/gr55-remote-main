// TODO: Configure this as a polyfill in Metro?
import "setimmediate";
import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { AlertsProvider } from "react-native-paper-alerts";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigationContainer from "./components/AppNavigationContainer";
import { PopoversContainer } from "./components/Popovers";
import { ThemeProvider } from "./components/Theme";
import { UserOptionsContainer } from "./components/UserOptions";
import { RootTabNavigator } from "./components/navigation/RootTabNavigator";
import { ThemedContextualStyleProvider } from "./components/ui/ThemedContextualStyleProvider";
import {
  RolandRemotePatchContext,
  RolandRemoteSystemContext,
} from "./contexts/RolandRemotePageContext";
import { useRolandRemotePatchState } from "./hooks/useRolandRemotePatchState";
import { useRolandRemoteSystemState } from "./hooks/useRolandRemoteSystemState";
import { RolandIoSetupContainer } from "./lib/RolandIoSetup";
import { RolandRemotePatchSelectionContainer } from "./lib/RolandRemotePatchSelection";
import { RolandGR55AssignsContainer } from "./lib/roland-gr55/RolandGR55AssignsContainer";
import { RolandGR55RemotePatchDescriptionsContainer } from "./lib/roland-gr55/RolandGR55RemotePatchDescriptions";
import { setNetworkSessionsEnabled } from "./modules/modules/midi-hardware-manager";
import { MidiIoSetupContainer } from "./services/MidiIo";
import { RolandDataTransferContainer } from "./services/RolandDataTransfer";

function RolandRemotePatchStateContainer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const rolandRemotePatchState = useRolandRemotePatchState();
  return (
    <RolandRemotePatchContext.Provider value={rolandRemotePatchState}>
      {children}
    </RolandRemotePatchContext.Provider>
  );
}

function RolandRemoteSystemStateContainer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const rolandRemoteSystemState = useRolandRemoteSystemState();
  return (
    <RolandRemoteSystemContext.Provider value={rolandRemoteSystemState}>
      {children}
    </RolandRemoteSystemContext.Provider>
  );
}

export default function App() {
  React.useEffect(() => {
    setNetworkSessionsEnabled(true);
  }, []);
  return (
    <SafeAreaProvider>
      <UserOptionsContainer>
        <MidiIoSetupContainer>
          <RolandIoSetupContainer>
            <RolandDataTransferContainer>
              <RolandRemoteSystemStateContainer>
                <RolandRemotePatchSelectionContainer>
                  <RolandRemotePatchStateContainer>
                    <RolandGR55RemotePatchDescriptionsContainer>
                      <AppNavigationContainer>
                        <RolandGR55AssignsContainer>
                          <ThemeProvider>
                            {/* @ts-ignore AlertsProvider's types are busted :( */}
                            <AlertsProvider>
                              <ThemedContextualStyleProvider>
                                <PopoversContainer>
                                  <KeyboardAvoidingView
                                    behavior={
                                      Platform.OS === "ios"
                                        ? "padding"
                                        : undefined
                                    }
                                    enabled={Platform.OS === "ios"}
                                    style={styles.keyboardAvoidingView}
                                  >
                                    <RootTabNavigator />
                                  </KeyboardAvoidingView>
                                </PopoversContainer>
                              </ThemedContextualStyleProvider>
                            </AlertsProvider>
                          </ThemeProvider>
                        </RolandGR55AssignsContainer>
                      </AppNavigationContainer>
                    </RolandGR55RemotePatchDescriptionsContainer>
                  </RolandRemotePatchStateContainer>
                </RolandRemotePatchSelectionContainer>
              </RolandRemoteSystemStateContainer>
            </RolandDataTransferContainer>
          </RolandIoSetupContainer>
        </MidiIoSetupContainer>
      </UserOptionsContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
});
