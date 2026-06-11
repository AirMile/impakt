import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { IIcon } from "../components/Icons";
import { FeedCard } from "./FeedScreen";
import { colors, fonts } from "../theme/tokens";
import { slideUpScreen } from "../theme/animations";

export function SavedScreen({
  savedArticles = [],
  onClose,
  onOpen,
  onRequireAuth,
  token,
}) {
  const insets = useSafeAreaInsets();

  return (
    <MotiView
      {...slideUpScreen}
      style={[StyleSheet.absoluteFillObject, styles.screen]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={onClose}
          style={styles.backBtn}
          accessibilityLabel="Terug"
        >
          <IIcon name="arrowL" size={24} strokeWidth={2} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Bewaard</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {savedArticles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Je hebt nog geen artikelen bewaard.
            </Text>
          </View>
        ) : (
          savedArticles.map((story) => (
            <FeedCard
              key={story.id}
              story={story}
              onOpen={onOpen}
              variant="compact"
              onRequireAuth={onRequireAuth}
              token={token}
            />
          ))
        )}
      </ScrollView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.cream,
    zIndex: 90,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: colors.cream,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  scrollContent: {
    paddingTop: 4,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "rgba(15,17,26,0.55)",
    textAlign: "center",
  },
});
