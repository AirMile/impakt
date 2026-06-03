import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { IIcon } from "../components/Icons";
import { STORIES as FEED_STORIES } from "../api/mock";
import { FeedCard } from "./FeedScreen";
import { colors, fonts } from "../theme/tokens";
import { slideUpScreen } from "../theme/animations";
import { searchStories } from "../lib/searchStories";
import { topReadStories } from "../lib/topReadStories";

const POPULAR_TAGS = [
  "Klimaat",
  "Live",
  "Goed nieuws",
  "AI",
  "Politiek",
  "Wonen",
  "Gaza",
  "Energie",
];

const THEME_TILES = [
  { label: "Klimaat", bg: colors.blue, fg: colors.ink },
  { label: "Politiek", bg: colors.red, fg: colors.cream },
  { label: "Sport", bg: colors.blueDark, fg: colors.cream },
  { label: "Tech", bg: colors.ink, fg: colors.cream },
  { label: "Wereld", bg: colors.redDark, fg: colors.cream },
];

export function SearchScreen({ onClose, onOpenStory }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const results = searchStories(query, FEED_STORIES);
  const q = query.trim().toLowerCase();

  const topRead = topReadStories(FEED_STORIES, 4);

  const openStory = (s) => {
    Keyboard.dismiss();
    onOpenStory(s);
  };

  return (
    <MotiView
      {...slideUpScreen}
      style={[StyleSheet.absoluteFillObject, styles.screen]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={onClose}
          style={styles.backBtn}
          accessibilityLabel="Terug"
        >
          <IIcon name="arrowL" size={24} strokeWidth={2} color={colors.ink} />
        </Pressable>
        <View style={styles.inputRow}>
          <IIcon
            name="search"
            size={17}
            strokeWidth={2}
            color="rgba(15,17,26,0.55)"
          />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Zoek verhalen, tags, thema's…"
            placeholderTextColor="rgba(15,17,26,0.4)"
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <IIcon
                name="close"
                size={16}
                strokeWidth={2.2}
                color="rgba(15,17,26,0.55)"
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!q ? (
          <>
            {/* Populaire tags */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Populair</Text>
              <View style={styles.tagsWrap}>
                {POPULAR_TAGS.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      Keyboard.dismiss();
                      setQuery(tag);
                    }}
                    style={styles.popularTag}
                  >
                    <Text style={styles.popularTagLabel}>{tag}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Ontdek per thema */}
            <View style={[styles.section, { marginTop: 24 }]}>
              <Text style={styles.sectionLabel}>Ontdek per thema</Text>
              <View style={styles.tilesGrid}>
                {THEME_TILES.map((tile, i) => {
                  const isLastOdd =
                    i === THEME_TILES.length - 1 &&
                    THEME_TILES.length % 2 !== 0;
                  return (
                    <Pressable
                      key={tile.label}
                      onPress={() => {
                        Keyboard.dismiss();
                        setQuery(tile.label);
                      }}
                      style={[
                        styles.themeTile,
                        { backgroundColor: tile.bg },
                        isLastOdd && styles.themeTileFull,
                      ]}
                    >
                      <Text style={[styles.themeTileLabel, { color: tile.fg }]}>
                        {tile.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Meest gelezen */}
            <View style={{ marginTop: 24 }}>
              <Text style={[styles.sectionLabel, { paddingHorizontal: 18 }]}>
                Meest gelezen
              </Text>
              {topRead.map((s) => (
                <FeedCard
                  key={s.id}
                  story={s}
                  onOpen={openStory}
                  variant="compact"
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {results.length}{" "}
              {results.length === 1 ? "resultaat" : "resultaten"} voor "{query}"
            </Text>
            {results.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Geen resultaten voor "{query}"
                </Text>
              </View>
            ) : (
              results.map((s) => (
                <FeedCard
                  key={s.id}
                  story={s}
                  onOpen={openStory}
                  variant="full"
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.cream,
    zIndex: 90,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: colors.cream,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.creamWarm,
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    padding: 0,
  },
  section: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: "rgba(15,17,26,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  popularTag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: "rgba(122,207,223,0.28)",
  },
  popularTagLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeTile: {
    flexBasis: "45%",
    flexGrow: 1,
    borderRadius: 14,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  themeTileFull: {
    flexBasis: "100%",
  },
  themeTileLabel: {
    fontFamily: fonts.header,
    fontSize: 28,
    lineHeight: 27,
    letterSpacing: 0.5,
  },
  resultsCount: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(15,17,26,0.55)",
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "rgba(15,17,26,0.55)",
    textAlign: "center",
  },
});
