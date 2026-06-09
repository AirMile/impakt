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
import {
  deleteAccount,
  logoutAccount,
  updateAccount,
} from "../lib/auth/account";
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

export function ProfileScreen({ user, onClose, onLogout, onUserUpdate }) {
  const insets = useSafeAreaInsets();
  const [tags, setTags] = useState(["Sport", "School", "Politiek"]);
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [usernameValue, setUsernameValue] = useState(user?.username ?? "");
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [emailValue, setEmailValue] = useState(user?.email ?? "");
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordConfirmValue, setPasswordConfirmValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const inputRef = useRef(null);

  const displayName = nameValue || usernameValue || "Gast";
  const hasAccountInfo = Boolean(usernameValue || nameValue || emailValue);

  const addTag = () => {
    setTags((ts) => addTagFn(ts, newTag));
    setNewTag("");
    setAddingTag(false);
  };

  const removeTag = (t) => setTags((ts) => removeTagFn(ts, t));

  const handleSaveAccount = async () => {
    if (accountLoading) return;

    const nextError = {};
    if (!usernameValue.trim()) nextError.username = "Vul je gebruikersnaam in";
    if (!emailValue.trim()) nextError.email = "Vul je e-mail in";
    else if (!emailValue.includes("@"))
      nextError.email = "Dit is geen geldig e-mailadres";
    if (!passwordValue) nextError.password = "Vul je wachtwoord in";
    else if (passwordValue.length < 6) nextError.password = "Minimaal 6 tekens";
    if (passwordConfirmValue !== passwordValue)
      nextError.passwordConfirm = "Komt niet overeen";

    if (Object.keys(nextError).length) {
      setAccountError(Object.values(nextError)[0]);
      setAccountSuccess("");
      return;
    }

    setAccountLoading(true);
    setAccountError("");
    setAccountSuccess("");

    try {
      const updatedUser = await updateAccount(user?.token, {
        username: usernameValue.trim(),
        name: nameValue.trim() || undefined,
        email: emailValue.trim(),
        password: passwordValue,
        password_confirmation: passwordConfirmValue,
      });

      onUserUpdate?.(updatedUser);
      setPasswordValue("");
      setPasswordConfirmValue("");
      setAccountSuccess("Account bijgewerkt.");
    } catch (err) {
      setAccountError(err.message || "Account bijwerken mislukt.");
    } finally {
      setAccountLoading(false);
    }
  };

  const handleLogout = async () => {
    if (logoutLoading || deleteLoading) return;
    setLogoutLoading(true);
    setLogoutError("");
    setDeleteError("");

    try {
      await logoutAccount(user?.token);
      onLogout();
    } catch (err) {
      setLogoutError(err.message || "Uitloggen mislukt. Probeer het opnieuw.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (logoutLoading || deleteLoading) return;
    setDeleteLoading(true);
    setDeleteError("");
    setLogoutError("");

    try {
      await deleteAccount(user?.token);
      onLogout();
    } catch (err) {
      setDeleteError(
        err.message || "Account verwijderen mislukt. Probeer het opnieuw."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

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
          <Text style={styles.userName}>{displayName}</Text>
          {hasAccountInfo ? (
            <View style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <Text style={styles.accountHeaderLabel}>Accountgegevens</Text>
                <IIcon
                  name="edit"
                  size={15}
                  strokeWidth={1.9}
                  color={surfaces.muted}
                  accessibilityLabel="Bewerkbaar"
                />
              </View>
              <View style={styles.accountLine}>
                <Text style={styles.accountLabel}>Gebruikersnaam</Text>
                <TextInput
                  style={styles.accountInput}
                  value={usernameValue}
                  onChangeText={setUsernameValue}
                  placeholder="Gebruikersnaam"
                  placeholderTextColor="rgba(15,17,26,0.35)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!accountLoading}
                />
              </View>
              <View style={styles.accountLine}>
                <Text style={styles.accountLabel}>Naam</Text>
                <TextInput
                  style={styles.accountInput}
                  value={nameValue}
                  onChangeText={setNameValue}
                  placeholder="Naam"
                  placeholderTextColor="rgba(15,17,26,0.35)"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!accountLoading}
                />
              </View>
              <View style={styles.accountLine}>
                <Text style={styles.accountLabel}>E-mail</Text>
                <TextInput
                  style={styles.accountInput}
                  value={emailValue}
                  onChangeText={setEmailValue}
                  placeholder="E-mail"
                  placeholderTextColor="rgba(15,17,26,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!accountLoading}
                />
              </View>
              <View style={styles.accountLine}>
                <Text style={styles.accountLabel}>Wachtwoord</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordValue}
                    onChangeText={setPasswordValue}
                    placeholder="Nieuw wachtwoord"
                    placeholderTextColor="rgba(15,17,26,0.35)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!accountLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    accessibilityLabel={
                      showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"
                    }
                  >
                    <IIcon
                      name={showPassword ? "eyeOff" : "eye"}
                      size={18}
                      strokeWidth={1.8}
                      color="rgba(15,17,26,0.6)"
                    />
                  </Pressable>
                </View>
              </View>
              <View style={styles.accountLine}>
                <Text style={styles.accountLabel}>Bevestig wachtwoord</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordConfirmValue}
                    onChangeText={setPasswordConfirmValue}
                    placeholder="Nog een keer"
                    placeholderTextColor="rgba(15,17,26,0.35)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!accountLoading}
                  />
                </View>
              </View>
              {accountError ? (
                <Text style={styles.accountError}>{accountError}</Text>
              ) : null}
              {accountSuccess ? (
                <Text style={styles.accountSuccess}>{accountSuccess}</Text>
              ) : null}
              <Pressable
                onPress={handleSaveAccount}
                disabled={accountLoading}
                style={[
                  styles.saveAccountBtn,
                  accountLoading && styles.saveAccountDisabled,
                ]}
              >
                <Text style={styles.saveAccountLabel}>
                  {accountLoading ? "Opslaan..." : "Gegevens opslaan"}
                </Text>
              </Pressable>
            </View>
          ) : null}
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
          {logoutError ? (
            <Text style={styles.logoutError}>{logoutError}</Text>
          ) : null}
          {deleteError ? (
            <Text style={styles.logoutError}>{deleteError}</Text>
          ) : null}
          <View style={styles.accountActionsRow}>
            <Pressable
              onPress={handleLogout}
              disabled={logoutLoading || deleteLoading}
              style={[
                styles.accountActionBtn,
                (logoutLoading || deleteLoading) && styles.logoutDisabled,
              ]}
            >
              <IIcon
                name="logout"
                size={16}
                strokeWidth={2}
                color={surfaces.muted}
              />
              <Text style={styles.logoutLabel}>
                {logoutLoading ? "Uitloggen..." : "Uitloggen"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDeleteAccount}
              disabled={logoutLoading || deleteLoading}
              style={[
                styles.accountActionBtn,
                styles.deleteAccountBtn,
                (logoutLoading || deleteLoading) && styles.logoutDisabled,
              ]}
            >
              <IIcon
                name="trash"
                size={16}
                strokeWidth={2}
                color={colors.red}
              />
              <Text style={styles.deleteAccountLabel}>
                {deleteLoading ? "Verwijderen..." : "Verwijder account"}
              </Text>
            </Pressable>
          </View>
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
  accountCard: {
    alignSelf: "stretch",
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: surfaces.border,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 4,
  },
  accountHeaderLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: surfaces.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  accountLine: {
    paddingVertical: 9,
    gap: 2,
  },
  accountLabel: {
    fontFamily: fonts.display,
    fontSize: 10.5,
    color: surfaces.muted,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  accountInput: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  passwordInput: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  accountError: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.red,
    marginTop: 6,
  },
  accountSuccess: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.blueDark,
    marginTop: 6,
  },
  saveAccountBtn: {
    marginTop: 12,
    backgroundColor: colors.red,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  saveAccountDisabled: {
    opacity: 0.55,
  },
  saveAccountLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.cream,
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
    alignItems: "stretch",
  },
  accountActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  accountActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: surfaces.line,
  },
  deleteAccountBtn: {
    borderColor: "rgba(228,99,77,0.32)",
  },
  logoutDisabled: {
    opacity: 0.55,
  },
  logoutLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: surfaces.muted,
  },
  deleteAccountLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: colors.red,
  },
  logoutError: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.red,
    marginBottom: 8,
    textAlign: "center",
  },
});
