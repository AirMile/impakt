import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import {
  ReactionLabeled,
  ReactionFilled,
  ReactionEmoji,
  ReactionStance,
} from "../components/sandbox/ReactionVariants";
import { HeroOverlay } from "../components/HeroOverlay";
import storiesData from "../api/mock/stories.json";
import { colors, fonts, surfaces } from "../theme/tokens";

// Vier stories met spreiding in reactie-verdeling (dev-only sandbox)
const SANDBOX_STORIES = [0, 1, 2, 3].map((i) => storiesData.stories?.[i]);

const VARIANTS = [
  {
    label: "V1 — Groter + label",
    hint: "Huidige icons, maar groter (52px) met tekstlabel",
    Component: ReactionLabeled,
  },
  {
    label: "V2 — Gevulde smileys",
    hint: "Kleur-gevulde bollen, witte ogen/mond",
    Component: ReactionFilled,
  },
  {
    label: "V3 — Native emoji",
    hint: "😊 😐 ☹️ als platte tekst — nul-meting",
    Component: ReactionEmoji,
  },
  {
    label: "V4 — Mening-framing",
    hint: "Duim-omhoog / ? / duim-omlaag + label",
    Component: ReactionStance,
  },
];

function MockFeedCard({ story, children }) {
  const { width } = useWindowDimensions();
  const CARD_W = width - 36;
  const aspectH = CARD_W * (4.3 / 4);

  return (
    <View style={[s.card, { height: aspectH }]}>
      <Image
        source={{ uri: story.img }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <HeroOverlay variant="card" />
      <View style={s.titleArea}>
        <Text style={s.cardTitle} numberOfLines={3}>
          {story.title}
        </Text>
      </View>
      <View style={s.railArea} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

function VariantSection({
  label,
  hint,
  story,
  reaction,
  onReact,
  onReset,
  Component,
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View>
          <Text style={s.sectionLabel}>{label}</Text>
          <Text style={s.sectionHint}>{hint}</Text>
        </View>
        <Pressable onPress={onReset} style={s.resetBtn}>
          <Text style={s.resetText}>Reset</Text>
        </Pressable>
      </View>
      <MockFeedCard story={story}>
        <Component
          reaction={reaction}
          onReact={onReact}
          reactions={story.reactions}
          vertical
          light
        />
      </MockFeedCard>
    </View>
  );
}

export function SandboxReactionsScreen() {
  const [reactions, setReactions] = useState([null, null, null, null]);

  const setReaction = (i, key) =>
    setReactions((prev) => prev.map((v, idx) => (idx === i ? key : v)));

  const resetReaction = (i) =>
    setReactions((prev) => prev.map((v, idx) => (idx === i ? null : v)));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.headline}>Reactie{"\n"}Varianten</Text>
        <Text style={s.sub}>
          Tap een reactie op de card · Reset om opnieuw te proberen
        </Text>

        {VARIANTS.map(({ label, hint, Component }, i) => (
          <VariantSection
            key={label}
            label={label}
            hint={hint}
            story={SANDBOX_STORIES[i]}
            reaction={reactions[i]}
            onReact={(key) => setReaction(i, key)}
            onReset={() => resetReaction(i)}
            Component={Component}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingVertical: 24, gap: 28, paddingBottom: 60 },

  headline: {
    fontFamily: fonts.header,
    fontSize: 48,
    color: colors.ink,
    lineHeight: 52,
    marginBottom: 4,
    paddingHorizontal: 18,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.45,
    paddingHorizontal: 18,
  },

  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 18,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.ink,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.5,
    marginTop: 2,
  },
  resetBtn: {
    backgroundColor: surfaces.soft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginTop: 2,
  },
  resetText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.5,
  },

  // MockFeedCard
  card: {
    marginHorizontal: 18,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.ink,
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
    lineHeight: 34,
    color: colors.cream,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  railArea: {
    position: "absolute",
    bottom: 14,
    right: 14,
  },
});
