import React from "react";
import { Platform, View, Text, StyleSheet } from "react-native";

export default function GR55HWViewPage() {
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          GR-55 hardware view available on web only.
        </Text>
      </View>
    );
  }

  // Require the web-only view bundle only on web to avoid native bundling issues.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const WebView = require("../../GR55HWView/App").default;
  return <WebView />;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#666", fontSize: 16 },
});
