import { useTheme } from "@react-navigation/native";
import { forwardRef } from "react";
import { Text as RNText, Animated, Platform } from "react-native";

export const ThemedText = forwardRef(function ThemedText(
  {
    style,
    collapsable,
    ...props
  }: React.ComponentPropsWithRef<typeof RNText> & { collapsable?: boolean },
  ref: React.ForwardedRef<RNText>
) {
  const { colors } = useTheme();
  return (
    <RNText
      style={[{ color: colors.text }, style]}
      {...props}
      {...({
        collapsable: Platform.OS === "web" ? undefined : collapsable,
      } as any)}
      ref={ref}
    />
  );
});

export const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);
