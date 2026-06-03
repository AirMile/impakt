import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IIcon } from "../components/Icons";
import { AppHeader } from "../components/AppHeader";
import { colors, fonts } from "../theme/tokens";
import { addTag as addTagFn, removeTag as removeTagFn } from "../lib/tagCrud";
import { slideInRight, fadeUp } from "../theme/animations";

// ─── ProfileRow ───────────────────────────────────────────────

function ProfileRow({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <IIcon name="chev" size={18} strokeWidth={2} color={colors.ink} />
    </Pressable>
  );
}

// ─── Section heading ──────────────────────────────────────────

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// ─── ProfileScreen ────────────────────────────────────────────

export function ProfileScreen({ user, onClose, onLogout }) {
  const insets = useSafeAreaInsets();
  const [tags, setTags] = useState(["Sport", "School", "Politiek"]);
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const inputRef = useRef(null);

  const name = user?.name ?? "John news";

  const addTag = () => {
    setTags((ts) => addTagFn(ts, newTag));
    setNewTag("");
    setAddingTag(false);
  };

  const removeTag = (t) => setTags((ts) => removeTagFn(ts, t));

  return (
    <MotiView
      {...slideInRight}
      style={[StyleSheet.absoluteFillObject, styles.screen]}
    >
      <AppHeader showBack onBack={onClose} onProfile={() => {}} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + naam */}
        <MotiView {...fadeUp} style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <IIcon name="user" size={48} strokeWidth={1.8} color={colors.ink} />
            <Pressable
              style={styles.editBadge}
              accessibilityLabel="Foto wijzigen"
            >
              <IIcon
                name="plus"
                size={14}
                strokeWidth={2.4}
                color={colors.cream}
              />
            </Pressable>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userMeta}>
            Lid sinds maart 2026 · 142 artikelen gelezen
          </Text>
        </MotiView>

        {/* Tags */}
        <SectionTitle>Tags</SectionTitle>
        <View style={styles.tagsBox}>
          {tags.map((t) => (
            <View key={t} style={styles.tagChip}>
              <Text style={styles.tagChipLabel}>{t}</Text>
              <Pressable
                onPress={() => removeTag(t)}
                hitSlop={8}
                accessibilityLabel={`Verwijder ${t}`}
              >
                <IIcon
                  name="close"
                  size={12}
                  strokeWidth={2.4}
                  color="rgba(15,17,26,0.6)"
                />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.addTagRow}>
          {addingTag ? (
            <View style={styles.addTagInput}>
              <TextInput
                ref={inputRef}
                style={styles.addTagField}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Nieuw thema"
                placeholderTextColor="rgba(15,17,26,0.4)"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={addTag}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <Pressable onPress={addTag} style={styles.addTagConfirm}>
                <IIcon
                  name="check"
                  size={14}
                  strokeWidth={2.4}
                  color={colors.ink}
                />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setAddingTag(true)}
              style={styles.addTagBtn}
            >
              <IIcon
                name="plus"
                size={14}
                strokeWidth={2.4}
                color={colors.ink}
              />
              <Text style={styles.addTagBtnLabel}>Tag toevoegen</Text>
            </Pressable>
          )}
        </View>

        {/* Opgeslagen artikelen */}
        <SectionTitle>Opgeslagen artikelen</SectionTitle>
        <ProfileRow label="3 artikelen opgeslagen" />

        {/* Opgeslagen memes */}
        <SectionTitle>Opgeslagen nieuws memes</SectionTitle>
        <ProfileRow label="67 memes opgeslagen" />

        {/* Hulp */}
        <SectionTitle>Hulp</SectionTitle>
        <ProfileRow label="Info" />
        <View style={{ height: 10 }} />
        <ProfileRow label="Contact" />

        {/* Uitloggen */}
        <View style={styles.logoutRow}>
          <Pressable onPress={onLogout} style={styles.logoutBtn}>
            <IIcon name="logout" size={18} strokeWidth={2} color={colors.ink} />
            <Text style={styles.logoutLabel}>Uitloggen</Text>
          </Pressable>
        </View>
      </ScrollView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.cream,
    zIndex: 90,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 8,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    paddingVertical: 18,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: colors.blue,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 30,
    height: 30,
    borderRadius: 9999,
    backgroundColor: colors.red,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    marginTop: 14,
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: "600",
    color: colors.ink,
  },
  userMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(15,17,26,0.55)",
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 24,
    marginBottom: 10,
    lineHeight: 24,
  },

  // Tags
  tagsBox: {
    backgroundColor: "rgba(15,17,26,0.08)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  tagChipLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 12.5,
    color: colors.ink,
  },
  addTagRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  addTagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  addTagBtnLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 12.5,
    color: colors.ink,
  },
  addTagInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    paddingVertical: 4,
    paddingLeft: 14,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  addTagField: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    width: 110,
    padding: 0,
  },
  addTagConfirm: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: colors.blue,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(15,17,26,0.08)",
  },
  rowLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 14,
    color: colors.ink,
  },

  // Logout
  logoutRow: {
    marginTop: 30,
    alignItems: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
    backgroundColor: "transparent",
  },
  logoutLabel: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.ink,
  },
});
