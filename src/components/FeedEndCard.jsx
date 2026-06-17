import { View, Text, Pressable, StyleSheet } from "react-native";
import { MotiView } from "moti";

import { IIcon } from "./Icons";
import { colors, fonts, surfaces, spacing } from "../theme/tokens";
import { fadeUp } from "../theme/animations";
import { pressFx } from "../lib/pressFeedback";

// Gedeelde afsluitkaart onder de scroll-feeds (nieuws/happy/zoek). Markeert het
// einde van de lijst i.p.v. een onzichtbare spacer. Animeert in met fadeUp
// zodra hij in beeld scrollt; de "Terug naar boven"-knop verschijnt alleen als
// het scherm een onBackToTop-callback meegeeft (ScrollView/FlatList-ref).
export function FeedEndCard({
  title = "Je bent helemaal bij",
  subtitle,
  onBackToTop,
  actionLabel = "Terug naar boven",
}) {
  return (
    <MotiView {...fadeUp} style={styles.wrapper}>
      <View style={styles.markRow}>
        <View style={styles.line} />
        <IIcon
          name="sparkle"
          size={18}
          color={surfaces.muted}
          strokeWidth={2}
        />
        <View style={styles.line} />
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {onBackToTop ? (
        <Pressable
          onPress={onBackToTop}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.button, pressFx()({ pressed })]}
        >
          <View style={styles.chevUp}>
            <IIcon
              name="chevDown"
              size={16}
              color={colors.ink}
              strokeWidth={2.4}
            />
          </View>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 12,
  },
  markRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  line: {
    flex: 1,
    maxWidth: 64,
    height: 1,
    backgroundColor: surfaces.line,
  },
  title: {
    fontFamily: fonts.header,
    fontSize: 30,
    letterSpacing: 0.4,
    color: colors.ink,
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: surfaces.muted,
    textAlign: "center",
    marginTop: -4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9999,
    backgroundColor: colors.blue,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  chevUp: {
    transform: [{ rotate: "180deg" }],
  },
  buttonLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
});
