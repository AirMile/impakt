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
        style={styles.memeThumbImg}
        resizeMode="cover"
      />
    </Pressable>
  );
}

// mode bepaalt of dit het scherm voor bewaarde artikelen of memes is. Beide delen
// de header/scroll-structuur; alleen titel, lege staat en inhoud verschillen.
export function SavedScreen({
  mode = "articles",
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
  const isMemes = mode === "memes";
  const isEmpty = isMemes
    ? savedMemes.length === 0
    : savedArticles.length === 0;
  const title = isMemes ? "Bewaarde memes" : "Bewaarde artikelen";
  const emptyText = isMemes
    ? "Je hebt nog geen memes bewaard."
    : "Je hebt nog geen artikelen bewaard.";

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
        <Text style={styles.title}>{title}</Text>
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
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        ) : isMemes ? (
          <View style={styles.memeSection}>
            <View style={styles.memeGrid}>
              {savedMemes.map((meme) => (
                <MemeThumb key={meme.id} meme={meme} onOpenMeme={onOpenMeme} />
              ))}
            </View>
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
              savedIds={savedIds}
              onSavedChange={onSavedChange}
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
  memeSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
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
  // Flow-kind dat de aspectRatio-container vult. Een absoluut gepositioneerde
  // afbeelding (absoluteFillObject) krijgt hier geen hoogte omdat de ouder zijn
  // hoogte alleen uit aspectRatio afleidt — dan blijft de thumbnail leeg.
  memeThumbImg: {
    width: "100%",
    height: "100%",
  },
});
