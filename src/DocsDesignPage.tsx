import React from "react";
import { Platform, View, Text, StyleSheet } from "react-native";

export default function DocsDesignPage() {
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Docs design preview available on web only.
        </Text>
      </View>
    );
  }

  // Require the web-only design bundle only on web to avoid native bundling issues.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const WebApp = require("./DocsDesign/App").default;
  return <WebApp />;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#666", fontSize: 16 },
});
