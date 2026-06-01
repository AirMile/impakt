import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { Btn } from "../../components/Btn";
import { colors, fonts } from "../../theme/tokens";

const TOPICS = [
  { id: "politiek", label: "Politiek", x: 14, y: 8, size: "md" },
  { id: "economie", label: "Economie", x: 60, y: 6, size: "md" },
  { id: "natuur", label: "Natuur", x: 36, y: 24, size: "md" },
  { id: "buitenland", label: "Buitenland", x: 8, y: 38, size: "md" },
  { id: "sport", label: "Sport", x: 60, y: 40, size: "sm" },
  { id: "innovatie", label: "Innovatie", x: 32, y: 54, size: "md" },
  { id: "kunst", label: "Kunst", x: 10, y: 72, size: "sm" },
  { id: "lokaal", label: "Lokaal", x: 58, y: 72, size: "sm" },
];

const BUBBLE_SIZES = {
  sm: { width: 88, height: 38, fontSize: 13 },
  md: { width: 108, height: 44, fontSize: 14 },
};

export function OnboardingScreen({ onBack, onConfirm, initial = [] }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(new Set(initial));

  const toggle = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.cream }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.topLabel}>Onboarding</Text>
        <Text style={styles.topCount}>{selected.size} gekozen</Text>
      </View>

      <View style={styles.questionBanner}>
        <Text
          style={styles.questionText}
        >{`Welke news thema's\nspreken jou het\nmeest aan?`}</Text>
      </View>

      <View style={styles.bubbleField}>
        {TOPICS.map((t, i) => {
          const on = selected.has(t.id);
          const s = BUBBLE_SIZES[t.size];
          return (
            <MotiView
              key={t.id}
              from={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: on ? 1.08 : 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 14,
                delay: i * 50,
              }}
              style={[
                styles.bubble,
                {
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: s.width,
                  height: s.height,
                  backgroundColor: on ? colors.blue : "#FFFFFF",
                  shadowColor: on ? colors.blue : colors.ink,
                  shadowOpacity: on ? 0.5 : 0,
                  shadowRadius: on ? 10 : 0,
                  elevation: on ? 4 : 0,
                },
              ]}
            >
              <Pressable
                onPress={() => toggle(t.id)}
                style={styles.bubblePress}
              >
                <Text style={[styles.bubbleLabel, { fontSize: s.fontSize }]}>
                  {t.label}
                </Text>
              </Pressable>
            </MotiView>
          );
        })}
        <Text style={styles.bubbleHint}>
          Tik om te kiezen · je kunt dit later aanpassen
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={{ flex: 1 }}>
          <Btn variant="outline" onPress={onBack}>
            Terug
          </Btn>
        </View>
        <View style={{ flex: 1 }}>
          <Btn
            variant="blue"
            onPress={() => onConfirm([...selected])}
            disabled={selected.size === 0}
            iconRight="arrow"
          >
            Bevestig
          </Btn>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 6,
  },
  topLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "rgba(15,17,26,0.6)",
  },
  topCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(15,17,26,0.6)",
  },
  questionBanner: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: colors.blue,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  questionText: {
    fontFamily: fonts.header,
    fontSize: 24,
    lineHeight: 25,
    letterSpacing: 0.5,
    color: colors.ink,
  },
  bubbleField: {
    flex: 1,
    marginHorizontal: 18,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
    overflow: "hidden",
  },
  bubble: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
    shadowOffset: { width: 2, height: 2 },
    zIndex: 1,
  },
  bubblePress: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
  bubbleLabel: {
    fontFamily: fonts.display,
    fontWeight: "600",
    color: colors.ink,
  },
  bubbleHint: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 14,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: "rgba(15,17,26,0.5)",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: "rgba(15,17,26,0.1)",
  },
});
