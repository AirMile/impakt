import { useEffect, useState } from "react";
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
import {
  deleteAccount,
  logoutAccount,
  updateAccount,
} from "../lib/auth/account";
import { fetchTags, updateMyTags } from "../lib/tags";
import { slideInRight, fadeUp } from "../theme/animations";

const CATEGORY_ICONS = {
  politiek: "topicPolitics",
  buitenland: "topicWorld",
  economie: "topicEconomy",
  sport: "topicSport",
  natuur: "topicNature",
  innovatie: "topicInnovation",
  kunst: "topicArt",
  lokaal: "topicLocal",
};

const TOPIC_BG = "#DDF5F8";
const TOPIC_INK = "#10111A";
const SELECTED_BG = "#10141C";
const SELECTED_TOPIC_BG = "#ADE8F4";

function topicIcon(tagName) {
  return CATEGORY_ICONS[String(tagName).trim().toLowerCase()] ?? "topicWorld";
}

// System tags drive app behavior, so they should not be picked as interests.
const isInterestTag = (tag) => {
  const name = String(tag?.name ?? "")
    .trim()
    .toLowerCase();
  const category = String(tag?.category ?? "")
    .trim()
    .toLowerCase();

  return name !== "goed nieuws" && category !== "flag" && category !== "happy";
};

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

const ACCOUNT_FIELDS = {
  username: {
    label: "Gebruikersnaam",
    placeholder: "Gebruikersnaam",
    keyboardType: "default",
    autoCapitalize: "none",
  },
  name: {
    label: "Naam",
    placeholder: "Naam",
    keyboardType: "default",
    autoCapitalize: "words",
  },
  email: {
    label: "E-mail",
    placeholder: "E-mail",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
};

function AccountField({ label, value, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.accountLine}
      accessibilityLabel={`Bewerk ${label}`}
    >
      <Text style={styles.accountLabel}>{label}</Text>
      <View style={styles.accountValueRow}>
        <Text style={styles.accountValue} numberOfLines={1}>
          {value || "-"}
        </Text>
        <IIcon name="chev" size={19} strokeWidth={2.1} color={surfaces.muted} />
      </View>
    </Pressable>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────

export function ProfileScreen({
  user,
  onClose,
  onLogout,
  onUserUpdate,
  myTags = [],
  onMyTagsChange,
}) {
  const insets = useSafeAreaInsets();
  const [availableTags, setAvailableTags] = useState([]);
  const [picking, setPicking] = useState(false);
  const [tagsError, setTagsError] = useState("");
  const [usernameValue, setUsernameValue] = useState(user?.username ?? "");
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [emailValue, setEmailValue] = useState(user?.email ?? "");
  const [accountBaseline, setAccountBaseline] = useState({
    username: user?.username ?? "",
    name: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [editingAccountField, setEditingAccountField] = useState(null);
  const [editingAccountValue, setEditingAccountValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordConfirmValue, setPasswordConfirmValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const displayName = nameValue || usernameValue || "Gast";
  const hasAccountInfo = Boolean(usernameValue || nameValue || emailValue);
  const accountValues = {
    username: usernameValue,
    name: nameValue,
    email: emailValue,
  };
  const editingAccountConfig = editingAccountField
    ? ACCOUNT_FIELDS[editingAccountField]
    : null;
  const hasEditingAccountChange =
    editingAccountField &&
    editingAccountValue !== accountBaseline[editingAccountField];
  const hasPasswordChanges = Boolean(passwordValue || passwordConfirmValue);

  useEffect(() => {
    let cancelled = false;
    fetchTags()
      .then((all) => {
        if (!cancelled) setAvailableTags(all.filter(isInterestTag));
      })
      .catch((err) => {
        if (!cancelled) setTagsError(err.message || "Tags laden mislukt.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const syncTags = async (nextTags) => {
    const previous = myTags;
    onMyTagsChange?.(nextTags);
    setTagsError("");
    try {
      const updated = await updateMyTags(
        user?.token,
        nextTags.map((t) => t.id)
      );
      onMyTagsChange?.(updated.filter(isInterestTag));
    } catch (err) {
      onMyTagsChange?.(previous);
      setTagsError(err.message || "Tags bijwerken mislukt.");
    }
  };

  const removeTag = (tag) => {
    syncTags(myTags.filter((t) => t.id !== tag.id));
  };

  const pickTag = (tag) => {
    if (myTags.some((t) => t.id === tag.id)) return;
    syncTags([...myTags, tag]);
  };

  const pickableTags = availableTags.filter(
    (t) => !myTags.some((mine) => mine.id === t.id)
  );

  const openAccountEditor = (field) => {
    setEditingAccountField(field);
    setEditingAccountValue(accountValues[field] ?? "");
    setAccountError("");
    setAccountSuccess("");
  };

  const closeAccountEditor = () => {
    setEditingAccountField(null);
    setEditingAccountValue("");
    setAccountError("");
  };

  const openPasswordEditor = () => {
    setEditingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
  };

  const closePasswordEditor = () => {
    setEditingPassword(false);
    setPasswordValue("");
    setPasswordConfirmValue("");
    setShowPassword(false);
    setPasswordError("");
  };

  const handleSaveAccountField = async () => {
    if (accountLoading || !editingAccountField || !hasEditingAccountChange)
      return;

    const nextError = {};
    const trimmedValue = editingAccountValue.trim();

    if (editingAccountField === "username" && !trimmedValue)
      nextError.username = "Vul je gebruikersnaam in";
    if (editingAccountField === "email" && !trimmedValue)
      nextError.email = "Vul je e-mail in";
    else if (editingAccountField === "email" && !trimmedValue.includes("@"))
      nextError.email = "Dit is geen geldig e-mailadres";

    if (Object.keys(nextError).length) {
      setAccountError(Object.values(nextError)[0]);
      setAccountSuccess("");
      return;
    }

    setAccountLoading(true);
    setAccountError("");
    setAccountSuccess("");

    try {
      const payload = {
        [editingAccountField]:
          editingAccountField === "name"
            ? trimmedValue || undefined
            : trimmedValue,
      };
      const updatedUser = await updateAccount(user?.token, {
        ...payload,
      });

      onUserUpdate?.(updatedUser);
      const nextValue =
        updatedUser[editingAccountField] ??
        (editingAccountField === "name"
          ? trimmedValue
          : payload[editingAccountField]);

      if (editingAccountField === "username") setUsernameValue(nextValue);
      if (editingAccountField === "name") setNameValue(nextValue ?? "");
      if (editingAccountField === "email") setEmailValue(nextValue);

      setAccountBaseline((current) => ({
        ...current,
        [editingAccountField]: nextValue ?? "",
      }));
      setAccountSuccess("Account bijgewerkt.");
      setEditingAccountField(null);
      setEditingAccountValue("");
    } catch (err) {
      setAccountError(err.message || "Account bijwerken mislukt.");
    } finally {
      setAccountLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordLoading) return;

    const nextError = {};
    if (!passwordValue) nextError.password = "Vul je wachtwoord in";
    else if (passwordValue.length < 8) nextError.password = "Minimaal 8 tekens";
    if (passwordConfirmValue !== passwordValue)
      nextError.passwordConfirm = "Komt niet overeen";

    if (Object.keys(nextError).length) {
      setPasswordError(Object.values(nextError)[0]);
      setPasswordSuccess("");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const updatedUser = await updateAccount(user?.token, {
        password: passwordValue,
        password_confirmation: passwordConfirmValue,
      });

      onUserUpdate?.(updatedUser);
      setPasswordValue("");
      setPasswordConfirmValue("");
      setEditingPassword(false);
      setPasswordSuccess("Wachtwoord bijgewerkt.");
    } catch (err) {
      setPasswordError(err.message || "Wachtwoord bijwerken mislukt.");
    } finally {
      setPasswordLoading(false);
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

  if (editingAccountConfig) {
    return (
      <MotiView
        {...slideInRight}
        style={[StyleSheet.absoluteFillObject, styles.screen]}
      >
        <View
          style={[styles.editScreenHeader, { paddingTop: insets.top + 12 }]}
        >
          <Pressable
            onPress={closeAccountEditor}
            accessibilityLabel="Terug naar accountgegevens"
            style={styles.editBackBtn}
          >
            <IIcon name="arrowL" size={28} strokeWidth={2} color={colors.ink} />
          </Pressable>
          <Text style={styles.editScreenTitle}>
            {editingAccountConfig.label}
          </Text>
          {hasEditingAccountChange ? (
            <Pressable
              onPress={handleSaveAccountField}
              disabled={accountLoading}
              style={styles.editSaveBtn}
            >
              <Text
                style={[
                  styles.editSaveLabel,
                  accountLoading && styles.editSaveDisabled,
                ]}
              >
                {accountLoading ? "Opslaan..." : "Opslaan"}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.editSaveBtn} />
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.editScreenBody,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.editFieldLabel}>
            {editingAccountConfig.label}
          </Text>
          <TextInput
            style={styles.editFieldInput}
            value={editingAccountValue}
            onChangeText={setEditingAccountValue}
            placeholder={editingAccountConfig.placeholder}
            placeholderTextColor="rgba(15,17,26,0.35)"
            keyboardType={editingAccountConfig.keyboardType}
            autoCapitalize={editingAccountConfig.autoCapitalize}
            autoCorrect={false}
            editable={!accountLoading}
            autoFocus
          />
          {accountError ? (
            <Text style={styles.accountError}>{accountError}</Text>
          ) : null}
        </ScrollView>
      </MotiView>
    );
  }

  if (editingPassword) {
    return (
      <MotiView
        {...slideInRight}
        style={[StyleSheet.absoluteFillObject, styles.screen]}
      >
        <View
          style={[styles.editScreenHeader, { paddingTop: insets.top + 12 }]}
        >
          <Pressable
            onPress={closePasswordEditor}
            accessibilityLabel="Terug naar accountgegevens"
            style={styles.editBackBtn}
          >
            <IIcon name="arrowL" size={28} strokeWidth={2} color={colors.ink} />
          </Pressable>
          <Text style={styles.editScreenTitle}>Wachtwoord</Text>
          {hasPasswordChanges ? (
            <Pressable
              onPress={handleSavePassword}
              disabled={passwordLoading}
              style={styles.editSaveBtn}
            >
              <Text
                style={[
                  styles.editSaveLabel,
                  passwordLoading && styles.editSaveDisabled,
                ]}
              >
                {passwordLoading ? "Opslaan..." : "Opslaan"}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.editSaveBtn} />
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.editScreenBody,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.passwordEditTitle}>Wachtwoord wijzigen</Text>
          <Text style={styles.passwordEditCopy}>
            Vul je nieuwe wachtwoord in en bevestig het.
          </Text>
          <View style={styles.passwordEditField}>
            <Text style={styles.editFieldLabel}>Nieuw wachtwoord</Text>
            <View style={styles.passwordEditInputRow}>
              <TextInput
                style={styles.passwordEditInput}
                value={passwordValue}
                onChangeText={setPasswordValue}
                placeholder="Nieuw wachtwoord"
                placeholderTextColor="rgba(15,17,26,0.35)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!passwordLoading}
                autoFocus
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
          <View style={styles.passwordEditField}>
            <Text style={styles.editFieldLabel}>Bevestig wachtwoord</Text>
            <TextInput
              style={styles.editFieldInput}
              value={passwordConfirmValue}
              onChangeText={setPasswordConfirmValue}
              placeholder="Nog een keer"
              placeholderTextColor="rgba(15,17,26,0.35)"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!passwordLoading}
            />
          </View>
          {passwordError ? (
            <Text style={styles.passwordEditError}>{passwordError}</Text>
          ) : null}
        </ScrollView>
      </MotiView>
    );
  }

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
            <>
              <View style={styles.accountCard}>
                <View style={styles.accountHeader}>
                  <Text style={styles.accountHeaderLabel}>Accountgegevens</Text>
                </View>
                <AccountField
                  label="Gebruikersnaam"
                  value={usernameValue}
                  onPress={() => openAccountEditor("username")}
                />
                <View style={styles.accountDivider} />
                <AccountField
                  label="Naam"
                  value={nameValue}
                  onPress={() => openAccountEditor("name")}
                />
                <View style={styles.accountDivider} />
                <AccountField
                  label="E-mail"
                  value={emailValue}
                  onPress={() => openAccountEditor("email")}
                />
                {accountError ? (
                  <Text style={styles.accountError}>{accountError}</Text>
                ) : null}
                {accountSuccess ? (
                  <Text style={styles.accountSuccess}>{accountSuccess}</Text>
                ) : null}
              </View>

              <View style={styles.passwordCard}>
                <Pressable
                  onPress={openPasswordEditor}
                  disabled={passwordLoading}
                  style={styles.changePasswordToggle}
                  accessibilityLabel="Wijzig wachtwoord"
                >
                  <View style={styles.changePasswordLeft}>
                    <IIcon
                      name="lock"
                      size={15}
                      strokeWidth={1.9}
                      color={surfaces.muted}
                    />
                    <Text style={styles.changePasswordLabel}>
                      Wachtwoord wijzigen
                    </Text>
                  </View>
                  <IIcon
                    name="chev"
                    size={17}
                    strokeWidth={2}
                    color={surfaces.muted}
                  />
                </Pressable>
                {passwordError ? (
                  <Text style={styles.accountError}>{passwordError}</Text>
                ) : null}
                {passwordSuccess ? (
                  <Text style={styles.accountSuccess}>{passwordSuccess}</Text>
                ) : null}
              </View>
            </>
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
          {myTags.map((tag) => (
            <View key={tag.id} style={styles.tagChip}>
              <IIcon
                name={topicIcon(tag.name)}
                size={16}
                strokeWidth={2.3}
                color={SELECTED_BG}
              />
              <Text style={styles.tagChipLabel}>{tag.name}</Text>
              <Pressable
                onPress={() => removeTag(tag)}
                hitSlop={8}
                accessibilityLabel={`Verwijder ${tag.name}`}
              >
                <IIcon
                  name="close"
                  size={12}
                  strokeWidth={2.4}
                  color={SELECTED_BG}
                />
              </Pressable>
            </View>
          ))}
          {picking ? (
            <Pressable
              onPress={() => setPicking(false)}
              style={styles.addTagChip}
            >
              <IIcon
                name="close"
                size={12}
                strokeWidth={2.4}
                color={colors.ink}
              />
              <Text style={styles.addTagChipLabel}>Klaar</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setPicking(true)}
              style={styles.addTagChip}
              disabled={pickableTags.length === 0}
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
        {picking && pickableTags.length > 0 ? (
          <View style={styles.pickRow}>
            {pickableTags.map((tag) => (
              <Pressable
                key={tag.id}
                onPress={() => pickTag(tag)}
                style={styles.pickChip}
                accessibilityLabel={`Voeg ${tag.name} toe`}
              >
                <IIcon
                  name="plus"
                  size={12}
                  strokeWidth={2.4}
                  color={TOPIC_INK}
                />
                <Text style={styles.pickChipLabel}>{tag.name}</Text>
                <IIcon
                  name={topicIcon(tag.name)}
                  size={16}
                  strokeWidth={2.3}
                  color={TOPIC_INK}
                />
              </Pressable>
            ))}
          </View>
        ) : null}
        {tagsError ? <Text style={styles.tagsError}>{tagsError}</Text> : null}

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
  editScreenHeader: {
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,17,26,0.08)",
    paddingBottom: 12,
    paddingHorizontal: 18,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editBackBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  editSaveBtn: {
    minWidth: 72,
    minHeight: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  editSaveLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.red,
  },
  editSaveDisabled: {
    opacity: 0.55,
  },
  editScreenTitle: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
    textAlign: "left",
    marginLeft: 8,
  },
  editScreenBody: {
    paddingHorizontal: 18,
    paddingTop: 32,
  },
  editFieldLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: surfaces.muted,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  editFieldInput: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.ink,
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
  passwordCard: {
    alignSelf: "stretch",
    marginTop: 10,
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
  accountValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  accountDivider: {
    height: 1,
    backgroundColor: surfaces.border,
  },
  accountLabel: {
    fontFamily: fonts.display,
    fontSize: 10.5,
    color: surfaces.muted,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  accountValue: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ink,
    textAlign: "left",
  },
  changePasswordToggle: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  changePasswordLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changePasswordLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: surfaces.muted,
  },
  passwordEditTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: colors.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  passwordEditCopy: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: surfaces.muted,
    textAlign: "center",
    marginBottom: 30,
  },
  passwordEditField: {
    marginBottom: 22,
  },
  passwordEditInputRow: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  passwordEditInput: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.ink,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  passwordEditError: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.red,
    marginTop: 6,
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
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SELECTED_TOPIC_BG,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: SELECTED_BG,
  },
  tagChipLabel: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "900",
    color: SELECTED_BG,
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
  pickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  pickChip: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: TOPIC_BG,
    borderWidth: 1.5,
    borderColor: "rgba(15,17,26,0.04)",
  },
  pickChipLabel: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "900",
    color: TOPIC_INK,
  },
  tagsError: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.red,
    marginTop: 8,
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
