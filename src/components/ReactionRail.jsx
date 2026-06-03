import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { IIcon } from "./Icons";
import { colors, fonts } from "../theme/tokens";

export const REACTION_COLORS = {
  smile: "#52BD70",
  meh: "#F0B429",
  frown: colors.red,
};

const REACTION_EMOJI = { smile: "😊", meh: "😐", frown: "☹️" };
const REACTION_KEYS = ["smile", "meh", "frown"];

export function ReactionRail({
  reaction,
  onReact,
  reactions,
  saved = false,
  onSave,
  onShare,
  vertical = true,
  light = true,
}) {
  const stroke = light ? colors.cream : colors.ink;
  const voted = reaction !== null && reaction !== undefined;

  const items = [
    { key: "smile", icon: "smile", label: "Blij", isReaction: true },
    { key: "meh", icon: "meh", label: "Neutraal", isReaction: true },
    { key: "frown", icon: "frown", label: "Verdrietig", isReaction: true },
    ...(onSave
      ? [{ key: "save", icon: "bookmark", label: "Bewaren", isReaction: false }]
      : []),
    ...(onShare
      ? [{ key: "share", icon: "share", label: "Delen", isReaction: false }]
      : []),
  ];

  return (
    <View style={[styles.rail, vertical ? styles.vertical : styles.horizontal]}>
      {items.map((it) => {
        const isReactionKey = REACTION_KEYS.includes(it.key);
        const collapsed = voted && isReactionKey && it.key !== reaction;
        const isActive = it.key === "save" ? saved : reaction === it.key;
        const activeColor =
          it.key === "save"
            ? colors.blue
            : (REACTION_COLORS[it.key] ?? colors.red);
        const showPct = voted && reactions && it.key === reaction;

        return (
          <MotiView
            key={it.key}
            animate={{
              opacity: collapsed ? 0 : 1,
              scale: collapsed ? 0.4 : 1,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            style={collapsed ? styles.collapsed : undefined}
          >
            <Pressable
              onPress={() => {
                if (isReactionKey && !voted) onReact?.(it.key);
                if (it.key === "save") onSave?.();
                if (it.key === "share") onShare?.();
              }}
              accessibilityLabel={it.label}
              style={[
                styles.btn,
                {
                  borderColor: isActive ? activeColor : stroke,
                },
              ]}
            >
              {it.isReaction ? (
                <Text style={styles.emoji}>{REACTION_EMOJI[it.key]}</Text>
              ) : (
                <IIcon
                  name={it.icon}
                  size={18}
                  color={isActive ? activeColor : stroke}
                  strokeWidth={1.8}
                  fill={it.key === "save" && saved ? colors.blue : "none"}
                />
              )}
            </Pressable>
            {showPct && reactions && (
              <View style={styles.pctWrapper}>
                <Text style={[styles.pct, { color: activeColor }]}>
                  {reactions[it.key]}%
                </Text>
              </View>
            )}
          </MotiView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { alignItems: "center", gap: 10 },
  vertical: { flexDirection: "column" },
  horizontal: { flexDirection: "row" },
  collapsed: { maxHeight: 0, overflow: "hidden", marginBottom: -10 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  emoji: {
    fontSize: 18,
  },
  pctWrapper: {
    marginTop: 6,
    borderRadius: 9999,
    backgroundColor: "rgba(15,17,26,0.58)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "center",
  },
  pct: {
    fontFamily: fonts.display,
    fontWeight: "700",
    fontSize: 13,
  },
});
