import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { IIcon } from "./Icons";
import { colors, fonts } from "../theme/tokens";
import { pressFx } from "../lib/pressFeedback";
import {
  REACTIONS,
  REACTION_EMOJI,
  REACTION_LABELS,
  REACTION_COLORS,
} from "../lib/reactionMeta";

// Re-export voor bestaande imports (HumorScreen, sandbox) — bron is reactionMeta.
export { REACTION_COLORS };

const REACTION_KEYS = REACTIONS.map((r) => r.key);

function ReactionBtn({
  it,
  isActive,
  dimmed,
  activeColor,
  stroke,
  voted,
  reactions,
  onPress,
}) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: withTiming(dimmed ? 0.5 : 1, { duration: 150 }),
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={it.label}
        unstable_pressDelay={0}
        android_ripple={{ color: "rgba(15,17,26,0.12)", borderless: true }}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: isActive ? activeColor : stroke },
          pressFx({ scale: 0.9, opacity: 0.75 })({ pressed }),
        ]}
      >
        {it.isReaction && voted ? (
          <Text
            style={[
              styles.pctInner,
              { color: isActive ? activeColor : stroke },
            ]}
          >
            {reactions?.[it.key]}%
          </Text>
        ) : it.isReaction ? (
          <Text style={styles.emoji}>{REACTION_EMOJI[it.key]}</Text>
        ) : (
          <IIcon
            name={it.icon}
            size={18}
            color={isActive ? activeColor : stroke}
            strokeWidth={1.8}
            fill={it.key === "save" && isActive ? colors.blue : "none"}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

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
    ...REACTIONS.map((r) => ({
      key: r.key,
      icon: r.key,
      label: REACTION_LABELS[r.key],
      isReaction: true,
    })),
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
        const isActive = it.key === "save" ? saved : reaction === it.key;
        const dimmed = voted && isReactionKey && !isActive;
        const activeColor =
          it.key === "save"
            ? colors.blue
            : (REACTION_COLORS[it.key] ?? colors.red);

        return (
          <ReactionBtn
            key={it.key}
            it={it}
            isActive={isActive}
            dimmed={dimmed}
            activeColor={activeColor}
            stroke={stroke}
            voted={voted}
            reactions={reactions}
            onPress={() => {
              // Ook na stemmen toegestaan — de parent switcht de reactie
              // (of doet niets als je je huidige keuze opnieuw aantikt).
              if (isReactionKey) onReact?.(it.key);
              if (it.key === "save") onSave?.();
              if (it.key === "share") onShare?.();
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { alignItems: "center", gap: 10 },
  vertical: { flexDirection: "column" },
  horizontal: { flexDirection: "row" },
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
  pctInner: {
    fontFamily: fonts.display,
    fontWeight: "700",
    fontSize: 13,
  },
});
