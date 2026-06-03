import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IIcon } from "./Icons";
import { colors, fonts } from "../theme/tokens";
import { pressFx, selectHaptic } from "../lib/pressFeedback";

const TABS = [
  { id: "feed", icon: "home", label: "Feed" },
  { id: "humor", icon: "video", label: "Humor" },
  { id: "good", icon: "smile", label: "Happy feed" },
];

export function BottomNav({ active, onChange, onSearch, theme = "light" }) {
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const fg = isDark ? colors.ink : colors.cream;

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 14) }]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={60}
        tint={isDark ? "light" : "dark"}
        style={styles.pill}
      >
        <View style={styles.inner}>
          {TABS.map((t) => {
            const on = active === t.id;
            return (
              <Pressable
                key={t.id}
                onPressIn={selectHaptic}
                onPress={() => onChange(t.id)}
                accessibilityLabel={t.label}
                unstable_pressDelay={0}
                android_ripple={{
                  color: "rgba(239,235,230,0.18)",
                  borderless: true,
                }}
                style={({ pressed }) => [
                  styles.tab,
                  on && styles.tabActive,
                  pressFx({ scale: 0.94 })({ pressed }),
                ]}
              >
                <IIcon
                  name={t.icon}
                  size={20}
                  color={on ? colors.cream : fg}
                  strokeWidth={2}
                />
                {on && (
                  <Text style={[styles.tabLabel, { color: colors.cream }]}>
                    {t.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
          <View style={styles.divider} />
          <Pressable
            onPress={onSearch}
            onPressIn={selectHaptic}
            accessibilityLabel="Zoeken"
            unstable_pressDelay={0}
            android_ripple={{
              color: "rgba(239,235,230,0.18)",
              borderless: true,
            }}
            style={({ pressed }) => [
              styles.searchBtn,
              pressFx({ scale: 0.94 })({ pressed }),
            ]}
          >
            <IIcon name="search" size={20} color={fg} strokeWidth={2} />
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: 14,
    paddingHorizontal: 18,
  },
  pill: {
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(239,235,230,0.08)",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  tabActive: {
    backgroundColor: colors.red,
    paddingLeft: 14,
    paddingRight: 16,
  },
  tabLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(239,235,230,0.18)",
    marginHorizontal: 4,
  },
  searchBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
});
