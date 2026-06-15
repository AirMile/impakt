import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";

import { AppHeader } from "../components/AppHeader";
import { DataState } from "../components/DataState";
import { IIcon } from "../components/Icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { FeedCard } from "./FeedScreen";
import { colors, fonts, surfaces } from "../theme/tokens";
import { groupHappyStories } from "../lib/storyDate";
import { fetchTags, isInterestTag } from "../lib/tags";
import { orderUserTags } from "../lib/orderUserTags";
import { fetchHappyFeed } from "../lib/articles";

const TOPIC_BG = "#DDF5F8";
const TOPIC_INK = "#10111A";
const SELECTED_BG = "#10141C";

export function HappyFeedScreen({
  onOpen,
  onProfile,
  myTags = [],
  onRequireAuth,
  token,
  savedIds,
  onSavedChange,
}) {
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [allTags, setAllTags] = useState([]);

  // Thema-chips zijn secundair: bij een fout verbergen we ze stil.
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

  // Good-news feed is de primaire content: spinner tijdens laden, retry bij fout.
  const {
    data: storiesData,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchHappyFeed(), []);
  const stories = useMemo(() => storiesData ?? [], [storiesData]);

  const happyTopics = useMemo(() => {
    const usable = allTags.filter(isInterestTag);
    return orderUserTags(usable, myTags).map((tag) => ({ label: tag.name }));
  }, [allTags, myTags]);

  const sections = useMemo(() => {
    // story.tags zijn tag-namen; selectedTopics bevat de geselecteerde namen.
    const filteredStories =
      selectedTopics.size === 0
        ? stories
        : stories.filter((story) =>
            (story.tags ?? []).some((name) => selectedTopics.has(name))
          );

    return groupHappyStories(filteredStories, {
      threshold: selectedTopics.size === 0 ? 3 : 1,
    });
  }, [stories, selectedTopics]);

  const topSections = sections.filter((sec) => sec.key !== "earlier");
  const earlierSection = sections.find((sec) => sec.key === "earlier");

  const toggleTopic = (label) => {
    setSelectedTopics((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const activeLabel = [...selectedTopics].join(", ");

  const topicBar = (
    <View style={styles.topicSection}>
      <Text style={styles.topicSectionLabel}>Ontdek per thema</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicChipsRow}
        style={styles.topicChipsScroll}
      >
        {happyTopics.map((topic) => {
          const isSelected = selectedTopics.has(topic.label);

          return (
            <Pressable
              key={topic.label}
              testID={`happy-topic-${topic.label}`}
              onPress={() => toggleTopic(topic.label)}
              style={({ pressed }) => [
                styles.topicChip,
                isSelected ? styles.topicChipSelected : styles.topicChipIdle,
                { opacity: pressed ? 0.78 : 1 },
              ]}
            >
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
    <View style={styles.screen}>
      <AppHeader onProfile={onProfile} />
      {topicBar}
      <DataState loading={loading} error={error} onRetry={reload}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {topSections.map((sec) => (
            <View key={sec.key} style={styles.section}>
              <Text style={styles.sectionLabel}>{sec.label}</Text>
              {sec.stories.map((story, i) => (
                <FeedCard
                  key={story.id}
                  story={story}
                  onOpen={onOpen}
                  variant="compact"
                  index={i}
                  onRequireAuth={onRequireAuth}
                  token={token}
                  savedIds={savedIds}
                  onSavedChange={onSavedChange}
                />
              ))}
            </View>
          ))}

          {earlierSection && (
            <View style={styles.section}>
              {topSections.length > 0 && (
                <Text style={styles.sectionLabel}>{earlierSection.label}</Text>
              )}
              {earlierSection.stories.map((story, i) => (
                <FeedCard
                  key={story.id}
                  story={story}
                  onOpen={onOpen}
                  index={i}
                  onRequireAuth={onRequireAuth}
                  token={token}
                  savedIds={savedIds}
                  onSavedChange={onSavedChange}
                />
              ))}
            </View>
          )}

          {sections.length === 0 && selectedTopics.size > 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyLabel}>
                Geen leuk nieuws over {activeLabel}.{"\n"}Tik nogmaals om het
                filter te wissen.
              </Text>
            </View>
          )}

          {sections.length === 0 && selectedTopics.size === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyLabel}>
                Geen goed nieuws op dit moment.{"\n"}Kom later terug.
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </DataState>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    paddingTop: 4,
  },
  section: {
    marginTop: 0,
    gap: 0,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: surfaces.muted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    paddingHorizontal: 18,
    marginBottom: 12,
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
