import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AppHeader } from "../components/AppHeader";
import { IIcon } from "../components/Icons";
import { FeedCard } from "./FeedScreen";
import { colors, fonts, surfaces } from "../theme/tokens";
import { groupHappyStories } from "../lib/storyDate";
import { fetchTags } from "../lib/tags";
import { orderUserTags } from "../lib/orderUserTags";
import { fetchHappyFeed } from "../lib/articles";

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

function tagsForSelectedTopics(allTags, selectedTopics) {
  return allTags
    .filter(isSelectableTopic)
    .filter((tag) => selectedTopics.has(tag.name));
}

const TOPIC_BG = "#DDF5F8";
const TOPIC_INK = "#10111A";
const SELECTED_BG = "#10141C";
const SELECTED_TOPIC_BG = "#74CFDF";
const EMPTY_TAGS = [];

export function HappyFeedScreen({
  onOpen,
  onProfile,
  myTags = EMPTY_TAGS,
  onMyTagsChange,
  onRequireAuth,
}) {
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [allTags, setAllTags] = useState([]);
  const [stories, setStories] = useState([]);
  const myTagNames = useMemo(
    () => (myTags ?? []).map((tag) => tag.name),
    [myTags]
  );
  const myTagNamesKey = myTagNames.join("\u0001");

  useEffect(() => {
    setSelectedTopics(new Set(myTagNames));
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

  useEffect(() => {
    let cancelled = false;
    fetchHappyFeed()
      .then((list) => {
        if (!cancelled) setStories(list);
      })
      .catch(() => {
        if (!cancelled) setStories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const happyTopics = useMemo(() => {
    const usable = allTags.filter(isSelectableTopic);
    return orderUserTags(usable, myTags).map((tag) => ({
      label: tag.name,
      icon: topicIcon(tag.name),
    }));
  }, [allTags, myTags]);

  const sections = useMemo(() => {
    const filteredStories =
      selectedTopics.size === 0
        ? stories
        : stories.filter((story) => storyHasTopic(story, selectedTopics));

    return groupHappyStories(filteredStories, {
      threshold: selectedTopics.size === 0 ? 3 : 1,
    });
  }, [stories, selectedTopics]);

  const topSections = sections.filter((sec) => sec.key !== "earlier");
  const earlierSection = sections.find((sec) => sec.key === "earlier");

  const toggleTopic = (label) => {
    if (onRequireAuth?.() === false) return;
    const next = new Set(selectedTopics);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setSelectedTopics(next);
    onMyTagsChange?.(tagsForSelectedTopics(allTags, next));
  };

  const activeLabel = [...selectedTopics].join(", ");
  const showScrollHint = happyTopics.length > 3;

  const topicBar = (
    <View style={styles.topicSection}>
      <Text style={styles.topicSectionLabel}>Ontdek per thema</Text>
      <View style={styles.topicScrollFrame}>
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
    <View style={styles.screen}>
      <AppHeader onProfile={onProfile} />
      {topicBar}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {topSections.map((sec) => (
          <View key={sec.key} style={styles.section}>
            <Text style={styles.sectionLabel}>{sec.label}</Text>
            {sec.stories.map((story, i) => (
              <FeedCard
                key={`${sec.key}-${story.id}-${i}`}
                story={story}
                onOpen={onOpen}
                variant="compact"
                index={i}
                onRequireAuth={onRequireAuth}
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
                key={`${earlierSection.key}-${story.id}-${i}`}
                story={story}
                onOpen={onOpen}
                variant="compact"
                index={i}
                onRequireAuth={onRequireAuth}
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
