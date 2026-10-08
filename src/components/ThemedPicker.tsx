import { forwardRef } from "react";

import { Picker } from "./Picker/Picker";
import { useThemedColors } from "./Theme";

export const ThemedPicker = forwardRef(function ThemedPicker<T>(
  {
    itemStyle,
    style,
    ...props
  }: React.ComponentPropsWithoutRef<typeof Picker<T>>,
  ref: React.ForwardedRef<Picker<T>>
) {
  const colors = useThemedColors();
  return (
    <Picker
      itemStyle={[{ color: colors.text }, itemStyle]}
      style={[
        {
          color: colors.accent,
          backgroundColor: colors.badgeBackground,
          borderColor: colors.accent,
          borderWidth: 1,
          borderRadius: 8,
        },
        style,
      ]}
      dropdownIconColor={colors.accent}
      {...props}
      ref={ref}
    />
  );
}) as unknown as typeof Picker;

const { Item } = Picker;

ThemedPicker.Item = Item;
