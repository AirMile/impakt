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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { IIcon } from "../components/Icons";
import { HeroOverlay } from "../components/HeroOverlay";
import { REACTION_COLORS } from "../components/ReactionRail";
import { ImpaktLogo } from "../components/ImpaktLogo";
import { colors, fonts } from "../theme/tokens";
import { shareMeme } from "../lib/share";
import { createDoubleTapDetector } from "../lib/createDoubleTapDetector";
import { pressFx } from "../lib/pressFeedback";

const { height: SCREEN_H } = Dimensions.get("window");

const REACTION_EMOJI = { smile: "😊", meh: "😐", frown: "☹️" };

// Stabiele constanten buiten render — voorkomt herberekening bij elke render
const REACTION_BTNS = Object.entries(REACTION_COLORS).map(([key, color]) => ({
  key,
  color,
}));
const REACTION_LABELS = { smile: "Blij", meh: "Neutraal", frown: "Verdrietig" };

function RailButton({
  icon,
  label,
  count,
  isReaction = false,
  voted = false,
  active = false,
  dimmed = false,
  fill = false,
  onPress,
  color,
}) {
  return (
    <View
      testID={`rxn-btn-${icon}`}
      style={dimmed ? styles.railBtnDimmed : null}
    >
      <Pressable
        onPress={onPress}
        unstable_pressDelay={0}
        accessibilityLabel={label}
        style={styles.railBtn}
        hitSlop={8}
      >
        <View
          style={[
            styles.railCircle,
            isReaction && active && { borderColor: color, borderWidth: 1.6 },
          ]}
        >
          {isReaction && voted ? (
            <Text
              style={[
                styles.pctInner,
                { color: active ? color : colors.cream },
              ]}
            >
              {count}
            </Text>
          ) : isReaction ? (
            <Text style={styles.reactionEmoji}>{REACTION_EMOJI[icon]}</Text>
          ) : (
            <IIcon
              name={icon}
              size={20}
              strokeWidth={1.9}
              fill={active && fill ? (color ?? colors.red) : "none"}
              color={active ? (color ?? colors.red) : colors.cream}
            />
          )}
        </View>
        {!isReaction && count != null && (
          <Text style={styles.railCount}>{count}</Text>
        )}
      </Pressable>
    </View>
  );
}

const MemeCard = React.memo(function MemeCard({
  meme,
  idx,
  total,
  isFirst,
  onOpenStory,
  onRequireAuth,
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [tapHeart, setTapHeart] = useState(false);
  const detectDoubleTap = useRef(createDoubleTapDetector(280));
  const canInteract = useCallback(
    () => onRequireAuth?.() !== false,
    [onRequireAuth]
  );

  const handlePress = useCallback(() => {
    if (detectDoubleTap.current(Date.now())) {
      if (!canInteract()) return;
      if (!liked) setLiked(true);
      setTapHeart(true);
      setTimeout(() => setTapHeart(false), 700);
    }
  }, [canInteract, liked]);

  const heartOpacity = useSharedValue(0);
  const heartScale = useSharedValue(0.6);
  useEffect(() => {
    heartOpacity.value = withTiming(tapHeart ? 1 : 0, { duration: 500 });
    heartScale.value = withTiming(tapHeart ? 1.3 : 0.6, { duration: 500 });
  }, [tapHeart, heartOpacity, heartScale]);
  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: meme.img }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      <HeroOverlay variant="meme" />

      <Pressable
        onPress={handlePress}
        style={StyleSheet.absoluteFillObject}
        accessibilityLabel="Dubbel-tap voor like"
      />

      <Text style={[styles.caption, { top: 96 }]}>{meme.top}</Text>
      <Text style={[styles.caption, { bottom: 310 }]}>{meme.bot}</Text>

      <View style={styles.rail} pointerEvents="box-none">
        {REACTION_BTNS.map((r) => (
          <RailButton
            key={r.key}
            icon={r.key}
            label={REACTION_LABELS[r.key]}
            isReaction
            voted={reaction !== null}
            active={reaction === r.key}
            dimmed={reaction !== null && reaction !== r.key}
            count={`${meme.reactions[r.key]}%`}
            color={r.color}
            onPress={() => {
              if (reaction !== null) return;
              if (!canInteract()) return;
              setReaction(r.key);
            }}
          />
        ))}
        <RailButton
          icon="bookmark"
          label="Bewaren"
          count={saved ? "Bewaard" : null}
          active={saved}
          fill
          color={colors.blue}
          onPress={() => {
            if (!canInteract()) return;
            setSaved((s) => !s);
          }}
        />
        <RailButton
          icon="share"
          label="Delen"
          count={null}
          onPress={() => {
            if (!canInteract()) return;
            shareMeme(meme);
          }}
        />
      </View>

      <Pressable
        onPress={() => onOpenStory(meme.storyId)}
        unstable_pressDelay={0}
        style={({ pressed }) => [
          styles.kicker,
          pressFx({ scale: 0.98 })({ pressed }),
        ]}
      >
        <View style={styles.kickerInner}>
          <View style={styles.kickerBody}>
            <Text style={styles.kickerLabel}>
              Lees meer · {meme.storySource}
            </Text>
            <Text style={styles.kickerHeadline} numberOfLines={2}>
              {meme.storyHeadline}
            </Text>
            {meme.storyTeaser ? (
              <Text style={styles.kickerTeaser} numberOfLines={1}>
                {meme.storyTeaser}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

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

      <Animated.View
        pointerEvents="none"
        style={[styles.heartOverlay, heartStyle]}
      >
        <Svg width={130} height={130} viewBox="0 0 24 24">
          <Path
            d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"
            fill={colors.red}
          />
        </Svg>
      </Animated.View>
    </View>
  );
});

export function HumorScreen({
  onNav,
  onSearch,
  onProfile,
  activeTab,
  initialStoryId,
  onInitialStoryConsumed,
  onOpenStory,
  memes = [],
  onRequireAuth,
}) {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);

  // Scroll naar de juiste meme wanneer App.jsx een initialStoryId doorgeeft
  // (deeplink uit `impakt://meme/<id>` of "bekijk memes"-tap in DetailScreen).
  // Effect-based zodat het ook werkt als memes pas ná mount binnenkomen.
  useEffect(() => {
    if (initialStoryId == null) return;
    if (memes.length === 0) return;
    const idx = memes.findIndex((m) => m.storyId === initialStoryId);
    if (idx > 0 && listRef.current) {
      listRef.current.scrollToIndex({ index: idx, animated: false });
    }
    onInitialStoryConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memes.length, initialStoryId]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <MemeCard
        meme={item}
        idx={index}
        total={memes.length}
        isFirst={index === 0}
        onOpenStory={onOpenStory}
        onRequireAuth={onRequireAuth}
      />
    ),
    [onOpenStory, onRequireAuth, memes.length]
  );

  return (
    <View style={styles.screen}>
      {memes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nog geen memes beschikbaar.</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={memes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: SCREEN_H,
            offset: SCREEN_H * index,
            index,
          })}
          decelerationRate="fast"
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={5}
        />
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.cream,
    opacity: 0.7,
  },

  card: {
    height: SCREEN_H,
    width: "100%",
    backgroundColor: colors.ink,
    overflow: "hidden",
  },

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

  rail: {
    position: "absolute",
    right: 12,
    bottom: 230,
    flexDirection: "column",
    gap: 14,
    alignItems: "center",
  },
  railBtnDimmed: {
    opacity: 0.5,
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
  reactionEmoji: {
    fontSize: 20,
  },
  pctInner: {
    fontFamily: fonts.display,
    fontWeight: "700",
    fontSize: 15,
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

  heartOverlay: {
    position: "absolute",
    top: "45%",
    left: "50%",
    marginLeft: -65,
    marginTop: -65,
  },

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
