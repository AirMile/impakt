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

import { AppHeader } from "../components/AppHeader";
import { IIcon } from "../components/Icons";
import { HeroOverlay } from "../components/HeroOverlay";
import { REACTION_COLORS } from "../components/ReactionRail";
import { colors, fonts } from "../theme/tokens";
import { shareMeme } from "../lib/share";
import { saveMeme, unsaveMeme } from "../lib/saves";
import { toast } from "../lib/toast";
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
  token,
}) {
  const [saved, setSaved] = useState(false);
  const [reaction, setReaction] = useState(null);

  // Optimistic toggle: zet de UI direct, draai terug als de server faalt.
  // De backend heeft geen "is deze meme bewaard?"-endpoint, dus de begin-state
  // is altijd false bij heropenen — alleen de toggle praat met de server.
  const toggleSaved = useCallback(async () => {
    if (!token) {
      toast.show("Log in om memes te bewaren.");
      return;
    }
    const next = !saved;
    setSaved(next);
    try {
      if (next) await saveMeme(token, meme.id);
      else await unsaveMeme(token, meme.id);
    } catch (err) {
      setSaved(!next);
      toast.show(err.message || "Bewaren mislukt.");
    }
  }, [token, saved, meme.id]);
  const canInteract = useCallback(
    () => onRequireAuth?.() !== false,
    [onRequireAuth]
  );

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: meme.img }}
        style={styles.memeImage}
        resizeMode="contain"
      />

      <HeroOverlay variant="meme" />

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
          onPress={toggleSaved}
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
    </View>
  );
});

export function HumorScreen({
  initialMemeId,
  initialStoryId,
  onInitialStoryConsumed,
  onOpenStory,
  memes = [],
  onRequireAuth,
  token,
}) {
  const listRef = useRef(null);

  // Scroll naar de juiste meme wanneer App.jsx een initialMemeId/storyId doorgeeft
  // (deeplink uit `impakt://meme/<id>` of "bekijk memes"-tap in DetailScreen).
  // Effect-based zodat het ook werkt als memes pas ná mount binnenkomen.
  useEffect(() => {
    if (initialMemeId == null && initialStoryId == null) return;
    if (memes.length === 0) return;
    const idx = memes.findIndex((m) =>
      initialMemeId != null
        ? String(m.id) === String(initialMemeId)
        : m.storyId === initialStoryId
    );
    if (idx > 0 && listRef.current) {
      listRef.current.scrollToIndex({ index: idx, animated: false });
    }
    onInitialStoryConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memes.length, initialMemeId, initialStoryId]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <MemeCard
        meme={item}
        idx={index}
        total={memes.length}
        isFirst={index === 0}
        onOpenStory={onOpenStory}
        token={token}
        onRequireAuth={onRequireAuth}
      />
    ),
    [onOpenStory, onRequireAuth, memes.length, token]
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

      <View style={styles.headerOverlay}>
        <AppHeader dark showProfile={false} />
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
  memeImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.ink,
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

  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
