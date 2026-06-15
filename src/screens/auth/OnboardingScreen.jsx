import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { Btn } from "../../components/Btn";
import { IIcon } from "../../components/Icons";
import { ImpaktLogo } from "../../components/ImpaktLogo";
import { colors, fonts } from "../../theme/tokens";
import { toggleInSet } from "../../lib/toggleInSet";

const TOPICS = [
  { id: "politiek", label: "Politiek", icon: "topicPolitics" },
  { id: "buitenland", label: "Buitenland", icon: "topicWorld" },
  { id: "economie", label: "Economie", icon: "topicEconomy" },
  { id: "sport", label: "Sport", icon: "topicSport" },
  { id: "natuur", label: "Natuur", icon: "topicNature" },
  { id: "innovatie", label: "Innovatie", icon: "topicInnovation" },
  { id: "kunst", label: "Kunst", icon: "topicArt" },
  { id: "lokaal", label: "Lokaal", icon: "topicLocal" },
];

const TOPIC_ROWS = [
  ["politiek", "buitenland"],
  ["economie", "sport"],
  ["natuur", "innovatie"],
  ["kunst", "lokaal"],
];

const SELECTED_BG = "#10141C";
const SELECTED_TOPIC_BG = "#ADE8F4";
const UNSELECTED_BG = "#DDF5F8";
const INK = "#10111A";

export function OnboardingScreen({ onBack, onConfirm, initial = [] }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [selected, setSelected] = useState(new Set(initial));

  const compact = height < 760;
  const veryCompact = height < 700;

  const topicsById = useMemo(() => {
    return TOPICS.reduce((acc, topic) => {
      acc[topic.id] = topic;
      return acc;
    }, {});
  }, []);

  const toggle = (id) => {
    setSelected((s) => toggleInSet(s, id));
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 520 }}
      style={[styles.screen, { backgroundColor: colors.cream }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            minHeight: height - 92 - insets.bottom,
            paddingTop: insets.top + (veryCompact ? 8 : compact ? 10 : 12),
            paddingBottom: veryCompact ? 8 : 10,
          },
        ]}
      >
        <View style={styles.mainContent}>
          <View
            style={[
              styles.logoWrap,
              compact && styles.logoWrapCompact,
              veryCompact && styles.logoWrapVeryCompact,
            ]}
          >
            <ImpaktLogo
              style={[
                styles.logoImage,
                compact && styles.logoImageCompact,
                veryCompact && styles.logoImageVeryCompact,
              ]}
            />
          </View>

          <View style={styles.introBlock}>
            <Text
              style={[
                styles.subtitle,
                compact && styles.subtitleCompact,
                veryCompact && styles.subtitleVeryCompact,
              ]}
            >
              Welke thema's spreken{"\n"}jou het meest aan?
            </Text>

            <View
              style={[
                styles.divider,
                compact && styles.dividerCompact,
                veryCompact && styles.dividerVeryCompact,
              ]}
            />
          </View>

          <View
            style={[
              styles.topicGrid,
              compact && styles.topicGridCompact,
              veryCompact && styles.topicGridVeryCompact,
            ]}
          >
            {TOPIC_ROWS.map((row, rowIndex) => (
              <View key={row.join("-")} style={styles.topicRow}>
                {row.map((id) => {
                  const topic = topicsById[id];
                  const isSelected = selected.has(topic.id);

                  return (
                    <View key={topic.id} style={styles.topicSlot}>
                      <Pressable
                        onPress={() => toggle(topic.id)}
                        style={({ pressed }) => [
                          styles.topicButton,
                          compact && styles.topicButtonCompact,
                          veryCompact && styles.topicButtonVeryCompact,
                          isSelected
                            ? styles.topicButtonSelected
                            : styles.topicButtonIdle,
                          {
                            opacity: pressed ? 0.78 : 1,
                          },
                        ]}
                      >
                        <IIcon
                          name={topic.icon}
                          size={veryCompact ? 19 : compact ? 20 : 22}
                          color={isSelected ? SELECTED_BG : INK}
                          strokeWidth={2.45}
                        />

                        <Text
                          numberOfLines={1}
                          style={[
                            styles.topicLabel,
                            compact && styles.topicLabelCompact,
                            {
                              color: isSelected ? SELECTED_BG : INK,
                            },
                          ]}
                        >
                          {topic.label}
                        </Text>

                        {isSelected && (
                          <IIcon
                            name="check"
                            size={veryCompact ? 20 : 22}
                            color={SELECTED_BG}
                            strokeWidth={3}
                          />
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.helperBlock}>
            <Text
              style={[
                styles.helperText,
                compact && styles.helperTextCompact,
                veryCompact && styles.helperTextVeryCompact,
              ]}
            >
              Tik om te kiezen · je kunt dit later aanpassen
            </Text>

            <View
              style={[
                styles.divider,
                styles.helperDivider,
                compact && styles.helperDividerCompact,
                veryCompact && styles.helperDividerVeryCompact,
              ]}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + (veryCompact ? 8 : 10),
          },
        ]}
      >
        <View style={styles.footerButtonSlot}>
          <Btn variant="cream" onPress={onBack}>
            Terug
          </Btn>
        </View>

        <View style={styles.footerButtonSlot}>
          <Btn
            variant="impaktRed"
            onPress={() => onConfirm([...selected])}
            disabled={selected.size === 0}
            iconRight="arrow"
          >
            Bevestig
          </Btn>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 22,
  },

  mainContent: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    alignItems: "center",
    justifyContent: "space-evenly",
  },

  logoWrap: {
    alignItems: "center",
  },

  logoWrapCompact: {},

  logoWrapVeryCompact: {},

  logoImage: {
    width: 210,
    height: 67,
  },

  logoImageCompact: {
    width: 185,
    height: 59,
  },

  logoImageVeryCompact: {
    width: 165,
    height: 53,
  },

  introBlock: {
    width: "100%",
    alignItems: "center",
  },

  subtitle: {
    width: "100%",
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "500",
    color: "rgba(16, 17, 26, 0.58)",
    textAlign: "center",
    maxWidth: 310,
  },

  subtitleCompact: {
    fontSize: 16,
    lineHeight: 22,
  },

  subtitleVeryCompact: {
    fontSize: 15,
    lineHeight: 20,
  },

  divider: {
    width: "82%",
    maxWidth: 294,
    height: 1,
    backgroundColor: "rgba(15,17,26,0.16)",
    marginTop: 16,
  },

  dividerCompact: {
    marginTop: 13,
  },

  dividerVeryCompact: {
    marginTop: 10,
  },

  topicGrid: {
    width: "100%",
    gap: 16,
  },

  topicGridCompact: {
    gap: 12,
  },

  topicGridVeryCompact: {
    gap: 10,
  },

  topicRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  topicSlot: {
    flex: 1,
    minWidth: 0,
  },

  topicButton: {
    height: 58,
    borderRadius: 999,
    paddingHorizontal: 17,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 13,
    shadowOpacity: 0.13,
    elevation: 5,
  },

  topicButtonCompact: {
    height: 54,
    paddingHorizontal: 15,
    gap: 10,
  },

  topicButtonVeryCompact: {
    height: 49,
    paddingHorizontal: 13,
    gap: 8,
  },

  topicButtonSelected: {
    backgroundColor: SELECTED_TOPIC_BG,
    borderColor: SELECTED_BG,
    shadowOpacity: 0.22,
    elevation: 7,
  },

  topicButtonIdle: {
    backgroundColor: UNSELECTED_BG,
    borderColor: "rgba(15,17,26,0.04)",
  },

  topicLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: "900",
  },

  topicLabelCompact: {
    fontSize: 16,
  },

  helperBlock: {
    width: "100%",
    alignItems: "center",
  },

  helperText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "rgba(16, 17, 26, 0.64)",
    textAlign: "center",
  },

  helperTextCompact: {
    fontSize: 13,
  },

  helperTextVeryCompact: {
    fontSize: 12,
  },

  helperDivider: {
    marginTop: 12,
  },

  helperDividerCompact: {
    marginTop: 10,
  },

  helperDividerVeryCompact: {
    marginTop: 8,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 22,
    paddingTop: 8,
    backgroundColor: colors.cream,
  },

  footerButtonSlot: {
    flex: 1,
    maxWidth: 178,
  },
});
