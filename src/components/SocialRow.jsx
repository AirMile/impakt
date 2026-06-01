import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { IIcon } from "./Icons";
import { colors, fonts } from "../theme/tokens";

const PROVIDERS = [
  { id: "google", icon: "google", bg: "#FFFFFF", fg: colors.ink },
  { id: "apple", icon: "apple", bg: colors.ink, fg: colors.cream },
  { id: "facebook", icon: "facebook", bg: "#FFFFFF", fg: colors.ink },
];

export function SocialRow({ onSocial, label = "Of ga verder met" }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>{label}</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.btns}>
        {PROVIDERS.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => onSocial(s.id)}
            accessibilityLabel={s.id}
            style={[styles.btn, { backgroundColor: s.bg }]}
          >
            <IIcon name={s.icon} size={22} color={s.fg} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  btns: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(15,17,26,0.18)" },
  dividerLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(15,17,26,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
});
