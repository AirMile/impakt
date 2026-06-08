import React, { useState, useMemo, useCallback } from "react";
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
import { MotiView } from "moti";

import { AppHeader } from "../components/AppHeader";
import { HeroOverlay } from "../components/HeroOverlay";
import { ReactionRail } from "../components/ReactionRail";
import { IIcon } from "../components/Icons";
import { colors, fonts, surfaces } from "../theme/tokens";
import { fadeUp } from "../theme/animations";
import { STORIES as FEED_STORIES } from "../api/mock";
import { shareStory } from "../lib/share";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 36;

const FEED_TOPICS = [
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

function TopicChips({ selectedTopics, onToggle }) {
  return (
    <View style={styles.topicSection}>
      <Text style={styles.topicSectionLabel}>Ontdek per thema</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicChipsRow}
        style={styles.topicChipsScroll}
      >
        {FEED_TOPICS.map((topic) => {
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
}

export const FeedCard = React.memo(function FeedCard({
  story,
  onOpen,
  variant = "full",
  index = 0,
}) {
  const [reaction, setReaction] = useState(null);
  const [saved, setSaved] = useState(false);
  const isCompact = variant === "compact";
  const aspectH = isCompact ? CARD_W * (3.4 / 4) : CARD_W * (4.3 / 4);

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
          {isCompact && (
            <View style={styles.dateRow}>
              <IIcon name="calendar" size={12} color={colors.cream} />
              <Text style={styles.dateMeta}>
                {story.date} - {story.time}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.railArea} pointerEvents="box-none">
          <ReactionRail
            reaction={reaction}
            onReact={setReaction}
            reactions={story.reactions}
            saved={saved}
            onSave={() => setSaved((s) => !s)}
            onShare={() => shareStory(story)}
            light
          />
        </View>

        {!isCompact && (
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
              {story.tags.slice(0, 3).map((t, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagLabel}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
}) {
  const [selectedTopics, setSelectedTopics] = useState(new Set());

  const activeCats = useMemo(() => {
    if (selectedTopics.size === 0) return [];
    return FEED_TOPICS.filter((topic) => selectedTopics.has(topic.label)).map(
      (topic) => topic.cat
    );
  }, [selectedTopics]);

  const stories = useMemo(() => {
    const base = goodNewsOnly
      ? FEED_STORIES.filter((story) => story.goodNews === true)
      : FEED_STORIES;
    const byTopic =
      activeCats.length === 0
        ? base
        : base.filter((story) => activeCats.includes(story.cat));
    return excludeId
      ? byTopic.filter((story) => story.id !== excludeId)
      : byTopic;
  }, [activeCats, excludeId, goodNewsOnly]);

  const toggleTopic = useCallback((label) => {
    setSelectedTopics((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

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
      <FeedCard story={item} onOpen={onOpen} index={index} />
    ),
    [onOpen]
  );

  const topicBar = !goodNewsOnly && (
    <TopicChips selectedTopics={selectedTopics} onToggle={toggleTopic} />
  );

  if (embedded) {
    return (
      <View>
        {topicBar}
        {stories.map((s, i) => (
          <FeedCard key={s.id} story={s} onOpen={onOpen} index={i} />
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
        keyExtractor={(s) => String(s.id)}
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
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  cardTitleCompact: {
    fontSize: 30,
    lineHeight: 30 * 0.95,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    opacity: 0.85,
  },
  dateMeta: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.cream,
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
    backgroundColor: "rgba(15,17,26,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(239,235,230,0.18)",
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
