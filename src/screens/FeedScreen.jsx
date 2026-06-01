import React, { useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { ReactionRail } from "../components/ReactionRail";
import { IIcon } from "../components/Icons";
import { colors, fonts, surfaces } from "../theme/tokens";
import { fadeUp } from "../theme/animations";
import storiesData from "../api/mock/stories.json";
import categoriesData from "../api/mock/categories.json";

const FEED_STORIES = storiesData.stories;
const CATS = categoriesData.categories;

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 36;

// ─── Category chips ──────────────────────────────────────────────────────────

function CatChips({ active, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
      style={styles.chipsScroll}
    >
      {CATS.map((c) => {
        const on = c === active;
        return (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            style={[styles.chip, on && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, on && styles.chipLabelActive]}>
              {c}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Feed card ───────────────────────────────────────────────────────────────

export function FeedCard({ story, onOpen, variant = "full", index = 0 }) {
  const [reaction, setReaction] = useState(null);
  const [saved, setSaved] = useState(false);
  const isCompact = variant === "compact";
  const aspectH = isCompact ? CARD_W * (3.4 / 4) : CARD_W * (4.3 / 4);

  return (
    <MotiView
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: index * 60 }}
      style={[styles.cardWrapper, { height: aspectH }]}
    >
      <Pressable onPress={() => onOpen(story)} style={StyleSheet.absoluteFill}>
        {/* Background image */}
        <Image
          source={{ uri: story.img }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <LinearGradient
          colors={[
            "rgba(15,17,26,0.55)",
            "rgba(15,17,26,0.10)",
            "rgba(15,17,26,0.05)",
            "rgba(15,17,26,0.85)",
          ]}
          locations={[0, 0.3, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Title top-left */}
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
                {story.date} · {story.time}
              </Text>
            </View>
          )}
        </View>

        {/* Right action rail */}
        <View style={styles.railArea} pointerEvents="box-none">
          <ReactionRail
            reaction={reaction}
            onReact={setReaction}
            reactions={story.reactions}
            saved={saved}
            onSave={() => setSaved((s) => !s)}
            onShare={() => {}}
            light
          />
        </View>

        {/* Bottom row */}
        {!isCompact && (
          <View style={styles.bottomRow}>
            <Pressable onPress={() => onOpen(story)} style={styles.readMore}>
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

        {/* Views bottom-right */}
        <View style={styles.viewsArea}>
          <IIcon name="eye" size={14} color={colors.cream} strokeWidth={1.7} />
          <Text style={styles.viewsLabel}>{story.views}</Text>
        </View>
      </Pressable>
    </MotiView>
  );
}

// ─── Feed screen ─────────────────────────────────────────────────────────────

export function FeedScreen({
  onOpen,
  onNav,
  onSearch,
  onProfile,
  activeTab,
  cat,
  onCatChange,
  embedded = false,
  excludeId,
  goodNewsOnly = false,
}) {
  const listRef = useRef(null);

  const storiesBase = goodNewsOnly
    ? FEED_STORIES.filter((s) => s.goodNews === true)
    : cat === "Voor jou"
      ? FEED_STORIES
      : FEED_STORIES.filter((s) => s.cat === cat);
  const stories = excludeId
    ? storiesBase.filter((s) => s.id !== excludeId)
    : storiesBase;

  const handleCatChange = (next) => {
    onCatChange(next);
    if (!embedded)
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderHeader = () =>
    goodNewsOnly ? null : <CatChips active={cat} onChange={handleCatChange} />;

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyLabel}>
        Nog geen verhalen in deze categorie.
      </Text>
    </View>
  );

  const renderFooter = () => <View style={{ height: 120 }} />;

  if (embedded) {
    return (
      <View>
        {renderHeader()}
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
      <FlatList
        ref={listRef}
        data={stories}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item, index }) => (
          <FeedCard story={item} onOpen={onOpen} index={index} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <BottomNav active={activeTab} onChange={onNav} onSearch={onSearch} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  listContent: {
    paddingTop: 4,
  },

  // Chips
  chipsScroll: {
    flexGrow: 0,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(122,207,223,0.28)",
  },
  chipActive: {
    backgroundColor: colors.ink,
  },
  chipLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  chipLabelActive: {
    fontFamily: fonts.display,
    color: colors.cream,
  },

  // Card
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
    bottom: 52,
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
  viewsArea: {
    position: "absolute",
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  viewsLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "500",
    color: colors.cream,
  },

  // Empty / footer
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
