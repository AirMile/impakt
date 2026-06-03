import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav } from "../components/BottomNav";
import { HeroOverlay } from "../components/HeroOverlay";
import { ReactionRail } from "../components/ReactionRail";
import { ImpaktLogo } from "../components/ImpaktLogo";
import { IIcon } from "../components/Icons";
import { FeedScreen } from "./FeedScreen";
import { colors, fonts, surfaces } from "../theme/tokens";
import { slideUpScreen } from "../theme/animations";
import { MEMES } from "../api/mock";
import { shareStory } from "../lib/share";
import { sumVotes, votePct } from "../lib/pollPct";
import { isInFeed } from "../lib/isInFeed";
import { getRelatedMemes } from "../lib/getRelatedMemes";

export function DetailScreen({
  story,
  onClose,
  onOpenMeme,
  onSwapStory,
  tab,
  feedCat,
  onCatChange,
  onNav,
  onProfile,
  onSearch,
  activeTab,
}) {
  const insets = useSafeAreaInsets();
  const [reaction, setReaction] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pollChoice, setPollChoice] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [inFeed, setInFeed] = useState(false);
  const feedYRef = useRef(Infinity);

  const relatedMemes = getRelatedMemes(MEMES, story.id);
  const firstMeme = relatedMemes[0];

  const totalVotes = story.poll ? sumVotes(story.poll.options, pollChoice) : 0;

  const onScroll = (e) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    const viewH = e.nativeEvent.layoutMeasurement.height;
    setInFeed((current) =>
      isInFeed({
        scrollY,
        viewportH: viewH,
        sectionY: feedYRef.current,
        current,
      })
    );
  };

  const onFeedSectionLayout = (e) => {
    feedYRef.current = e.nativeEvent.layout.y;
  };

  return (
    <MotiView {...slideUpScreen} style={styles.screen}>
      {/* Cross-fade header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        {/* Article nav: back + logo + share */}
        <MotiView
          animate={{ opacity: inFeed ? 0 : 1 }}
          transition={{ type: "timing", duration: 250 }}
          pointerEvents={inFeed ? "none" : "auto"}
          style={styles.headerRow}
        >
          <Pressable
            onPress={onClose}
            style={styles.headerIconBtn}
            accessibilityLabel="Terug"
          >
            <IIcon name="arrowL" size={26} color={colors.ink} strokeWidth={2} />
          </Pressable>
          <ImpaktLogo size={26} dark />
          <Pressable
            style={[styles.headerIconBtn, styles.headerCircleBtn]}
            accessibilityLabel="Delen"
            onPress={() => shareStory(story)}
          >
            <IIcon
              name="share"
              size={18}
              color={colors.ink}
              strokeWidth={1.8}
            />
          </Pressable>
        </MotiView>

        {/* Feed header: spacer + logo + profile — absolute overlay */}
        <MotiView
          animate={{ opacity: inFeed ? 1 : 0 }}
          transition={{ type: "timing", duration: 250 }}
          pointerEvents={inFeed ? "auto" : "none"}
          style={[
            StyleSheet.absoluteFillObject,
            styles.headerRow,
            { top: insets.top + 10 },
          ]}
        >
          <View style={styles.headerIconBtn} />
          <ImpaktLogo size={26} dark />
          <Pressable
            onPress={onProfile}
            style={[styles.headerIconBtn, styles.headerCircleBtn]}
            accessibilityLabel="Profiel"
          >
            <IIcon name="user" size={18} color={colors.ink} strokeWidth={1.8} />
          </Pressable>
        </MotiView>
      </View>

      {/* Scrollable body */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {/* Hero image */}
        <View style={styles.hero}>
          <Image
            source={{ uri: story.img }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <HeroOverlay variant="hero" />
          <View style={styles.heroRail}>
            <ReactionRail
              reaction={reaction}
              onReact={setReaction}
              reactions={story.reactions}
              saved={saved}
              onSave={() => setSaved((s) => !s)}
              light
            />
          </View>
        </View>

        {/* Article body */}
        <View style={styles.body}>
          <Text style={styles.title}>{story.title}</Text>

          <Text style={styles.meta}>
            12 min geleden · 4 min leestijd · {story.views} lezers
          </Text>

          <Text style={styles.sub}>{story.sub}</Text>

          {story.body.map((para, i) => (
            <Text key={i} style={styles.para}>
              {para}
            </Text>
          ))}

          {/* Sectie-divider "Doe mee" */}
          <View style={styles.sectionDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Doe mee</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Peiling */}
          {story.poll && (
            <View style={styles.pollCard}>
              <View style={styles.pollTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pollQ}>{story.poll.q}</Text>
                  <Text style={styles.pollHint}>
                    Stem en zie wat anderen kiezen.
                  </Text>
                </View>
                <Text style={styles.peilLabel}>PEILING</Text>
              </View>

              <View style={styles.pollOptions}>
                {story.poll.options.map((opt) => {
                  const v = opt.votes + (pollChoice === opt.id ? 1 : 0);
                  const pct = votePct(v, totalVotes);
                  const isMine = pollChoice === opt.id;
                  const showResults = pollChoice !== null;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setPollChoice(opt.id)}
                      style={styles.pollOpt}
                    >
                      {showResults && (
                        <View
                          style={[
                            styles.pollBar,
                            {
                              width: `${pct}%`,
                              backgroundColor: isMine
                                ? "rgba(228,99,77,0.25)"
                                : "rgba(15,17,26,0.08)",
                            },
                          ]}
                        />
                      )}
                      <View
                        style={[
                          styles.pollDot,
                          isMine && { backgroundColor: colors.red },
                        ]}
                      />
                      <Text style={[styles.pollOptLabel, { flex: 1 }]}>
                        {opt.label}
                      </Text>
                      {showResults && (
                        <Text
                          style={[
                            styles.pollPct,
                            isMine && { color: colors.red },
                          ]}
                        >
                          {pct}%
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {pollChoice && (
                <Text style={styles.pollVoters}>
                  {totalVotes.toLocaleString("nl-NL")} mensen stemden mee
                </Text>
              )}
            </View>
          )}

          <View style={styles.thinDivider} />

          {/* Meme-card */}
          {firstMeme && (
            <Pressable
              onPress={() => onOpenMeme?.(story.id)}
              style={styles.memeCard}
            >
              <Image
                source={{ uri: firstMeme.img }}
                style={styles.memeThumbnail}
                resizeMode="cover"
              />
              <View style={styles.memeBody}>
                <View>
                  <Text style={styles.memeTitle}>
                    {relatedMemes.length > 1
                      ? `${relatedMemes.length} memes over dit verhaal`
                      : "Meme over dit verhaal"}
                  </Text>
                  <Text style={styles.memeSub}>Even iets lichters</Text>
                </View>
                <View style={styles.memeBtn}>
                  <Text style={styles.memeBtnLabel}>Naar humor</Text>
                  <IIcon
                    name="arrow"
                    size={13}
                    color={colors.cream}
                    strokeWidth={2.2}
                  />
                </View>
              </View>
            </Pressable>
          )}

          {/* Bronnen */}
          {story.sources && story.sources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Bronnen</Text>
              {story.sources.map((src, i) => (
                <View key={i} style={styles.sourceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sourceTitle}>{src.label}</Text>
                    <Text style={styles.sourceSub}>{src.sub}</Text>
                  </View>
                  <IIcon
                    name="extern"
                    size={16}
                    color={colors.ink}
                    strokeWidth={2}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Wat kan jij doen? */}
          {story.actions && story.actions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Wat kan jij doen?</Text>
              {story.actions.map((action, i) => {
                const active = activeAction === i;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setActiveAction(active ? null : i)}
                    style={[styles.actionRow, active && styles.actionRowActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>{action.label}</Text>
                      <Text style={styles.actionSub}>{action.sub}</Text>
                    </View>
                    <View style={styles.actionArrow}>
                      <IIcon
                        name={active ? "check" : "arrow"}
                        size={15}
                        color={colors.cream}
                        strokeWidth={2.2}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.thinDivider} />
        </View>

        {/* Embedded feed — onLayout geeft Y-positie voor inFeed-detectie */}
        <View onLayout={onFeedSectionLayout}>
          <FeedScreen
            embedded
            cat={feedCat}
            onCatChange={onCatChange}
            excludeId={story.id}
            onOpen={(s) => {
              onSwapStory?.(s);
            }}
            onNav={onNav}
            onSearch={onSearch}
            onProfile={onProfile}
            activeTab={activeTab}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BottomNav verschijnt zodra embedded feed in beeld is */}
      <MotiView
        animate={{ opacity: inFeed ? 1 : 0 }}
        transition={{ type: "timing", duration: 250 }}
        style={styles.bottomNavOverlay}
      >
        <BottomNav active={activeTab} onChange={onNav} onSearch={onSearch} />
      </MotiView>
    </MotiView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
    backgroundColor: colors.cream,
  },

  bottomNavOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Header
  header: {
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,17,26,0.08)",
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    minHeight: 44,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCircleBtn: {
    borderRadius: 18,
    backgroundColor: "rgba(15,17,26,0.08)",
  },

  // Scroll
  scroll: {
    flex: 1,
  },

  // Hero
  hero: {
    aspectRatio: 4 / 3.4,
    width: "100%",
    backgroundColor: colors.ink,
  },
  heroRail: {
    position: "absolute",
    right: 14,
    bottom: 14,
  },

  // Body
  body: {
    padding: 22,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.header,
    fontSize: 44,
    lineHeight: 44 * 0.95,
    letterSpacing: 0.44,
    color: colors.ink,
    marginBottom: 10,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: surfaces.muted,
    marginBottom: 18,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15.5,
    lineHeight: 15.5 * 1.6,
    color: colors.ink,
    marginBottom: 16,
  },
  para: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.6,
    color: "rgba(15,17,26,0.85)",
    marginBottom: 14,
  },

  // Section divider
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(15,17,26,0.18)",
  },
  dividerLabel: {
    fontFamily: fonts.display,
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: surfaces.muted,
  },

  // Poll
  pollCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.creamWarm,
    marginBottom: 18,
    gap: 10,
  },
  pollTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  pollQ: {
    fontFamily: fonts.display,
    fontWeight: "600",
    fontSize: 13,
    color: colors.ink,
    lineHeight: 13 * 1.25,
  },
  pollHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: surfaces.muted,
    marginTop: 2,
  },
  peilLabel: {
    fontFamily: fonts.display,
    fontSize: 10,
    letterSpacing: 2,
    color: surfaces.muted,
    fontWeight: "600",
    flexShrink: 0,
  },
  pollOptions: {
    gap: 8,
  },
  pollOpt: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.cream,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: "rgba(15,17,26,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    overflow: "hidden",
  },
  pollBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  pollDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(15,17,26,0.20)",
    flexShrink: 0,
  },
  pollOptLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  pollPct: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: "600",
    color: surfaces.muted,
  },
  pollVoters: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: surfaces.muted,
    textAlign: "right",
  },

  // Divider
  thinDivider: {
    height: 1,
    backgroundColor: "rgba(15,17,26,0.10)",
    marginBottom: 18,
  },

  // Meme
  memeCard: {
    flexDirection: "row",
    gap: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.creamWarm,
    marginBottom: 18,
  },
  memeThumbnail: {
    width: 110,
    height: 110,
    borderRadius: 10,
    flexShrink: 0,
  },
  memeBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  memeTitle: {
    fontFamily: fonts.display,
    fontWeight: "600",
    fontSize: 15,
    color: colors.ink,
    lineHeight: 15 * 1.25,
    marginBottom: 4,
  },
  memeSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: surfaces.muted,
  },
  memeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.red,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  memeBtnLabel: {
    fontFamily: fonts.display,
    fontWeight: "600",
    fontSize: 13,
    color: colors.cream,
  },

  // Sections (Bronnen / Acties)
  section: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontFamily: fonts.header,
    fontSize: 22,
    letterSpacing: 0.06 * 22,
    textTransform: "uppercase",
    color: colors.blueDark,
    marginBottom: 10,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.creamWarm,
    marginBottom: 8,
  },
  sourceTitle: {
    fontFamily: fonts.display,
    fontWeight: "600",
    fontSize: 13,
    color: colors.ink,
  },
  sourceSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: surfaces.muted,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: colors.creamWarm,
    marginBottom: 8,
    gap: 10,
  },
  actionRowActive: {
    transform: [{ scale: 0.98 }],
  },
  actionTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 14 * 1.2,
  },
  actionSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: surfaces.muted,
    marginTop: 2,
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
