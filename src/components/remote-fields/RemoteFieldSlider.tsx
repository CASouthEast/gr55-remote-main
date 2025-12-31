import { useCallback } from "react";
import { StyleSheet, View, Platform } from "react-native";

import { RemoteFieldRow } from "./RemoteFieldRow";
import { RolandRemotePageContext } from "../../contexts/RolandRemotePageContext";
import { useMaybeControlledRemoteField } from "../../hooks/useRemoteField";
import { FieldReference, NumericField } from "../../lib/RolandAddressMap";
import { PendingTextPlaceholder } from "../PendingContentPlaceholders";
import { Slider } from "../Slider";
import { useTheme, useThemedColors } from "../Theme";
import { ThemedText as Text } from "../ThemedText";

export function RemoteFieldSlider({
  page,
  field,
  value: valueProp,
  onValueChange: onValueChangeProp,
  inline,
  onSlidingStart,
  onSlidingComplete,
}: {
  page: RolandRemotePageContext;
  field: FieldReference<NumericField>;
  value?: number;
  inline?: boolean;
  // TODO: fix type of value param, which can be number[]
  onValueChange?: (value: number) => void;
  onSlidingStart?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
}) {
  const [value, setValue, status] = useMaybeControlledRemoteField(
    page,
    field,
    valueProp,
    onValueChangeProp
  );
  const handleValueChange = useCallback(
    (valueOrValues: number | number[]) => {
      if (typeof valueOrValues === "number") {
        setValue(valueOrValues);
      } else {
        setValue(valueOrValues[0]);
      }
    },
    [setValue]
  );
  const handleSlidingStart = useCallback(
    (valueOrValues: number | number[]) => {
      if (typeof valueOrValues === "number") {
        onSlidingStart?.(valueOrValues);
      } else {
        onSlidingStart?.(valueOrValues[0]);
      }
    },
    [onSlidingStart]
  );
  const handleSlidingComplete = useCallback(
    (valueOrValues: number | number[]) => {
      if (typeof valueOrValues === "number") {
        onSlidingComplete?.(valueOrValues);
      } else {
        onSlidingComplete?.(valueOrValues[0]);
      }
    },
    [onSlidingComplete]
  );
  const prettyValue = field.definition.type.format(value);
  return (
    <RemoteFieldRow page={page} field={field} inline={inline}>
      <SliderControl
        prettyValue={prettyValue}
        field={field}
        handleValueChange={handleValueChange}
        handleSlidingStart={handleSlidingStart}
        handleSlidingComplete={handleSlidingComplete}
        value={value}
        isPending={status === "pending"}
      />
    </RemoteFieldRow>
  );
}

const THUMB_TOUCH_SIZE_DEFAULT = {
  width: 48,
  height: 48,
};

function SliderControl({
  prettyValue,
  field,
  handleValueChange,
  handleSlidingStart,
  handleSlidingComplete,
  value,
  isPending,
}: {
  prettyValue: string;
  field: FieldReference<NumericField>;
  handleValueChange: (valueOrValues: number | number[]) => void;
  handleSlidingStart: (valueOrValues: number | number[]) => void;
  handleSlidingComplete: (valueOrValues: number | number[]) => void;
  value: number;
  isPending: boolean;
}) {
  // const { isAssigned } = useContext(FieldRowContext);
  // TODO: Show assigned state when all controls can reliably handle long press etc

  const theme = useTheme();
  const themedColors = useThemedColors();

  return (
    <View style={styles.sliderContainer}>
      <Slider
        thumbTouchSize={THUMB_TOUCH_SIZE_DEFAULT}
        trackStyle={styles.sliderTrack}
        minimumValue={field.definition.type.min}
        maximumValue={field.definition.type.max}
        step={field.definition.type.step}
        onValueChange={handleValueChange}
        onSlidingStart={handleSlidingStart}
        onSlidingComplete={handleSlidingComplete}
        value={isPending ? field.definition.type.max : value}
        minimumTrackTintColor={
          isPending
            ? theme.colors.pendingTextPlaceholder
            : themedColors.sliderTrackMin
        }
        maximumTrackTintColor={
          isPending
            ? theme.colors.pendingTextPlaceholder
            : themedColors.sliderTrackMax
        }
        disabled={isPending}
      />
      <View style={styles.labelRow}>
        {isPending ? (
          <PendingTextPlaceholder chars={4} />
        ) : (
          <Text
            style={[
              styles.labelText,
              {
                color: themedColors.accent,
                backgroundColor: theme.colors.slider.labelTextBackground,
              },
              Platform.select({
                web: {},
                ios: {
                  textShadowColor: theme.colors.slider.labelTextShadow,
                },
                android: {
                  textShadowColor: theme.colors.slider.labelTextShadow,
                },
                default: {
                  textShadowColor: theme.colors.slider.labelTextShadow,
                },
              }) as any,
            ]}
          >
            {prettyValue}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sliderContainer: {
    flex: 0,
    marginVertical: -4,
    width: "100%",
  },
  sliderTrack: {
    height: 32,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 4,
    width: "100%",
    pointerEvents: "none",
    height: 32,
  },
  labelText: {
    textAlign: "center",
    opacity: 1,
    ...Platform.select({
      web: {},
      ios: { textShadowRadius: 2, textShadowOffset: { width: 0, height: 0 } },
      android: {
        textShadowRadius: 2,
        textShadowOffset: { width: 0, height: 0 },
      },
      default: {
        textShadowRadius: 2,
        textShadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  sliderThumb: {
    opacity: 0,
    width: 0,
  },
});
