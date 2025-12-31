import { Entypo } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useAnimation } from "react-native-animation-hooks";

import { FieldStyles } from "./FieldStyles";
import { useThemedColors } from "../Theme";
import { AnimatedThemedText } from "../ThemedText";

export const FieldRow = function FieldRow({
  description,
  children,
  inline,
  isAssigned,
  onPress,
  onLongPress,
  onPressIn,
}: {
  description: React.ReactNode;
  children?: React.ReactNode;
  inline?: boolean;
  isAssigned?: boolean;
  onPress?: () => void;
  onPressIn?: () => void;
  onLongPress?: (
    event: GestureResponderEvent,
    measuredInWindow: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) => void;
}) {
  const fieldRowContext = useMemo(
    () => ({ isAssigned: isAssigned ?? false }),
    [isAssigned]
  );
  const [isPressed, setPressed] = useState(false);
  const isPressable = onPress != null;
  const isLongPressable = onLongPress != null;
  const measuredInWindow = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>(null);
  const viewRef = useRef<View>(null);
  const handlePressIn = useCallback(() => {
    if (isLongPressable || isPressable) {
      setPressed(true);
    }
    onPressIn?.();
    viewRef.current?.measureInWindow((x, y, width, height) => {
      measuredInWindow.current = { x, y, width, height };
    });
  }, [isLongPressable, isPressable, onPressIn, viewRef]);
  const handlePressOut = useCallback(() => {
    if (isLongPressable || isPressable) {
      setPressed(false);
    }
  }, [isLongPressable, isPressable]);
  const handleLongPress = useCallback(
    (event: GestureResponderEvent) => {
      if (onLongPress) {
        onLongPress?.(event, measuredInWindow.current!);
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }
    },
    [onLongPress]
  );
  const MaybePressable =
    isLongPressable || isPressable ? Pressable : NotPressable;
  const touchOpacity = useAnimation({
    type: "timing",
    initialValue: isPressed ? 0.25 : 1,
    toValue: isPressed ? 0.25 : 1,
    duration: isPressed ? 0 : 300,
    useNativeDriver: Platform.OS !== "web",
  });
  const { colors: baseColors } = useTheme();
  const colors = useThemedColors();
  return (
    <FieldRowContext.Provider value={fieldRowContext}>
      {inline ? (
        <>{children}</>
      ) : (
        <View
          {...Platform.select({
            android: {
              renderToHardwareTextureAndroid: true,
              collapsable: false,
            },
            default: {},
          })}
          ref={viewRef}
          style={[
            FieldStyles.fieldRow,
            { borderBottomColor: colors.accent + "33" }, // 20% opacity accent
            isAssigned && FieldStyles.fieldRowAssigned,
          ]}
        >
          <MaybePressable
            onPress={onPress}
            onLongPress={handleLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={FieldStyles.fieldDescriptionColumn}
          >
            <AnimatedThemedText
              style={[
                FieldStyles.fieldDescription,
                { color: colors.mutedText },
                isAssigned && FieldStyles.fieldDescriptionAssigned,
                { opacity: touchOpacity },
              ]}
            >
              {description}{" "}
              <Entypo
                name="link"
                size={12}
                color={isAssigned ? "cornflowerblue" : "transparent"}
                style={[
                  styles.iconAssigned,
                  isAssigned && styles.iconAssignedVisible,
                ]}
              />
            </AnimatedThemedText>
          </MaybePressable>
          {children && (
            <View
              style={[
                FieldStyles.fieldControl,
                isAssigned && FieldStyles.fieldControlAssigned,
              ]}
            >
              {children}
            </View>
          )}
        </View>
      )}
    </FieldRowContext.Provider>
  );
};

function NotPressable(
  props: PressableProps & {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
  }
) {
  const { hitSlop, ...rest } = props;
  return <View {...rest} />;
}

export const FieldRowContext = createContext<{
  isAssigned: boolean;
}>({ isAssigned: false });

const styles = StyleSheet.create({
  iconAssigned: { opacity: 0 },
  iconAssignedVisible: { opacity: 1 },
});
