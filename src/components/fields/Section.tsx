import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText as Text } from "../ThemedText";

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionHeading,
          { borderBottomColor: theme.colors.border },
        ]}
      >
        {heading}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
});
