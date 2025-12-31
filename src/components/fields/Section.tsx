import React from "react";
import { StyleSheet, View } from "react-native";

import { useThemedColors } from "../Theme";
import { ThemedText as Text } from "../ThemedText";

export function Section({
  heading,
  children,
  noBorder,
}: {
  heading: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  const colors = useThemedColors();
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionHeading,
          {
            color: colors.text,
            borderBottomColor: colors.accent,
          },
          noBorder && { borderBottomWidth: 0, paddingBottom: 0 },
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
