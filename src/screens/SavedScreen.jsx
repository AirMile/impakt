import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { IIcon } from "../components/Icons";
import { FeedCard } from "./FeedScreen";
import { colors, fonts } from "../theme/tokens";
import { slideUpScreen } from "../theme/animations";

function MemeThumb({ meme, onOpenMeme }) {
  return (
    <Pressable
      onPress={() => onOpenMeme?.(meme.storyId)}
      style={styles.memeThumb}
      accessibilityLabel={`Open meme: ${meme.top ?? ""}`}
    >
      <Image
        source={{ uri: meme.img }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
    </Pressable>
  );
}

export function SavedScreen({
  savedArticles = [],
  savedMemes = [],
  onClose,
  onOpen,
  onOpenMeme,
  onRequireAuth,
  token,
  savedIds,
  onSavedChange,
}) {
  const insets = useSafeAreaInsets();
  const isEmpty = savedArticles.length === 0 && savedMemes.length === 0;

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
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Je hebt nog niets bewaard.</Text>
          </View>
        ) : (
          <>
            {savedArticles.map((story) => (
              <FeedCard
                key={story.id}
                story={story}
                onOpen={onOpen}
                variant="compact"
                onRequireAuth={onRequireAuth}
                token={token}
                savedIds={savedIds}
                onSavedChange={onSavedChange}
              />
            ))}

            {savedMemes.length > 0 && (
              <View style={styles.memeSection}>
                <Text style={styles.sectionLabel}>Memes</Text>
                <View style={styles.memeGrid}>
                  {savedMemes.map((meme) => (
                    <MemeThumb
                      key={meme.id}
                      meme={meme}
                      onOpenMeme={onOpenMeme}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
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
  memeSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 10,
  },
  memeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  memeThumb: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(15,17,26,0.08)",
  },
});
