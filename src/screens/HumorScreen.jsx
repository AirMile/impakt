import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { IIcon } from "../components/Icons";
import { HeroOverlay } from "../components/HeroOverlay";
import {
  REACTION_EMOJI,
  REACTION_LABELS,
  REACTION_COLORS,
} from "../lib/reactionMeta";
import { colors, fonts } from "../theme/tokens";
import { shareMeme } from "../lib/share";
import { saveMeme, unsaveMeme } from "../lib/saves";
import {
  submitMemeReaction,
  removeMemeReaction,
  fetchMemeMyReaction,
} from "../lib/reactions";
import { reactionPct } from "../lib/reactionPct";
import { castVote, revertVote } from "../lib/reactionVote";
import { toast } from "../lib/toast";
import { pressFx } from "../lib/pressFeedback";
import { useAppFrame } from "../lib/appFrame";

// Sentinel-item dat als laatste "pagina" in de carousel de einde-kaart toont.
const END_ITEM = { id: "__end__", isEnd: true };

// Stabiele constanten buiten render — voorkomt herberekening bij elke render
const REACTION_BTNS = Object.entries(REACTION_COLORS).map(([key, color]) => ({
  key,
  color,
}));

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
            active && color && { borderColor: color, borderWidth: 1.6 },
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
  savedMemeIds,
  onSavedMemesChange,
  frameH,
}) {
  const isSaved = savedMemeIds?.has(meme.id) ?? false;
  const [saved, setSaved] = useState(isSaved);
  const [reaction, setReaction] = useState(meme.myReaction ?? null);

  // Houd de lokale status gelijk aan de centrale savedMemeIds (sync na een save
  // elders of na de begin-fetch). Optimistic updates schrijven dezelfde waarde.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(isSaved);
  }, [isSaved]);
  // Absolute counts (nu {0,0,0} tot de backend ze meestuurt); na stemmen +1.
  const [counts, setCounts] = useState(
    meme.reactions ?? { smile: 0, meh: 0, frown: 0 }
  );

  // Haal de eerdere stem op (aparte backend-route) zodat die na een reload weer
  // zichtbaar is. Overschrijft een lokale stem nooit (cur ?? mine).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchMemeMyReaction(token, meme.id).then((mine) => {
      if (!cancelled && mine) setReaction((cur) => cur ?? mine);
    });
    return () => {
      cancelled = true;
    };
  }, [token, meme.id]);

  // Optimistic toggle: zet de UI direct, draai terug als de server faalt.
  // De begin-state komt uit savedMemeIds (App.jsx, gevuld via GET /account).
  // Na succes synct onSavedMemesChange de centrale lijst bij (add/remove).
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
      onSavedMemesChange?.(meme, next);
    } catch (err) {
      setSaved(!next);
      toast.show(err.message || "Bewaren mislukt.");
    }
  }, [token, saved, meme, onSavedMemesChange]);
  const canInteract = useCallback(
    () => onRequireAuth?.() !== false,
    [onRequireAuth]
  );

  // Optimistisch (her)stemmen: zet reactie + count direct, draai terug bij
  // serverfout. Switchen verlaagt de oude stem en verhoogt de nieuwe.
  const react = useCallback(
    async (key) => {
      if (!canInteract()) return;
      if (!token) return;
      const prev = reaction;
      if (prev === key) return;
      setReaction(key);
      setCounts((c) => castVote(c, prev, key));
      try {
        // Switchen: verwijder eerst de oude stem, anders telt de backend beide.
        if (prev != null) await removeMemeReaction(token, meme.id);
        await submitMemeReaction(token, meme.id, key);
      } catch (err) {
        setReaction(prev);
        setCounts((c) => revertVote(c, prev, key));
        toast.show(err.message || "Reactie opslaan mislukt.");
      }
    },
    [reaction, canInteract, token, meme.id]
  );

  return (
    <View style={[styles.card, { height: frameH }]}>
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
            count={`${reactionPct(counts)[r.key]}%`}
            color={r.color}
            onPress={() => react(r.key)}
          />
        ))}
        <RailButton
          icon="bookmark"
          label="Bewaren"
          count={null}
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
          {meme.storyThumb ? (
            <Image
              source={{ uri: meme.storyThumb }}
              style={styles.kickerThumb}
              resizeMode="cover"
            />
          ) : null}
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

// Fullscreen einde-kaart: de laatste pagina van de meme-carousel. Content staat
// gecentreerd, ruim boven de BottomNav, zodat de knoppen er niet achter vallen.
export function MemeEndCard({ onBackToTop, onGoToFeed, frameH }) {
  return (
    <View style={[styles.endCard, { height: frameH }]}>
      <IIcon name="smile" size={44} color={colors.cream} strokeWidth={1.8} />
      <Text style={styles.endTitle}>Dat waren{"\n"}alle memes</Text>
      <Text style={styles.endSub}>Kom later terug voor verse memes</Text>

      <View style={styles.endActions}>
        <Pressable
          onPress={onBackToTop}
          accessibilityLabel="Naar boven"
          style={({ pressed }) => [styles.endBtnGhost, pressFx()({ pressed })]}
        >
          <View style={styles.endChevUp}>
            <IIcon
              name="chevDown"
              size={16}
              color={colors.cream}
              strokeWidth={2.4}
            />
          </View>
          <Text style={styles.endBtnGhostLabel}>Naar boven</Text>
        </Pressable>

        {onGoToFeed ? (
          <Pressable
            onPress={onGoToFeed}
            accessibilityLabel="Naar nieuws"
            style={({ pressed }) => [
              styles.endBtnSolid,
              pressFx()({ pressed }),
            ]}
          >
            <Text style={styles.endBtnSolidLabel}>Naar nieuws</Text>
            <IIcon
              name="arrow"
              size={15}
              color={colors.ink}
              strokeWidth={2.4}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function HumorScreen({
  initialMemeId,
  initialStoryId,
  onInitialStoryConsumed,
  onOpenStory,
  onProfile,
  onGoToFeed,
  memes = [],
  onRequireAuth,
  token,
  savedMemeIds,
  onSavedMemesChange,
}) {
  const listRef = useRef(null);
  // Huidige index — bijgehouden voor de snap-berekening (zie onScrollEndDrag)
  // en de momentum-correctie. Geen state: hoeft geen re-render te triggeren.
  const indexRef = useRef(0);

  // Paginahoogte = app-frame-hoogte (geclampt op web, volle viewport op native).
  // Eén bron voor paging-berekening én kaart-hoogte, zodat ze gegarandeerd
  // gelijk blijven binnen het mobiel-frame.
  const { height: frameH } = useAppFrame();

  // De memes plus een einde-kaart als laatste pagina. Door 'm als echt lijst-item
  // mee te geven snapt de carousel er net zo naartoe als naar een meme — geen
  // losse rubber-band of footer-zone die achter de BottomNav valt.
  const data = useMemo(() => [...memes, END_ITEM], [memes]);

  // Snap naar één pagina (meme of einde-kaart), geclampt binnen de lijstgrenzen.
  const snapToIndex = useCallback(
    (target) => {
      const clamped = Math.max(0, Math.min(data.length - 1, target));
      indexRef.current = clamped;
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
    },
    [data.length]
  );

  // Vervangt native `pagingEnabled`: dat snapt pas door bij ~50% van het scherm,
  // waardoor een kleine swipe terugvalt. Hier bepaalt al een korte verschuiving
  // (12% van het scherm) of een lichte flick (velocity) of we doorsnappen, zodat
  // een kleine scrollbeweging meteen naar de volgende/vorige meme gaat. Max één
  // meme per swipe, net als TikTok-feeds.
  //
  // De RICHTING komt alleen uit `delta` (afgeleid van contentOffset → altijd het
  // juiste teken). `velocity.y` gebruiken we niet voor de richting: het teken
  // daarvan is op iOS omgekeerd t.o.v. de scrollrichting, wat de snap eerder de
  // verkeerde kant op stuurde. Velocity verlaagt enkel de afstand-drempel.
  const onScrollEndDrag = useCallback(
    (e) => {
      const { contentOffset, velocity } = e.nativeEvent;
      const current = indexRef.current;
      const delta = contentOffset.y - current * frameH;
      const DISTANCE_THRESHOLD = frameH * 0.12;
      const VELOCITY_THRESHOLD = 0.15;
      const fastFlick = Math.abs(velocity?.y ?? 0) > VELOCITY_THRESHOLD;
      const passedDistance = Math.abs(delta) > DISTANCE_THRESHOLD;
      let target = current;
      if (Math.abs(delta) > 1 && (passedDistance || fastFlick)) {
        // current + 1 kan op de einde-kaart uitkomen; snapToIndex clampt erop.
        target = delta > 0 ? current + 1 : current - 1;
      }

      snapToIndex(target);
    },
    [snapToIndex, frameH]
  );

  // Houd de index gelijk aan de werkelijke positie na een (programmatische) scroll.
  const onMomentumScrollEnd = useCallback(
    (e) => {
      const raw = Math.round(e.nativeEvent.contentOffset.y / frameH);
      indexRef.current = Math.max(0, Math.min(data.length - 1, raw));
    },
    [data.length, frameH]
  );

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
      indexRef.current = idx;
      listRef.current.scrollToIndex({ index: idx, animated: false });
    }
    onInitialStoryConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memes.length, initialMemeId, initialStoryId]);

  const renderItem = useCallback(
    ({ item, index }) =>
      item.isEnd ? (
        <MemeEndCard
          onBackToTop={() => snapToIndex(0)}
          onGoToFeed={onGoToFeed}
          frameH={frameH}
        />
      ) : (
        <MemeCard
          meme={item}
          idx={index}
          total={memes.length}
          isFirst={index === 0}
          onOpenStory={onOpenStory}
          token={token}
          onRequireAuth={onRequireAuth}
          savedMemeIds={savedMemeIds}
          onSavedMemesChange={onSavedMemesChange}
          frameH={frameH}
        />
      ),
    [
      onOpenStory,
      onRequireAuth,
      onGoToFeed,
      snapToIndex,
      memes.length,
      token,
      savedMemeIds,
      onSavedMemesChange,
      frameH,
    ]
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
          testID="meme-feed-list"
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: frameH,
            offset: frameH * index,
            index,
          })}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          decelerationRate={0}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={5}
        />
      )}

      <View style={styles.headerOverlay}>
        <AppHeader dark logoVariant="light" onProfile={onProfile} />
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
  endCard: {
    width: "100%",
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    // Lager dan het midden zou achter de BottomNav vallen; center + de marge
    // hieronder houden de knoppen ruim vrij van de nav onderaan.
    paddingHorizontal: 32,
    paddingBottom: 120,
    gap: 16,
  },
  endTitle: {
    fontFamily: fonts.header,
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: 0.6,
    color: colors.cream,
    textAlign: "center",
    textTransform: "uppercase",
  },
  endSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "rgba(239,235,230,0.7)",
    textAlign: "center",
    marginTop: -6,
  },
  endActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  endBtnGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(239,235,230,0.35)",
  },
  endChevUp: {
    transform: [{ rotate: "180deg" }],
  },
  endBtnGhostLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "600",
    color: colors.cream,
  },
  endBtnSolid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: colors.blue,
  },
  endBtnSolidLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.cream,
    opacity: 0.7,
  },

  card: {
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
    // Bovenaan uitlijnen i.p.v. centreren, zodat "Lees meer" altijd op dezelfde
    // hoogte staat — ongeacht of de titel 1 of 2 regels beslaat.
    alignItems: "flex-start",
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
    // SemiBold via de font-familie, gelijk aan de andere eyebrow-labels in de
    // app. Géén losse fontWeight: die werkt op native niet met een embedded-
    // weight font (en zorgde voor het web/mobiel-verschil in weight).
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: colors.red,
    marginBottom: 5,
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
