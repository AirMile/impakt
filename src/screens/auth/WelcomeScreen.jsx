import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { IIcon } from "../../components/Icons";
import { ImpaktLogo } from "../../components/ImpaktLogo";
import { Btn } from "../../components/Btn";
import { colors, fonts } from "../../theme/tokens";
import { fadeUp } from "../../theme/animations";

export function WelcomeScreen({ onLogin, onRegister, onSkip }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={["#F2EEE8", "#EFEBE6", "#E6E0D6"]}
      style={styles.screen}
    >
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <MotiView {...fadeUp} delay={0} style={styles.accentLine} />

        <MotiView {...fadeUp} delay={80} style={styles.logo}>
          <ImpaktLogo size={88} dark />
        </MotiView>

        <MotiView {...fadeUp} delay={160}>
          <Text style={styles.tagline}>Het nieuws beter verpakt.</Text>
          <Text style={styles.sub}>
            Lees verder dan de headline. Snap het. Doe er iets mee. Lach erom.
          </Text>
        </MotiView>

        <MotiView {...fadeUp} delay={240} style={styles.featureChips}>
          {[
            { icon: "bookmark", label: "Nieuws in context" },
            { icon: "smile", label: "Met humor" },
            { icon: "arrow", label: "Doe er iets mee" },
          ].map(({ icon, label }) => (
            <View key={label} style={styles.featureChip}>
              <IIcon name={icon} size={14} strokeWidth={2} color={colors.ink} />
              <Text style={styles.featureChipLabel}>{label}</Text>
            </View>
          ))}
        </MotiView>

        <MotiView {...fadeUp} delay={320} style={styles.ctaStack}>
          <Btn variant="dark" onPress={onRegister} iconRight="arrow">
            Account maken
          </Btn>
          <Btn variant="cream" onPress={onLogin}>
            Inloggen
          </Btn>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>of</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipLabel}>Verder zonder account </Text>
            <IIcon
              name="arrow"
              size={14}
              strokeWidth={2.2}
              color={colors.ink}
            />
          </Pressable>
        </MotiView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  accentLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.ink,
    marginBottom: 20,
  },
  logo: { marginBottom: 20 },
  tagline: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    color: colors.ink,
    fontWeight: "600",
    maxWidth: 280,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(15,17,26,0.65)",
    maxWidth: 280,
    marginTop: 10,
  },
  featureChips: { marginTop: 24, gap: 8 },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.creamWarm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.06)",
  },
  featureChipLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  ctaStack: { marginTop: 30, gap: 12 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(15,17,26,0.18)" },
  dividerLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(15,17,26,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  skipLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    textDecorationLine: "underline",
  },
});
