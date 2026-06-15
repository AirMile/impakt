import React, { useState, useRef } from "react";
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
import { validateLogin } from "../../lib/auth/validators";
import { API_BASE_URL } from "../../lib/config";

export function LoginScreen({ onBack, onSuccess, onSwitchToRegister, onSkip }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const pwRef = useRef(null);

  const submit = async () => {
    const errs = validateLogin({ email, pw });
    setError(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: pw,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          general: data.message || "Inloggen mislukt. Controleer je gegevens.",
        });
        return;
      }

      onSuccess(data);
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.cream }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={onBack}
            style={styles.backBtn}
            accessibilityLabel="Terug"
          >
            <IIcon name="arrowL" size={20} strokeWidth={2} color={colors.ink} />
          </Pressable>
          <ImpaktLogo size={20} dark />
          <View style={{ width: 38 }} />
        </View>

        <MotiView {...fadeUp} style={styles.formBody}>
          <Text style={styles.eyebrow}>Welkom terug</Text>
          <Text style={styles.title}>{`Goed je weer\nte zien.`}</Text>

          <Field
            label="E-mailadres"
            type="email"
            icon="mail"
            placeholder="jij@email.nl"
            value={email}
            onChange={setEmail}
            error={error.email}
            returnKeyType="next"
            onSubmitEditing={() => pwRef.current?.focus()}
          />
          <Field
            label="Wachtwoord"
            type={showPw ? "text" : "password"}
            icon="lock"
            placeholder="••••••••"
            value={pw}
            onChange={setPw}
            error={error.pw}
            inputRef={pwRef}
            returnKeyType="done"
            onSubmitEditing={submit}
            rightSlot={
              <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={8}>
                <IIcon
                  name={showPw ? "eyeOff" : "eye"}
                  size={18}
                  strokeWidth={1.8}
                  color="rgba(15,17,26,0.6)"
                />
              </Pressable>
            }
          />

          <View style={styles.forgotRow}>
            <Pressable hitSlop={8}>
              <Text style={styles.forgotLabel}>Wachtwoord vergeten?</Text>
            </Pressable>
          </View>

          {error.general ? (
            <Text style={styles.errorText}>{error.general}</Text>
          ) : null}

          <Btn
            variant="impaktRed"
            onPress={submit}
            disabled={loading}
            iconRight={loading ? undefined : "arrow"}
          >
            {loading ? "Even checken…" : "Inloggen"}
          </Btn>

          <View style={styles.dividerLine} />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Nog geen account? </Text>
            <Pressable onPress={onSwitchToRegister}>
              <Text style={styles.switchLink}>Registreer</Text>
            </Pressable>
          </View>
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <Pressable onPress={onSkip} hitSlop={8}>
              <Text style={styles.skipMuted}>
                Sla over · verder zonder account →
              </Text>
            </Pressable>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 12,
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
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
    flex: 1,
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
    marginBottom: 22,
    letterSpacing: 0.5,
    color: colors.ink,
  },
  forgotRow: { alignItems: "flex-end", marginTop: -6, marginBottom: 18 },
  forgotLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    textDecorationLine: "underline",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  switchText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  switchLink: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    textDecorationLine: "underline",
  },
  skipMuted: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(15,17,26,0.55)",
    paddingVertical: 6,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  dividerLine: {
    height: 1,
    backgroundColor: "rgba(15,17,26,0.18)",
    marginTop: 8,
    marginBottom: 12,
  },
});
