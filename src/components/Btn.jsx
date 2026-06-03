import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { IIcon } from "./Icons";
import { colors, fonts } from "../theme/tokens";
import { pressFx } from "../lib/pressFeedback";

export const BTN_PALETTE = {
  dark: { bg: colors.ink, fg: colors.cream, border: colors.ink },
  blue: { bg: colors.blue, fg: colors.ink, border: colors.ink },
  red: { bg: colors.red, fg: colors.cream, border: colors.red },
  outline: { bg: "transparent", fg: colors.ink, border: colors.ink },
  ghost: { bg: "transparent", fg: colors.ink, border: "transparent" },
  cream: { bg: colors.cream, fg: colors.ink, border: colors.ink },
  impaktRed: { bg: "#E4634D", fg: "#FFFFFF", border: "#E4634D" },
};

export function Btn({
  children,
  onPress,
  variant = "dark",
  size = "lg",
  icon,
  iconRight,
  fullWidth = true,
  disabled = false,
}) {
  const p = BTN_PALETTE[variant];
  const isLg = size === "lg";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      unstable_pressDelay={0}
      android_ripple={{ color: "rgba(15,17,26,0.12)", borderless: false }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: p.bg,
          borderColor: variant === "ghost" ? "transparent" : p.border,
          borderWidth: variant === "ghost" ? 0 : 1.5,
          paddingVertical: isLg ? 14 : 10,
          paddingHorizontal: isLg ? 20 : 16,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: disabled ? 0.55 : 1,
        },
        !disabled && pressFx()({ pressed }),
      ]}
    >
      {icon != null && (
        <IIcon name={icon} size={18} color={p.fg} strokeWidth={2} />
      )}
      <Text
        style={[styles.btnLabel, { color: p.fg, fontSize: isLg ? 15 : 13 }]}
      >
        {children}
      </Text>
      {iconRight != null && (
        <IIcon name={iconRight} size={18} color={p.fg} strokeWidth={2} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 10,
  },
  btnLabel: {
    fontFamily: fonts.display,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
