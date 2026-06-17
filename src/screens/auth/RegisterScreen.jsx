import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { IIcon } from "../../components/Icons";
import { ImpaktLogo } from "../../components/ImpaktLogo";
import { Btn } from "../../components/Btn";
import { Field } from "../../components/Field";
import { colors, fonts } from "../../theme/tokens";
import { fadeUp } from "../../theme/animations";
import { API_BASE_URL, normalizeAuthPayload } from "../../lib/auth/account";
import { validateRegister } from "../../lib/auth/validators";

export function RegisterScreen({ onBack, onSuccess, onSwitchToLogin }) {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const pwRef = useRef(null);
  const pw2Ref = useRef(null);

  const scrollToPasswordFields = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  const submit = async () => {
    const errs = validateRegister({ username, email, pw, pw2 });
    setError(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          name: name.trim() || undefined,
          email,
          password: pw,
          password_confirmation: pw2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          general:
            data.message || "Account aanmaken mislukt. Controleer je gegevens.",
        });
        return;
      }

      onSuccess(normalizeAuthPayload(data));
    } catch (err) {
      setError({
        general: "Kan geen verbinding maken met de server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 36 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Terug"
          >
            <IIcon name="arrowL" size={20} strokeWidth={2} color={colors.ink} />
          </Pressable>
          <ImpaktLogo size={20} dark />
          <View style={styles.topSpacer} />
        </View>

        <MotiView {...fadeUp} style={styles.formBody}>
          <View style={styles.headingBlock}>
            <Text style={styles.eyebrow}>Stap 1 van 2</Text>
            <Text
              style={styles.title}
              accessibilityRole="header"
            >{`Welkom bij\nImpakt.`}</Text>
          </View>

          <View style={styles.fieldsBlock}>
            <Field
              label="Gebruikersnaam"
              icon="user"
              placeholder="julia_vermeer"
              value={username}
              onChange={setUsername}
              error={error.username}
              returnKeyType="next"
              onSubmitEditing={() => nameRef.current?.focus()}
            />
            <Field
              label="Naam"
              icon="user"
              placeholder="Julia Vermeer"
              value={name}
              onChange={setName}
              error={error.name}
              inputRef={nameRef}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <Field
              label="E-mailadres"
              type="email"
              icon="mail"
              placeholder="jij@email.nl"
              value={email}
              onChange={setEmail}
              error={error.email}
              inputRef={emailRef}
              returnKeyType="next"
              onSubmitEditing={() => pwRef.current?.focus()}
            />
            <Field
              label="Wachtwoord"
              type={showPw ? "text" : "password"}
              icon="lock"
              placeholder="Wachtwoord"
              value={pw}
              onChange={setPw}
              error={error.pw}
              inputRef={pwRef}
              returnKeyType="next"
              onFocus={scrollToPasswordFields}
              onSubmitEditing={() => pw2Ref.current?.focus()}
              rightSlot={
                <Pressable
                  onPress={() => setShowPw((s) => !s)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPw ? "Wachtwoord verbergen" : "Wachtwoord tonen"
                  }
                >
                  <IIcon
                    name={showPw ? "eyeOff" : "eye"}
                    size={18}
                    strokeWidth={1.8}
                    color="rgba(15,17,26,0.6)"
                  />
                </Pressable>
              }
            />
            <Field
              label="Bevestig wachtwoord"
              type={showPw ? "text" : "password"}
              icon="lock"
              placeholder="Nog een keer"
              value={pw2}
              onChange={setPw2}
              error={error.pw2}
              inputRef={pw2Ref}
              returnKeyType="done"
              onFocus={scrollToPasswordFields}
              onSubmitEditing={submit}
            />
          </View>

          <View style={styles.actionsBlock}>
            {error.general ? (
              <Text style={styles.errorText}>{error.general}</Text>
            ) : null}

            <Btn
              variant="impaktRed"
              onPress={submit}
              disabled={loading}
              iconRight={loading ? undefined : "arrow"}
            >
              {loading ? "Aanmaken..." : "Account aanmaken"}
            </Btn>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Al een account? </Text>
              <Pressable onPress={onSwitchToLogin} accessibilityRole="button">
                <Text style={styles.switchLink}>Inloggen</Text>
              </Pressable>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  topSpacer: {
    width: 38,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 9999,
    backgroundColor: "rgba(15,17,26,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  formBody: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 28,
  },
  headingBlock: {
    flexShrink: 0,
  },
  eyebrow: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: colors.red,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.header,
    fontSize: 52,
    lineHeight: 50,
    marginBottom: 4,
    letterSpacing: 0.5,
    color: colors.ink,
  },
  fieldsBlock: {
    flexShrink: 0,
  },
  actionsBlock: {
    flexShrink: 0,
    paddingTop: 4,
  },
  errorText: {
    color: colors.red,
    fontFamily: fonts.body,
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 8,
  },
  switchText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  switchLink: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    textDecorationLine: "underline",
  },
});
