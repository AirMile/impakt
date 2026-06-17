import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IIcon } from "./Icons";
import { ImpaktLogo } from "./ImpaktLogo";
import { colors, surfaces } from "../theme/tokens";

export function AppHeader({
  onProfile,
  onBack,
  showBack = false,
  showProfile = true,
  dark = false,
  logoVariant = "default",
}) {
  const insets = useSafeAreaInsets();
  const bg = dark ? colors.ink : colors.cream;
  const fg = dark ? colors.cream : colors.ink;
  const borderColor = dark ? "rgba(239,235,230,0.1)" : "rgba(15,17,26,0.08)";

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: bg,
          borderBottomColor: borderColor,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Terug"
            style={[styles.iconBtn, { backgroundColor: "transparent" }]}
          >
            <IIcon name="arrowL" size={26} color={fg} strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <ImpaktLogo
          size={26}
          dark={!dark}
          inverted={dark}
          variant={logoVariant}
        />

        {showProfile ? (
          <Pressable
            onPress={onProfile}
            accessibilityRole="button"
            accessibilityLabel="Profiel"
            style={[
              styles.avatarBtn,
              {
                backgroundColor: dark
                  ? "rgba(239,235,230,0.12)"
                  : colors.creamWarm,
                borderColor: dark ? "rgba(239,235,230,0.12)" : surfaces.line,
              },
            ]}
          >
            <IIcon name="user" size={18} color={fg} strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={styles.avatarSlot} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    minHeight: 44,
  },
  iconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSlot: {
    width: 36,
    height: 36,
  },
});
