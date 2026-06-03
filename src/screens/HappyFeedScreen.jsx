import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { FeedCard } from "./FeedScreen";
import { colors, fonts, surfaces } from "../theme/tokens";
import { STORIES as ALL_STORIES } from "../api/mock";
import { groupHappyStories } from "../lib/storyDate";

const { width: SCREEN_W } = Dimensions.get("window");
const TILE_W = (SCREEN_W - 36 - 10) / 2;

const THEME_TILES = [
  { label: "Natuur", tag: "Natuur", bg: colors.blue, fg: colors.ink },
  {
    label: "Wetenschap",
    tag: "Wetenschap",
    bg: colors.blueDark,
    fg: colors.cream,
  },
  { label: "Sociaal", tag: "Sociaal", bg: colors.red, fg: colors.cream },
  { label: "Atletiek", tag: "Atletiek", bg: colors.ink, fg: colors.cream },
];

export function HappyFeedScreen({ onOpen, onProfile }) {
  const [activeTheme, setActiveTheme] = useState(null);

  const sections = useMemo(
    () =>
      groupHappyStories(
        ALL_STORIES.filter((s) => s.goodNews),
        {
          filterTag: activeTheme,
          threshold: activeTheme ? 1 : 3,
        }
      ),
    [activeTheme]
  );

  const topSections = sections.filter((sec) => sec.key !== "earlier");
  const earlierSection = sections.find((sec) => sec.key === "earlier");

  return (
    <View style={s.screen}>
      <AppHeader onProfile={onProfile} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {topSections.map((sec) => (
          <View key={sec.key} style={s.section}>
            <Text style={s.sectionLabel}>{sec.label}</Text>
            {sec.stories.map((story, i) => (
              <FeedCard
                key={story.id}
                story={story}
                onOpen={onOpen}
                variant="compact"
                index={i}
              />
            ))}
          </View>
        ))}

        {/* Ontdek per thema */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ONTDEK PER THEMA</Text>
          <View style={s.tilesGrid}>
            {THEME_TILES.map((tile, i) => {
              const isLastOdd =
                i === THEME_TILES.length - 1 && THEME_TILES.length % 2 !== 0;
              const isActive = activeTheme === tile.tag;
              return (
                <Pressable
                  key={tile.label}
                  testID={`theme-tile-${tile.tag}`}
                  onPress={() =>
                    setActiveTheme((prev) =>
                      prev === tile.tag ? null : tile.tag
                    )
                  }
                  style={[
                    s.tile,
                    { backgroundColor: tile.bg },
                    isLastOdd && s.tileFull,
                    isActive && s.tileActive,
                  ]}
                >
                  <Text style={[s.tileLabel, { color: tile.fg }]}>
                    {tile.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {earlierSection && (
          <View style={s.section}>
            {topSections.length > 0 && (
              <Text style={s.sectionLabel}>{earlierSection.label}</Text>
            )}
            {earlierSection.stories.map((story, i) => (
              <FeedCard
                key={story.id}
                story={story}
                onOpen={onOpen}
                index={i}
              />
            ))}
          </View>
        )}

        {sections.length === 0 && activeTheme && (
          <View style={s.empty}>
            <Text style={s.emptyLabel}>
              Geen leuk nieuws over {activeTheme}.{"\n"}Tap nogmaals om het
              filter te wissen.
            </Text>
          </View>
        )}

        {sections.length === 0 && !activeTheme && (
          <View style={s.empty}>
            <Text style={s.emptyLabel}>
              Geen goed nieuws op dit moment.{"\n"}Kom later terug.
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    paddingTop: 4,
  },

  section: {
    marginTop: 28,
    gap: 12,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: surfaces.muted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    paddingHorizontal: 18,
  },

  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 18,
  },
  tile: {
    width: TILE_W,
    height: 72,
    borderRadius: 14,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: 14,
  },
  tileFull: {
    width: SCREEN_W - 36,
  },
  tileActive: {
    borderWidth: 2.5,
    borderColor: colors.cream,
  },
  tileLabel: {
    fontFamily: fonts.display,
    fontSize: 15,
  },

  empty: {
    padding: 48,
    alignItems: "center",
  },
  emptyLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: surfaces.muted,
    textAlign: "center",
    lineHeight: 22,
  },
});
