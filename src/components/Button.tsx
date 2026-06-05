import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradient, radius } from "@/src/lib/theme";

type Variant = "primary" | "ghost" | "outline";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  testID,
  style,
  textStyle,
  iconLeft,
  iconRight,
  small,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  small?: boolean;
}) {
  const padV = small ? 10 : 16;
  const fontSize = small ? 14 : 16;

  if (variant === "primary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        style={[styles.btn, { opacity: disabled ? 0.4 : 1 }, style]}
      >
        <LinearGradient
          colors={[gradient.primary[0], gradient.primary[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.inner, { paddingVertical: padV }]}
        >
          {iconLeft}
          <Text style={[styles.text, { fontSize }, textStyle]}>{label}</Text>
          {iconRight}
        </LinearGradient>
      </Pressable>
    );
  }
  if (variant === "outline") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        style={[
          styles.btn,
          styles.outline,
          { paddingVertical: padV, opacity: disabled ? 0.4 : 1 },
          style,
        ]}
      >
        {iconLeft}
        <Text style={[styles.text, { fontSize }, textStyle]}>{label}</Text>
        {iconRight}
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      style={[styles.btn, { paddingVertical: padV, opacity: disabled ? 0.4 : 1 }, style]}
    >
      {iconLeft}
      <Text style={[styles.text, { fontSize, color: colors.textSecondary }, textStyle]}>{label}</Text>
      {iconRight}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.pill,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    gap: 8,
  },
  text: {
    color: colors.text,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
