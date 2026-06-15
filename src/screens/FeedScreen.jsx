import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

import { AppHeader } from "../components/AppHeader";
import { HeroOverlay } from "../components/HeroOverlay";
import { ReactionRail } from "../components/ReactionRail";
import { IIcon } from "../components/Icons";
import { colors, fonts, surfaces } from "../theme/tokens";
import { fadeUp } from "../theme/animations";
import { shareStory } from "../lib/share";
import { pressFx } from "../lib/pressFeedback";
import { fetchTags } from "../lib/tags";
import { orderUserTags } from "../lib/orderUserTags";
import { fetchArticles } from "../lib/articles";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 36;

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
const SELECTED_TOPIC_BG = "#ADE8F4";
const EMPTY_TAGS = [];

function TopicChips({ topics, selectedTopics, onToggle }) {
  const showScrollHint = topics.length > 3;

  return (
    <View style={styles.topicSection}>
      <Text style={styles.topicSectionLabel}>Ontdek per thema</Text>
      <View style={styles.topicScrollFrame}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicChipsRow}
          style={styles.topicChipsScroll}
        >
          {topics.map((topic) => {
            const isSelected = selectedTopics.has(topic.label);

            return (
              <Pressable
                key={topic.label}
                onPress={() => onToggle(topic.label)}
                style={({ pressed }) => [
                  styles.topicChip,
                  isSelected ? styles.topicChipSelected : styles.topicChipIdle,
                  { opacity: pressed ? 0.78 : 1 },
                ]}
              >
                <IIcon
                  size={16}
                  name={topic.icon}
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
}

export const FeedCard = React.memo(function FeedCard({
  story,
  onOpen,
  variant = "full",
  index = 0,
  onRequireAuth,
}) {
  const [reaction, setReaction] = useState(null);
  const [saved, setSaved] = useState(false);
  const isCompact = variant === "compact";
  const aspectH = isCompact ? CARD_W * (3.4 / 4) : CARD_W * (4.3 / 4);
  const canInteract = () => onRequireAuth?.() !== false;

  return (
    <MotiView {...fadeUp} style={[styles.cardWrapper, { height: aspectH }]}>
      <Pressable
        onPress={() => onOpen(story)}
        unstable_pressDelay={0}
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={{ uri: story.img }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        <HeroOverlay variant="card" />

        <View style={styles.titleArea}>
          <Text
            style={[styles.cardTitle, isCompact && styles.cardTitleCompact]}
          >
            {story.title}
          </Text>
        </View>

        <View style={styles.railArea} pointerEvents="box-none">
          <ReactionRail
            reaction={reaction}
            onReact={(key) => {
              if (!canInteract()) return;
              setReaction(key);
            }}
            reactions={story.reactions}
            saved={saved}
            onSave={() => {
              if (!canInteract()) return;
              setSaved((s) => !s);
            }}
            onShare={() => {
              if (!canInteract()) return;
              shareStory(story);
            }}
            light
          />
        </View>

        <View style={styles.bottomRow}>
          <Pressable
            onPress={() => onOpen(story)}
            style={({ pressed }) => [styles.readMore, pressFx()({ pressed })]}
          >
            <Text style={styles.readMoreLabel}>Lees meer</Text>
            <IIcon
              name="arrow"
              size={14}
              color={colors.cream}
              strokeWidth={2.2}
            />
          </Pressable>
          <View style={styles.tagsRow}>
            {story.trending && (
              <View style={styles.trendingTag}>
                <Text style={styles.trendingLabel}>Trending</Text>
                <IIcon
                  name="trend"
                  size={11}
                  color={colors.ink}
                  strokeWidth={2.4}
                />
              </View>
            )}
            {(story.tags ?? []).slice(0, 3).map((t) => (
              <View key={t.id ?? t} style={styles.tag}>
                <Text style={styles.tagLabel}>{t.name ?? t}</Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
});

export function FeedScreen({
  onOpen,
  onProfile,
  embedded = false,
  excludeId,
  goodNewsOnly = false,
  myTags = EMPTY_TAGS,
  onMyTagsChange,
  onRequireAuth,
}) {
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [allTags, setAllTags] = useState([]);
  const [articles, setArticles] = useState([]);
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
    fetchArticles()
      .then((list) => {
        if (!cancelled) setArticles(list);
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const topics = useMemo(() => {
    const usable = allTags.filter(isSelectableTopic);
    return orderUserTags(usable, myTags).map((tag) => ({
      label: tag.name,
      icon: topicIcon(tag.name),
    }));
  }, [allTags, myTags]);

  const stories = useMemo(() => {
    const base = goodNewsOnly
      ? articles.filter((story) => story.goodNews === true)
      : articles.filter((story) => story.goodNews !== true);
    const byTopic =
      selectedTopics.size === 0
        ? base
        : base.filter((story) => storyHasTopic(story, selectedTopics));
    return excludeId
      ? byTopic.filter((story) => story.id !== excludeId)
      : byTopic;
  }, [articles, selectedTopics, excludeId, goodNewsOnly]);

  const toggleTopic = useCallback(
    (label) => {
      if (onRequireAuth?.() === false) return;
      const next = new Set(selectedTopics);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      setSelectedTopics(next);
      onMyTagsChange?.(tagsForSelectedTopics(allTags, next));
    },
    [allTags, onMyTagsChange, onRequireAuth, selectedTopics]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.empty}>
        <Text style={styles.emptyLabel}>
          Nog geen verhalen in deze categorie.
        </Text>
      </View>
    ),
    []
  );

  const renderFooter = useCallback(() => <View style={{ height: 120 }} />, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <FeedCard
        story={item}
        onOpen={onOpen}
        index={index}
        onRequireAuth={onRequireAuth}
      />
    ),
    [onOpen, onRequireAuth]
  );

  const topicBar = topics.length > 0 && (
    <TopicChips
      topics={topics}
      selectedTopics={selectedTopics}
      onToggle={toggleTopic}
    />
  );

  if (embedded) {
    return (
      <View>
        {topicBar}
        {stories.map((s, i) => (
          <FeedCard
            key={`embedded-${s.id}-${i}`}
            story={s}
            onOpen={onOpen}
            index={i}
            onRequireAuth={onRequireAuth}
          />
        ))}
        {stories.length === 0 && renderEmpty()}
        {renderFooter()}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader onProfile={onProfile} />
      {topicBar}
      <FlatList
        data={stories}
        keyExtractor={(s, index) => `${s.id}-${index}`}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  listContent: {
    paddingTop: 4,
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

  cardWrapper: {
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.06)",
  },
  titleArea: {
    position: "absolute",
    top: 14,
    left: 18,
    right: 80,
  },
  cardTitle: {
    fontFamily: fonts.header,
    fontSize: 36,
    lineHeight: 36 * 0.95,
    letterSpacing: 0.36,
    color: colors.cream,
    textShadowColor: "rgba(0,0,0,0.68)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  cardTitleCompact: {
    fontSize: 30,
    lineHeight: 30 * 0.95,
  },
  railArea: {
    position: "absolute",
    bottom: 14,
    right: 14,
  },
  bottomRow: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 14,
    gap: 10,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  readMoreLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "600",
    color: colors.cream,
    textShadowColor: "rgba(0,0,0,0.72)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 56,
    flexWrap: "wrap",
  },
  trendingTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.blue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  trendingLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
  },
  tag: {
    backgroundColor: "rgba(15,17,26,0.78)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(239,235,230,0.24)",
  },
  tagLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: "500",
    color: colors.cream,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: surfaces.muted,
    textAlign: "center",
  },
});
