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
import { colors, fonts, surfaces } from "../theme/tokens";
import { addTag as addTagFn, removeTag as removeTagFn } from "../lib/tagCrud";
import { slideInRight, fadeUp } from "../theme/animations";

// ─── ProfileRow ───────────────────────────────────────────────

function ProfileRow({ icon, label, count, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <IIcon name={icon} size={18} strokeWidth={1.8} color={colors.ink} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {count != null && (
          <View style={styles.countPill}>
            <Text style={styles.countLabel}>{count}</Text>
          </View>
        )}
        <IIcon name="chev" size={18} strokeWidth={2} color={surfaces.muted} />
      </View>
    </Pressable>
  );
}

// ─── Section label ────────────────────────────────────────────

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
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
          <Text style={styles.userMeta}>Lid sinds maart 2026</Text>
        </MotiView>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>{"ARTIKELEN\nGELEZEN"}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statNumber}>67</Text>
            <Text style={styles.statLabel}>{"MEMES\nOPGESLAGEN"}</Text>
          </View>
        </View>

        {/* Tags */}
        <SectionLabel>Tags</SectionLabel>
        <View style={styles.tagsRow}>
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
                  color="rgba(15,17,26,0.5)"
                />
              </Pressable>
            </View>
          ))}
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
              style={styles.addTagChip}
            >
              <IIcon
                name="plus"
                size={12}
                strokeWidth={2.4}
                color={colors.ink}
              />
              <Text style={styles.addTagChipLabel}>Tag toevoegen</Text>
            </Pressable>
          )}
        </View>

        {/* Opgeslagen */}
        <SectionLabel>Opgeslagen</SectionLabel>
        <View style={styles.rowGroup}>
          <ProfileRow icon="bookmark" label="Artikelen" count={3} />
          <View style={styles.rowDivider} />
          <ProfileRow icon="image" label="Nieuws memes" count={67} />
        </View>

        {/* Hulp */}
        <SectionLabel>Hulp</SectionLabel>
        <View style={styles.rowGroup}>
          <ProfileRow icon="info" label="Info" />
          <View style={styles.rowDivider} />
          <ProfileRow icon="mail" label="Contact" />
        </View>

        {/* Uitloggen */}
        <View style={styles.logoutRow}>
          <Pressable onPress={onLogout} style={styles.logoutBtn}>
            <IIcon
              name="logout"
              size={16}
              strokeWidth={2}
              color={surfaces.muted}
            />
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
    paddingHorizontal: 18,
    paddingTop: 8,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
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
    fontFamily: fonts.header,
    fontSize: 34,
    lineHeight: 32,
    letterSpacing: 0.5,
    color: colors.ink,
  },
  userMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: surfaces.muted,
    marginTop: 6,
  },

  // Stats strip
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.creamWarm,
    borderRadius: 14,
    padding: 16,
  },
  statNumber: {
    fontFamily: fonts.header,
    fontSize: 36,
    lineHeight: 34,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: surfaces.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 5,
    lineHeight: 15,
  },

  // Section label
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: surfaces.muted,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginTop: 24,
    marginBottom: 10,
  },

  // Tags
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(122,207,223,0.28)",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  tagChipLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  addTagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: surfaces.lineStrong,
  },
  addTagChipLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13.5,
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
    borderColor: surfaces.border,
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
    borderColor: surfaces.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Rows
  rowGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: surfaces.border,
    overflow: "hidden",
  },
  rowDivider: {
    height: 1,
    backgroundColor: surfaces.border,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 14,
    color: colors.ink,
  },
  countPill: {
    backgroundColor: colors.creamWarm,
    borderRadius: 9999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  countLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: surfaces.muted,
  },

  // Logout
  logoutRow: {
    marginTop: 40,
    alignItems: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,
    backgroundColor: "transparent",
  },
  logoutLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: surfaces.muted,
  },
});
