import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  BackHandler,
  InteractionManager,
  Linking,
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
import { pressFx } from "../lib/pressFeedback";
import { slideUpScreen } from "../theme/animations";
import { shareStory } from "../lib/share";
import { useSaveArticle } from "../hooks/useSaveArticle";
import { useArticleReaction } from "../hooks/useArticleReactions";
import { reactionPct } from "../lib/reactionPct";
import { toast } from "../lib/toast";
import { fetchSources } from "../lib/sources";
import { sumVotes, votePct } from "../lib/pollPct";
import { isInFeed } from "../lib/isInFeed";
import { getRelatedMemes } from "../lib/getRelatedMemes";
import {
  fetchPollForArticle,
  fetchPollResults,
  submitPollVote,
} from "../lib/polls";
import { getPollVote, setPollVote } from "../storage/prefs";

function clampPollPct(value) {
  const pct = Math.round(Number(value));
  if (!Number.isFinite(pct)) return 0;
  return Math.max(0, Math.min(100, pct));
}

function pollBarFillStyle(pct) {
  return pct >= 100 ? { right: 0 } : { width: `${pct}%` };
}

export function DetailScreen({
  story,
  memes = [],
  onClose,
  onOpenMeme,
  onSwapStory,
  feedCat,
  onCatChange,
  onNav,
  onProfile,
  onSearch,
  myTags = [],
  onMyTagsChange,
  sourceTab = "feed",
  token,
  savedIds,
  onSavedChange,
  onRequireAuth,
  user,
}) {
  const insets = useSafeAreaInsets();
  // Reactie-state komt uit de gedeelde store, zodat detail en feed dezelfde
  // counts/eigen stem tonen. De stem-logica zelf leeft in de provider.
  const { reaction, counts, react } = useArticleReaction(story);
  const { saved, toggleSaved } = useSaveArticle({
    story,
    token,
    savedIds,
    onSavedChange,
    onRequireAuth,
  });
  const [poll, setPoll] = useState(story.poll ?? null);
  const [pollChoice, setPollChoice] = useState(null);
  const [pollSubmitting, setPollSubmitting] = useState(false);
  const [inFeed, setInFeed] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [sources, setSources] = useState(story.sources ?? []);
  const feedYRef = useRef(Infinity);
  const previousStoryIdRef = useRef(story.id);

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setShowRelated(true);
    });
    return () => handle.cancel();
  }, []);

  useEffect(() => {
    const sameStory = String(previousStoryIdRef.current) === String(story.id);
    previousStoryIdRef.current = story.id;
    setPoll((current) =>
      sameStory ? (story.poll ?? current) : (story.poll ?? null)
    );
    if (!sameStory) setPollChoice(null);
  }, [story.id, story.poll]);

  useEffect(() => {
    let cancelled = false;
    fetchPollForArticle(token, story)
      .then((nextPoll) => {
        if (!cancelled && nextPoll) setPoll(nextPoll);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, story]);

  useEffect(() => {
    if (user?.id == null || poll?.id == null) return;
    let cancelled = false;
    getPollVote(user.id, poll.id)
      .then((optionId) => {
        if (!cancelled && optionId != null) setPollChoice(optionId);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id, poll?.id]);

  // Bronnen komen niet mee in de feed-lijst; apart ophalen bij open.
  useEffect(() => {
    let cancelled = false;
    fetchSources(story.id)
      .then((list) => {
        if (!cancelled) setSources(list);
      })
      .catch(() => {
        if (!cancelled) setSources([]);
      });
    return () => {
      cancelled = true;
    };
  }, [story.id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose?.();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const relatedMemes = getRelatedMemes(memes, story.id);
  const firstMeme = relatedMemes[0];
  const canInteract = () => onRequireAuth?.() !== false;
  const isHappyContext = sourceTab === "good";
  const embeddedFeedActiveTab = isHappyContext ? "good" : "feed";
  const publishedMeta = [story.date, story.time].filter(Boolean).join(" - ");
  const storySub = String(story.sub ?? "").trim();
  const isSamePollOption = (a, b) =>
    a != null && b != null && String(a) === String(b);
  const isAlreadyVotedError = (err) => {
    const message = String(err?.message ?? "").toLowerCase();
    return (
      message.includes("already") ||
      message.includes("al gestemd") ||
      message.includes("heeft gestemd") ||
      message.includes("has voted")
    );
  };

  const castPollVote = async (optionId) => {
    if (!canInteract()) return;
    if (
      !token ||
      !poll ||
      pollSubmitting ||
      isSamePollOption(pollChoice, optionId)
    )
      return;

    const prevChoice = pollChoice;
    const prevPoll = poll;
    const optimisticPoll = {
      ...poll,
      options: poll.options.map((opt) => {
        const wasMine = isSamePollOption(opt.id, prevChoice);
        const isMine = isSamePollOption(opt.id, optionId);
        return {
          ...opt,
          votes: Math.max(0, opt.votes + (isMine ? 1 : 0) - (wasMine ? 1 : 0)),
        };
      }),
    };

    setPollSubmitting(true);
    setPollChoice(optionId);
    setPoll(optimisticPoll);

    try {
      await submitPollVote(token, {
        pollId: poll.id,
        userId: user?.id,
        optionId,
      });
      await setPollVote(user?.id, poll.id, optionId).catch(() => {});
      const freshPoll = await fetchPollResults(token, poll.id, poll).catch(
        () => null
      );
      const optimisticOption = optimisticPoll.options.find((opt) =>
        isSamePollOption(opt.id, optionId)
      );
      const freshOption = freshPoll?.options?.find((opt) =>
        isSamePollOption(opt.id, optionId)
      );
      const freshIncludesVote =
        freshPoll &&
        sumVotes(freshPoll.options) > 0 &&
        (freshOption?.votes ?? 0) >= (optimisticOption?.votes ?? 0);

      setPoll(freshIncludesVote ? freshPoll : optimisticPoll);
    } catch (err) {
      if (isAlreadyVotedError(err)) {
        await setPollVote(user?.id, poll.id, optionId).catch(() => {});
        const freshPoll = await fetchPollResults(token, poll.id, poll).catch(
          () => null
        );
        setPoll(
          freshPoll && sumVotes(freshPoll.options) > 0
            ? freshPoll
            : optimisticPoll
        );
        return;
      }
      setPollChoice(prevChoice);
      setPoll(prevPoll);
      toast.show(err.message || "Stem opslaan mislukt.");
    } finally {
      setPollSubmitting(false);
    }
  };

  const showPollResults = pollChoice != null;
  const displayedPollOptions = poll
    ? poll.options.map((opt) => {
        const isMine = isSamePollOption(opt.id, pollChoice);
        const shouldIncludeStoredVote =
          showPollResults && isMine && opt.votes === 0;
        return {
          ...opt,
          votes: opt.votes + (shouldIncludeStoredVote ? 1 : 0),
        };
      })
    : [];
  const totalVotes = sumVotes(displayedPollOptions);

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

  const openSource = async (src) => {
    const url = src?.url || src?.sub;
    if (!url || !/^https?:\/\//i.test(url)) {
      toast.show("Geen geldige bronlink gevonden.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        toast.show("Deze bron kan niet worden geopend.");
        return;
      }
      await Linking.openURL(url);
    } catch {
      toast.show("Bron openen mislukt.");
    }
  };

  const openAction = async (action) => {
    const url = action?.url;
    if (!url || !/^https?:\/\//i.test(url)) {
      toast.show("Geen geldige actielink gevonden.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        toast.show("Deze actielink kan niet worden geopend.");
        return;
      }
      await Linking.openURL(url);
    } catch {
      toast.show("Actielink openen mislukt.");
    }
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
            unstable_pressDelay={0}
            style={({ pressed }) => [
              styles.headerIconBtn,
              pressFx({ scale: 0.88, opacity: 0.55 })({ pressed }),
            ]}
            accessibilityLabel="Terug"
          >
            <IIcon name="arrowL" size={26} color={colors.ink} strokeWidth={2} />
          </Pressable>
          <ImpaktLogo size={26} dark />
          <Pressable
            onPress={() => {
              if (!canInteract()) return;
              shareStory(story);
            }}
            unstable_pressDelay={0}
            style={({ pressed }) => [
              styles.headerIconBtn,
              styles.headerCircleBtn,
              pressFx({ scale: 0.88, opacity: 0.55 })({ pressed }),
            ]}
            accessibilityLabel="Delen"
          >
            <IIcon
              name="share"
              size={18}
              color={colors.ink}
              strokeWidth={1.8}
            />
          </Pressable>
        </MotiView>

        {/* Feed header: spacer + logo + profile, absolute overlay */}
        <MotiView
          animate={{ opacity: inFeed ? 1 : 0 }}
          transition={{ type: "timing", duration: 250 }}
          pointerEvents={inFeed ? "auto" : "none"}
          style={[StyleSheet.absoluteFillObject, styles.headerRow]}
        >
          <View style={styles.headerIconBtn} />
          <ImpaktLogo size={26} dark />
          <Pressable
            onPress={onProfile}
            unstable_pressDelay={0}
            style={({ pressed }) => [
              styles.headerIconBtn,
              styles.headerCircleBtn,
              pressFx({ scale: 0.88, opacity: 0.55 })({ pressed }),
            ]}
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
              onReact={react}
              reactions={reactionPct(counts)}
              saved={saved}
              onSave={toggleSaved}
              light
            />
          </View>
        </View>

        {/* Article body */}
        <View style={styles.body}>
          <Text style={styles.title}>{story.title}</Text>

          <View style={styles.metaRow}>
            {publishedMeta ? (
              <Text style={styles.metaText}>{publishedMeta}</Text>
            ) : null}
            {publishedMeta && story.views ? (
              <Text style={styles.metaDot}>{"\u00B7"}</Text>
            ) : null}
            {story.views ? (
              <View style={styles.viewsMeta}>
                <Text style={styles.metaText}>{story.views}</Text>
                <IIcon
                  name="eye"
                  size={14}
                  color={surfaces.muted}
                  strokeWidth={2}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.metaDivider} />

          {storySub ? <Text style={styles.sub}>{storySub}</Text> : null}

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
          {poll && (
            <View style={styles.pollCard}>
              <View style={styles.pollTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pollQ}>{poll.q}</Text>
                  <Text style={styles.pollHint}>
                    Stem en zie wat anderen kiezen.
                  </Text>
                </View>
                <Text style={styles.peilLabel}>PEILING</Text>
              </View>

              <View style={styles.pollOptions}>
                {displayedPollOptions.map((opt) => {
                  const pct =
                    opt.percentage != null
                      ? clampPollPct(opt.percentage)
                      : votePct(opt.votes, totalVotes);
                  const isMine = isSamePollOption(pollChoice, opt.id);
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => castPollVote(opt.id)}
                      disabled={pollSubmitting || showPollResults}
                      style={[
                        styles.pollOpt,
                        pollSubmitting && styles.pollOptDisabled,
                      ]}
                    >
                      {showPollResults && (
                        <View
                          testID={`poll-bar-${opt.id}`}
                          style={[
                            styles.pollBar,
                            pollBarFillStyle(pct),
                            {
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
                      {showPollResults && (
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

              {showPollResults && totalVotes > 0 && (
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
              onPress={() => onOpenMeme?.(firstMeme.id, story.id)}
              unstable_pressDelay={0}
              style={({ pressed }) => [
                styles.memeCard,
                pressFx({ scale: 0.98 })({ pressed }),
              ]}
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
          {sources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Bronnen</Text>
              {sources.map((src, i) => (
                <Pressable
                  key={i}
                  onPress={() => openSource(src)}
                  unstable_pressDelay={0}
                  style={({ pressed }) => [
                    styles.sourceRow,
                    pressFx({ scale: 0.98 })({ pressed }),
                  ]}
                  accessibilityRole="link"
                  accessibilityLabel={`Open bron ${src.label || src.sub}`}
                >
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
                </Pressable>
              ))}
            </View>
          )}

          {/* Wat kan jij doen? */}
          {story.actions && story.actions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Wat kan jij doen?</Text>
              {story.actions.map((action, i) => {
                const hasUrl = /^https?:\/\//i.test(action?.url ?? "");
                return (
                  <Pressable
                    key={i}
                    onPress={hasUrl ? () => openAction(action) : undefined}
                    disabled={!hasUrl}
                    unstable_pressDelay={0}
                    style={({ pressed }) => [
                      styles.actionRow,
                      !hasUrl && styles.actionRowStatic,
                      hasUrl && pressFx({ scale: 0.98 })({ pressed }),
                    ]}
                    accessibilityRole={hasUrl ? "link" : undefined}
                    accessibilityLabel={
                      hasUrl ? `Open actie ${action.label}` : action.label
                    }
                  >
                    <View style={styles.actionContent}>
                      <Text style={styles.actionTitle}>{action.label}</Text>
                      {action.sub ? (
                        <Text style={styles.actionSub}>{action.sub}</Text>
                      ) : null}
                    </View>
                    {hasUrl && (
                      <View style={styles.actionArrow}>
                        <IIcon
                          name="arrow"
                          size={15}
                          color={colors.cream}
                          strokeWidth={2.2}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.thinDivider} />
        </View>

        {/* Embedded feed: onLayout geeft Y-positie voor inFeed-detectie */}
        <View onLayout={onFeedSectionLayout} style={styles.relatedPlaceholder}>
          {showRelated && (
            <FeedScreen
              embedded
              cat={feedCat}
              onCatChange={onCatChange}
              excludeId={story.id}
              goodNewsOnly={isHappyContext}
              onOpen={(s) => {
                onSwapStory?.(s);
              }}
              onNav={onNav}
              onSearch={onSearch}
              onProfile={onProfile}
              activeTab={embeddedFeedActiveTab}
              myTags={myTags}
              onMyTagsChange={onMyTagsChange}
              onRequireAuth={onRequireAuth}
              token={token}
              savedIds={savedIds}
              onSavedChange={onSavedChange}
            />
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BottomNav verschijnt zodra embedded feed in beeld is */}
      <MotiView
        animate={{ opacity: inFeed ? 1 : 0 }}
        transition={{ type: "timing", duration: 250 }}
        style={styles.bottomNavOverlay}
      >
        <BottomNav
          active={embeddedFeedActiveTab}
          onChange={onNav}
          onSearch={onSearch}
        />
      </MotiView>
    </MotiView>
  );
}

// Styles

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

  relatedPlaceholder: {
    minHeight: 600,
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 20,
  },
  metaDivider: {
    height: 1,
    backgroundColor: "rgba(15,17,26,0.12)",
    marginBottom: 20,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: surfaces.muted,
  },
  metaDot: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: surfaces.textFaint,
  },
  viewsMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    paddingTop: 13,
    borderRadius: 13,
    backgroundColor: "#E9E2D7",
    marginBottom: 18,
    gap: 12,
  },
  pollTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  pollQ: {
    fontFamily: fonts.display,
    fontWeight: "700",
    fontSize: 13,
    color: colors.ink,
    lineHeight: 13 * 1.16,
  },
  pollHint: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: "rgba(15,17,26,0.48)",
    marginTop: 3,
  },
  peilLabel: {
    fontFamily: fonts.display,
    fontSize: 9,
    letterSpacing: 2.2,
    color: "rgba(15,17,26,0.52)",
    fontWeight: "700",
    flexShrink: 0,
    marginTop: 1,
  },
  pollOptions: {
    gap: 9,
  },
  pollOpt: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minHeight: 44,
    backgroundColor: "#F0ECE4",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.10)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    overflow: "hidden",
  },
  pollOptDisabled: {
    opacity: 0.72,
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
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.ink,
  },
  pollPct: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(15,17,26,0.58)",
  },
  pollVoters: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: "rgba(15,17,26,0.50)",
    textAlign: "right",
    marginTop: -2,
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
    minHeight: 56,
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: colors.creamWarm,
    marginBottom: 8,
    gap: 12,
  },
  actionRowStatic: {
    paddingRight: 18,
  },
  actionContent: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 17,
  },
  actionSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: surfaces.muted,
    marginTop: 3,
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
