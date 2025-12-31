import { Platform, StyleSheet, View, ViewProps } from "react-native";

import { useThemedColors } from "../Theme";

export function ThemedCard({ style, children, ...props }: ViewProps) {
  const colors = useThemedColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {
        elevation: 4,
      },
    }),
    maxWidth: 600,
    width: "100%",
  },
});
