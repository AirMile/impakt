import { useEffect, useMemo, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

import { IIcon } from "../components/Icons";
import { DataState } from "../components/DataState";
import { FeedCard } from "./FeedScreen";
import { useAsyncData } from "../hooks/useAsyncData";
import { colors, fonts } from "../theme/tokens";
import { slideUpScreen } from "../theme/animations";
import { searchStories } from "../lib/searchStories";
import { fetchTags } from "../lib/tags";
import { orderUserTags } from "../lib/orderUserTags";
import { fetchArticles } from "../lib/articles";

const CATEGORY_ICONS = {
  politiek: "topicPolitics",
  buitenland: "topicWorld",
  economie: "topicEconomy",
  sport: "topicSport",
  natuur: "topicNature",
  innovatie: "topicInnovation",
  kunst: "topicArt",
  lokaal: "topicLocal",
};

function topicIcon(tagName) {
  return CATEGORY_ICONS[String(tagName).trim().toLowerCase()] ?? "topicWorld";
}

function isSelectableTopic(tag) {
  const name = String(tag?.name ?? "")
    .trim()
    .toLowerCase();
  const category = String(tag?.category ?? "")
    .trim()
    .toLowerCase();
  return Boolean(name) && name !== "goed nieuws" && category !== "flag";
}

function storyHasTopic(story, selectedTopics) {
  return (story.tags ?? []).some((tag) => {
    const name = typeof tag === "string" ? tag : tag?.name;
    return selectedTopics.has(name);
  });
}

const TOPIC_BG = "#DDF5F8";
const TOPIC_INK = "#10111A";
const SELECTED_BG = "#10141C";
const SELECTED_TOPIC_BG = "#ADE8F4";
const EMPTY_TAGS = [];

export function SearchScreen({
  onClose,
  onOpenStory,
  myTags = EMPTY_TAGS,
  onRequireAuth,
  token,
  savedIds,
  onSavedChange,
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [allTags, setAllTags] = useState([]);

  // Onboarding/profiel-interesses staan voorgeselecteerd (en bovenaan via
  // orderUserTags). Filteren blijft puur lokaal — geen server-sync.
  const myTagNamesKey = (myTags ?? []).map((tag) => tag.name).join("|");
  useEffect(() => {
    setSelectedTopics(new Set((myTags ?? []).map((tag) => tag.name)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTagNamesKey]);

  useEffect(() => {
    let cancelled = false;
    fetchTags()
      .then((tags) => {
        if (!cancelled) setAllTags(tags);
      })
      .catch(() => {
        if (!cancelled) setAllTags([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Artikelen zijn de primaire content: spinner tijdens laden, retry bij fout.
  const {
    data: articlesData,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchArticles(), []);
  const allArticles = useMemo(() => articlesData ?? [], [articlesData]);

  const TOPICS = useMemo(() => {
    const usable = allTags.filter(isSelectableTopic);
    return orderUserTags(usable, myTags).map((tag) => ({
      label: tag.name,
      icon: topicIcon(tag.name),
    }));
  }, [allTags, myTags]);

  const filteredStories = useMemo(() => {
    if (selectedTopics.size === 0) return allArticles;
    return allArticles.filter((story) => storyHasTopic(story, selectedTopics));
  }, [selectedTopics, allArticles]);

  const q = query.trim().toLowerCase();
  const searchPool = q ? allArticles : filteredStories;
  const results = searchStories(query, searchPool);
  const hasTopicFilter = selectedTopics.size > 0;

  const openStory = (story) => {
    Keyboard.dismiss();
    onOpenStory(story);
  };

  const toggleTopic = (label) => {
    const next = new Set(selectedTopics);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setSelectedTopics(next);
  };

  const showScrollHint = TOPICS.length > 3;

  const topicBar = !q && (
    <View style={styles.topicSection}>
      <Text style={styles.topicSectionLabel}>Ontdek per thema</Text>
      <View style={styles.topicScrollFrame}>
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
                  color={isSelected ? SELECTED_BG : TOPIC_INK}
                  strokeWidth={2.3}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.topicChipLabel,
                    { color: isSelected ? SELECTED_BG : TOPIC_INK },
                  ]}
                >
                  {topic.label}
                </Text>
                {isSelected && (
                  <IIcon
                    name="check"
                    size={16}
                    color={SELECTED_BG}
                    strokeWidth={3}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
        {showScrollHint && (
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(239,235,230,0)", colors.cream]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.topicScrollHint}
          />
        )}
      </View>
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
      <DataState loading={loading} error={error} onRetry={reload}>
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
                  {hasTopicFilter ? "Gefilterde verhalen" : "Alle artikelen"}
                </Text>
                {filteredStories.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      Geen artikelen binnen deze thema's.
                    </Text>
                  </View>
                ) : (
                  filteredStories.map((story, i) => (
                    <FeedCard
                      key={`filtered-${story.id}-${i}`}
                      story={story}
                      onOpen={openStory}
                      variant="compact"
                      onRequireAuth={onRequireAuth}
                      token={token}
                      savedIds={savedIds}
                      onSavedChange={onSavedChange}
                    />
                  ))
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.resultsCount}>
                {results.length}{" "}
                {results.length === 1 ? "resultaat" : "resultaten"} voor "
                {query}"
              </Text>
              {results.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Geen resultaten voor "{query}"
                  </Text>
                </View>
              ) : (
                results.map((story, i) => (
                  <FeedCard
                    key={`result-${story.id}-${i}`}
                    story={story}
                    onOpen={openStory}
                    variant="full"
                    onRequireAuth={onRequireAuth}
                    token={token}
                    savedIds={savedIds}
                    onSavedChange={onSavedChange}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
      </DataState>
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
  topicScrollFrame: {
    position: "relative",
  },
  topicScrollHint: {
    position: "absolute",
    top: 0,
    right: -18,
    bottom: 0,
    width: 46,
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
    borderWidth: 1.5,
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
    backgroundColor: SELECTED_TOPIC_BG,
    borderColor: SELECTED_BG,
    shadowOpacity: 0.12,
    elevation: 3,
  },
  topicChipIdle: {
    backgroundColor: TOPIC_BG,
    borderColor: "rgba(15,17,26,0.04)",
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
