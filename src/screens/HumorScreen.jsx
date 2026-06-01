import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import Svg, { Path } from "react-native-svg";

import { IIcon } from "../components/Icons";
import { HeroOverlay } from "../components/HeroOverlay";
import { REACTION_COLORS } from "../components/ReactionRail";
import { ImpaktLogo } from "../components/ImpaktLogo";
import { BottomNav } from "../components/BottomNav";
import { MEMES, STORIES as FEED_STORIES } from "../api/mock";
import { colors, fonts } from "../theme/tokens";

const { height: SCREEN_H } = Dimensions.get("window");

function RailButton({
  icon,
  count,
  active = false,
  fill = false,
  onPress,
  color,
}) {
  return (
    <Pressable onPress={onPress} style={styles.railBtn} hitSlop={8}>
      <MotiView
        animate={{ scale: active ? 1.08 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        style={styles.railCircle}
      >
        <IIcon
          name={icon}
          size={20}
          strokeWidth={1.9}
          fill={active && fill ? (color ?? colors.red) : "none"}
          color={active ? (color ?? colors.red) : colors.cream}
        />
      </MotiView>
      {count != null && <Text style={styles.railCount}>{count}</Text>}
    </Pressable>
  );
}

function MemeCard({ meme, idx, total, isFirst, onOpenStory }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [tapHeart, setTapHeart] = useState(false);
  const lastTap = useRef(0);

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (!liked) setLiked(true);
      setTapHeart(true);
      setTimeout(() => setTapHeart(false), 700);
    }
    lastTap.current = now;
  }, [liked]);

  const linkedStory = FEED_STORIES.find((s) => s.id === meme.storyId);

  const reactionBtns = Object.entries(REACTION_COLORS).map(([key, color]) => ({
    key,
    color,
  }));

  return (
    <View style={styles.card}>
      {/* Full-bleed image */}
      <Image
        source={{ uri: meme.img }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Gradient veil */}
      <HeroOverlay variant="meme" />

      {/* Double-tap target — behind rail and kicker */}
      <Pressable
        onPress={handlePress}
        style={StyleSheet.absoluteFillObject}
        accessibilityLabel="Dubbel-tap voor like"
      />

      {/* Top caption */}
      <Text style={[styles.caption, { top: 96 }]}>{meme.top}</Text>

      {/* Bottom caption */}
      <Text style={[styles.caption, { bottom: 310 }]}>{meme.bot}</Text>

      {/* Right rail — box-none so double-tap Pressable still works in blank areas */}
      <View style={styles.rail} pointerEvents="box-none">
        {reactionBtns.map((r) => {
          const collapsed = reaction !== null && reaction !== r.key;
          return (
            <MotiView
              key={r.key}
              animate={{
                opacity: collapsed ? 0 : 1,
                scale: collapsed ? 0.4 : 1,
                height: collapsed ? 0 : 64,
                marginBottom: collapsed ? -14 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={styles.reactionWrap}
              pointerEvents={collapsed ? "none" : "auto"}
            >
              <RailButton
                icon={r.key}
                count={reaction === r.key ? `${meme.reactions[r.key]}%` : null}
                active={reaction === r.key}
                color={r.color}
                onPress={() => reaction === null && setReaction(r.key)}
              />
            </MotiView>
          );
        })}
        <RailButton
          icon="bookmark"
          count={saved ? "Bewaard" : meme.shares}
          active={saved}
          fill
          color={colors.blue}
          onPress={() => setSaved((s) => !s)}
        />
        <RailButton icon="share" count={meme.shares} onPress={() => {}} />
      </View>

      {/* Story kicker */}
      <Pressable
        onPress={() => onOpenStory(meme.storyId)}
        style={styles.kicker}
      >
        <View style={styles.kickerInner}>
          <View style={styles.kickerThumb}>
            {linkedStory?.img != null && (
              <Image
                source={{ uri: linkedStory.img }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            )}
          </View>
          <View style={styles.kickerBody}>
            <Text style={styles.kickerLabel}>
              Lees meer · {meme.storySource}
            </Text>
            <Text style={styles.kickerHeadline} numberOfLines={2}>
              {meme.storyHeadline}
            </Text>
            {meme.storyTeaser != null && (
              <Text style={styles.kickerTeaser} numberOfLines={1}>
                {meme.storyTeaser}
              </Text>
            )}
          </View>
        </View>
      </Pressable>

      {/* Progress dots — left edge, vertically centered */}
      <View style={styles.dots} pointerEvents="none">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                height: i === idx ? 22 : 12,
                backgroundColor:
                  i === idx ? colors.cream : "rgba(239,235,230,0.35)",
              },
            ]}
          />
        ))}
      </View>

      {/* Swipe hint — first card only */}
      {isFirst && (
        <View style={styles.swipeHint} pointerEvents="none">
          <Text style={styles.swipeHintText}>Swipe omhoog</Text>
          <IIcon
            name="chevDown"
            size={18}
            color={colors.cream}
            strokeWidth={2}
          />
        </View>
      )}

      {/* Double-tap heart pop — rendered last to appear on top */}
      <MotiView
        animate={{ opacity: tapHeart ? 1 : 0, scale: tapHeart ? 1.3 : 0.6 }}
        transition={{ type: "timing", duration: 500 }}
        pointerEvents="none"
        style={styles.heartOverlay}
      >
        <Svg width={130} height={130} viewBox="0 0 24 24">
          <Path
            d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"
            fill={colors.red}
          />
        </Svg>
      </MotiView>
    </View>
  );
}

export function HumorScreen({
  onNav,
  onSearch,
  onProfile,
  activeTab,
  initialStoryId,
  onInitialStoryConsumed,
  onOpenStory,
}) {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);

  // Compute initial scroll index once on mount
  const [initialIdx] = useState(() => {
    if (initialStoryId == null) return 0;
    const i = MEMES.findIndex((m) => m.storyId === initialStoryId);
    return i >= 0 ? i : 0;
  });

  // Consume the pending story ID immediately after mount
  useEffect(() => {
    if (initialStoryId != null) onInitialStoryConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <MemeCard
        meme={item}
        idx={index}
        total={MEMES.length}
        isFirst={index === 0}
        onOpenStory={onOpenStory}
      />
    ),
    [onOpenStory]
  );

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        data={MEMES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_H,
          offset: SCREEN_H * index,
          index,
        })}
        initialScrollIndex={initialIdx > 0 ? initialIdx : undefined}
        decelerationRate="fast"
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={5}
      />

      {/* Overlay header — transparent gradient, touch passthrough */}
      <View
        style={[styles.headerOverlay, { height: insets.top + 80 }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={["rgba(15,17,26,0.65)", "transparent"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
          <View style={{ width: 34 }} />
          <ImpaktLogo size={26} dark={false} dotColor={colors.cream} />
          <View style={{ width: 34 }} />
        </View>
      </View>

      {/* Bottom nav */}
      <BottomNav
        active={activeTab}
        onChange={onNav}
        onSearch={onSearch}
        theme="dark"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
  },

  // Card
  card: {
    height: SCREEN_H,
    width: "100%",
    backgroundColor: colors.ink,
    overflow: "hidden",
  },

  // Caption (Bebas Neue, simulated stroke via text shadow)
  caption: {
    position: "absolute",
    left: 18,
    right: 78,
    fontFamily: fonts.header,
    fontSize: 28,
    lineHeight: 29,
    letterSpacing: 0.7,
    color: colors.cream,
    textTransform: "uppercase",
    textShadowColor: colors.ink,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // Right rail
  rail: {
    position: "absolute",
    right: 12,
    bottom: 230,
    flexDirection: "column",
    gap: 14,
    alignItems: "center",
  },
  reactionWrap: {
    overflow: "hidden",
    alignItems: "center",
  },
  railBtn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
  },
  railCircle: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: "rgba(15,17,26,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(239,235,230,0.18)",
    overflow: "hidden",
  },
  railCount: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "700",
    color: colors.cream,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Story kicker
  kicker: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 90,
  },
  kickerInner: {
    backgroundColor: "rgba(239,235,230,0.96)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  kickerThumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "rgba(15,17,26,0.08)",
  },
  kickerBody: {
    flex: 1,
    minWidth: 0,
  },
  kickerLabel: {
    fontFamily: fonts.display,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.red,
    marginBottom: 3,
  },
  kickerHeadline: {
    fontFamily: fonts.header,
    fontSize: 20,
    lineHeight: 21,
    letterSpacing: 0.2,
    color: colors.ink,
  },
  kickerTeaser: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(15,17,26,0.6)",
  },

  // Progress dots
  dots: {
    position: "absolute",
    left: 8,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 2.5,
    borderRadius: 9999,
  },

  // Swipe hint
  swipeHint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 230,
    alignItems: "center",
    gap: 2,
  },
  swipeHintText: {
    fontFamily: fonts.displayMedium,
    fontSize: 11,
    color: "rgba(239,235,230,0.9)",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Double-tap heart
  heartOverlay: {
    position: "absolute",
    top: "45%",
    left: "50%",
    marginLeft: -65,
    marginTop: -65,
  },

  // Header overlay
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
});
