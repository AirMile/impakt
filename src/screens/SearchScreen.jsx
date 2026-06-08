import React, { useMemo, useState } from "react";
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

const TOPICS = [
  { label: "Politiek", icon: "topicPolitics", cat: "Politiek" },
  { label: "Buitenland", icon: "topicWorld", cat: "Wereld" },
  { label: "Economie", icon: "topicEconomy", cat: "Economie" },
  { label: "Sport", icon: "topicSport", cat: "Sport" },
  { label: "Natuur", icon: "topicNature", cat: "Natuur" },
  { label: "Innovatie", icon: "topicInnovation", cat: "Tech" },
  { label: "Kunst", icon: "topicArt", cat: "Kunst" },
  { label: "Lokaal", icon: "topicLocal", cat: "Lokaal" },
];

const TOPIC_BG = "#DDF5F8";
const TOPIC_INK = "#10111A";
const SELECTED_BG = "#10141C";

export function SearchScreen({ onClose, onOpenStory }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState(new Set());

  const mostReadStories = useMemo(() => topReadStories(FEED_STORIES, 4), []);

  const activeCats = useMemo(() => {
    if (selectedTopics.size === 0) return [];
    return TOPICS.filter((topic) => selectedTopics.has(topic.label)).map(
      (topic) => topic.cat
    );
  }, [selectedTopics]);

  const filteredStories = useMemo(() => {
    if (activeCats.length === 0) return mostReadStories;
    return mostReadStories.filter((story) => activeCats.includes(story.cat));
  }, [activeCats, mostReadStories]);

  const results = searchStories(query, filteredStories);
  const q = query.trim().toLowerCase();
  const hasTopicFilter = selectedTopics.size > 0;

  const openStory = (story) => {
    Keyboard.dismiss();
    onOpenStory(story);
  };

  const toggleTopic = (label) => {
    setSelectedTopics((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const topicBar = !q && (
    <View style={styles.topicSection}>
      <Text style={styles.topicSectionLabel}>Ontdek per thema</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicChipsRow}
        style={styles.topicChipsScroll}
      >
        {TOPICS.map((topic) => {
          const isSelected = selectedTopics.has(topic.label);

          return (
            <Pressable
              key={topic.label}
              onPress={() => toggleTopic(topic.label)}
              style={({ pressed }) => [
                styles.topicChip,
                isSelected ? styles.topicChipSelected : styles.topicChipIdle,
                { opacity: pressed ? 0.78 : 1 },
              ]}
            >
              <IIcon
                name={topic.icon}
                size={16}
                color={isSelected ? "#FFFFFF" : TOPIC_INK}
                strokeWidth={2.3}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.topicChipLabel,
                  { color: isSelected ? "#FFFFFF" : TOPIC_INK },
                ]}
              >
                {topic.label}
              </Text>
              {isSelected && (
                <IIcon name="check" size={16} color="#FFFFFF" strokeWidth={3} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.topicScrollSpacer} />
    </View>
  );

  return (
    <MotiView
      {...slideUpScreen}
      style={[StyleSheet.absoluteFillObject, styles.screen]}
    >
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
            placeholder="Zoek verhalen, tags, thema's..."
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

      {topicBar}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!q ? (
          <>
            <View style={styles.resultsSection}>
              <Text style={[styles.sectionLabel, { paddingHorizontal: 18 }]}>
                {hasTopicFilter ? "Gefilterde verhalen" : "Meest gelezen"}
              </Text>
              {filteredStories.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Geen meest gelezen verhalen binnen deze thema's.
                  </Text>
                </View>
              ) : (
                filteredStories.map((story) => (
                  <FeedCard
                    key={story.id}
                    story={story}
                    onOpen={openStory}
                    variant="compact"
                  />
                ))
              )}
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
              results.map((story) => (
                <FeedCard
                  key={story.id}
                  story={story}
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
  scrollContent: {
    paddingTop: 4,
  },
  section: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  topicSection: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
  },
  topicSectionLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: "rgba(15,17,26,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: "rgba(15,17,26,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  topicChipsScroll: {
    marginHorizontal: -18,
    flexGrow: 0,
    overflow: "visible",
  },
  topicChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
  },
  topicChip: {
    height: 40,
    minWidth: 104,
    paddingHorizontal: 14,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  topicChipSelected: {
    backgroundColor: SELECTED_BG,
    shadowOpacity: 0.12,
    elevation: 3,
  },
  topicChipIdle: {
    backgroundColor: TOPIC_BG,
  },
  topicChipLabel: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "900",
  },
  topicScrollSpacer: {
    height: 6,
    marginTop: -5,
    marginHorizontal: -18,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,17,26,0.05)",
  },
  resultsSection: {
    marginTop: 0,
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
