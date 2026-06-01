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
import { SocialRow } from "../../components/SocialRow";
import { colors, fonts } from "../../theme/tokens";
import { fadeUp } from "../../theme/animations";

export function RegisterScreen({
  onBack,
  onSuccess,
  onSwitchToLogin,
  onSocial,
}) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const pwRef = useRef(null);
  const pw2Ref = useRef(null);

  const pwStrength = (() => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/[0-9!@#$%^&*]/.test(pw)) s++;
    return s;
  })();

  const submit = () => {
    const errs = {};
    if (!name) errs.name = "Hoe mogen we je noemen?";
    if (!email) errs.email = "Vul je e-mail in";
    else if (!email.includes("@"))
      errs.email = "Dit is geen geldig e-mailadres";
    if (!pw) errs.pw = "Verzin een wachtwoord";
    else if (pw.length < 6) errs.pw = "Min 6 tekens";
    if (pw && pw2 !== pw) errs.pw2 = "Komt niet overeen";
    if (!accept) errs.accept = "Accepteer eerst de voorwaarden";
    setError(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ name, email });
    }, 700);
  };

  const strengthLabels = ["zwak", "oké", "goed", "sterk", "perfect"];

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

        <MotiView {...fadeUp} style={[styles.formBody, { paddingTop: 14 }]}>
          <Text style={styles.eyebrow}>Stap 1 van 2</Text>
          <Text style={styles.title}>{`Welkom bij\nImpakt.`}</Text>

          <Field
            label="Gebruikersnaam"
            icon="user"
            placeholder="John news"
            value={name}
            onChange={setName}
            error={error.name}
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
            placeholder="Min. 6 tekens"
            value={pw}
            onChange={setPw}
            error={error.pw}
            hint={
              !error.pw && pw
                ? `Sterkte: ${strengthLabels[pwStrength]}`
                : undefined
            }
            inputRef={pwRef}
            returnKeyType="next"
            onSubmitEditing={() => pw2Ref.current?.focus()}
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

          {pw.length > 0 && (
            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        i <= pwStrength
                          ? pwStrength >= 3
                            ? colors.blue
                            : colors.red
                          : "rgba(15,17,26,0.12)",
                    },
                  ]}
                />
              ))}
            </View>
          )}

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
            onSubmitEditing={submit}
          />

          <Pressable
            onPress={() => setAccept((a) => !a)}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: accept ? colors.blue : "transparent",
                  borderColor: error.accept != null ? colors.red : colors.ink,
                },
              ]}
            >
              {accept && (
                <IIcon
                  name="check"
                  size={14}
                  strokeWidth={3}
                  color={colors.ink}
                />
              )}
            </View>
            <Text
              style={[
                styles.termsText,
                { color: error.accept != null ? colors.red : colors.ink },
              ]}
            >
              {"Ik ga akkoord met de "}
              <Text style={{ textDecorationLine: "underline" }}>
                voorwaarden
              </Text>
              {" en het "}
              <Text style={{ textDecorationLine: "underline" }}>
                privacybeleid
              </Text>
              {" van Impakt."}
            </Text>
          </Pressable>

          <View style={{ marginTop: 18 }}>
            <Btn
              variant="blue"
              onPress={submit}
              disabled={loading}
              iconRight={loading ? undefined : "arrow"}
            >
              {loading ? "Aanmaken…" : "Account aanmaken"}
            </Btn>
          </View>

          <SocialRow onSocial={onSocial} label="Of registreer met" />

          <View style={[styles.switchRow, { marginBottom: 8 }]}>
            <Text style={styles.switchText}>Al een account? </Text>
            <Pressable onPress={onSwitchToLogin}>
              <Text style={styles.switchLink}>Inloggen</Text>
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
  strengthRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: -8,
    marginBottom: 14,
  },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    paddingBottom: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  termsText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
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
});
