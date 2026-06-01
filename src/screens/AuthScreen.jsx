import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

import { IIcon } from "../components/Icons";
import { ImpaktLogo } from "../components/ImpaktLogo";
import { setOnboarded, setPreferences } from "../storage/prefs";
import { colors, fonts } from "../theme/tokens";
import { fadeUp } from "../theme/animations";

// ─────────────────────────────────────────────────────────────
// Btn
// ─────────────────────────────────────────────────────────────

const BTN_PALETTE = {
  dark: { bg: colors.ink, fg: colors.cream, border: colors.ink },
  blue: { bg: colors.blue, fg: colors.ink, border: colors.ink },
  red: { bg: colors.red, fg: colors.cream, border: colors.red },
  outline: { bg: "transparent", fg: colors.ink, border: colors.ink },
  ghost: { bg: "transparent", fg: colors.ink, border: "transparent" },
  cream: { bg: colors.cream, fg: colors.ink, border: colors.ink },
};

function Btn({
  children,
  onPress,
  variant = "dark",
  size = "lg",
  icon,
  iconRight,
  fullWidth = true,
  disabled = false,
}) {
  const p = BTN_PALETTE[variant];
  const isLg = size === "lg";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        {
          backgroundColor: p.bg,
          borderColor: variant === "ghost" ? "transparent" : p.border,
          borderWidth: variant === "ghost" ? 0 : 1.5,
          paddingVertical: isLg ? 14 : 10,
          paddingHorizontal: isLg ? 20 : 16,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      {icon != null && (
        <IIcon name={icon} size={18} color={p.fg} strokeWidth={2} />
      )}
      <Text
        style={[styles.btnLabel, { color: p.fg, fontSize: isLg ? 15 : 13 }]}
      >
        {children}
      </Text>
      {iconRight != null && (
        <IIcon name={iconRight} size={18} color={p.fg} strokeWidth={2} />
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────
// Field
// ─────────────────────────────────────────────────────────────

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  hint,
  rightSlot,
  returnKeyType,
  onSubmitEditing,
  inputRef,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      {label != null && <Text style={styles.fieldLabel}>{label}</Text>}
      <View
        style={[
          styles.fieldRow,
          {
            borderColor:
              error != null
                ? colors.red
                : focused
                  ? colors.ink
                  : "rgba(15,17,26,0.18)",
          },
        ]}
      >
        {icon != null && (
          <IIcon
            name={icon}
            size={18}
            strokeWidth={1.8}
            color="rgba(15,17,26,0.6)"
          />
        )}
        <TextInput
          ref={inputRef}
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(15,17,26,0.35)"
          secureTextEntry={type === "password"}
          keyboardType={type === "email" ? "email-address" : "default"}
          autoCapitalize={
            type === "email" || type === "password" ? "none" : "words"
          }
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightSlot}
      </View>
      {(error != null || hint != null) && (
        <Text
          style={[
            styles.fieldMeta,
            { color: error != null ? colors.red : "rgba(15,17,26,0.55)" },
          ]}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// SocialRow
// ─────────────────────────────────────────────────────────────

function SocialRow({ onSocial, label = "Of ga verder met" }) {
  return (
    <View style={styles.socialWrap}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>{label}</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.socialBtns}>
        {[
          { id: "google", icon: "google", bg: "#FFFFFF", fg: colors.ink },
          { id: "apple", icon: "apple", bg: colors.ink, fg: colors.cream },
          { id: "facebook", icon: "facebook", bg: "#FFFFFF", fg: colors.ink },
        ].map((s) => (
          <Pressable
            key={s.id}
            onPress={() => onSocial(s.id)}
            accessibilityLabel={s.id}
            style={[styles.socialBtn, { backgroundColor: s.bg }]}
          >
            <IIcon name={s.icon} size={22} color={s.fg} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. Welcome
// ─────────────────────────────────────────────────────────────

function WelcomeScreen({ onLogin, onRegister, onSkip }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={["#F2EEE8", "#EFEBE6", "#E6E0D6"]}
      style={styles.screen}
    >
      <View style={[styles.welcomeContent, { paddingTop: insets.top + 40 }]}>
        {/* Editorial accent line */}
        <MotiView {...fadeUp} delay={0} style={styles.accentLine} />

        {/* Logo */}
        <MotiView {...fadeUp} delay={80} style={styles.welcomeLogo}>
          <ImpaktLogo size={88} dark />
        </MotiView>

        {/* Tagline */}
        <MotiView {...fadeUp} delay={160}>
          <Text style={styles.welcomeTagline}>Het nieuws beter verpakt.</Text>
          <Text style={styles.welcomeSub}>
            Lees verder dan de headline. Snap het. Doe er iets mee. Lach erom.
          </Text>
        </MotiView>

        {/* Feature chips */}
        <MotiView {...fadeUp} delay={240} style={styles.featureChips}>
          {[
            { icon: "bookmark", label: "Nieuws in context" },
            { icon: "smile", label: "Met humor" },
            { icon: "arrow", label: "Doe er iets mee" },
          ].map(({ icon, label }) => (
            <View key={label} style={styles.featureChip}>
              <IIcon name={icon} size={14} strokeWidth={2} color={colors.ink} />
              <Text style={styles.featureChipLabel}>{label}</Text>
            </View>
          ))}
        </MotiView>

        {/* CTA stack */}
        <MotiView {...fadeUp} delay={320} style={styles.ctaStack}>
          <Btn variant="dark" onPress={onRegister} iconRight="arrow">
            Account maken
          </Btn>
          <Btn variant="cream" onPress={onLogin}>
            Inloggen
          </Btn>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>of</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipLabel}>Verder zonder account </Text>
            <IIcon
              name="arrow"
              size={14}
              strokeWidth={2.2}
              color={colors.ink}
            />
          </Pressable>
        </MotiView>
      </View>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Login
// ─────────────────────────────────────────────────────────────

function LoginScreen({
  onBack,
  onSuccess,
  onSwitchToRegister,
  onSocial,
  onSkip,
}) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const pwRef = useRef(null);

  const submit = () => {
    const errs = {};
    if (!email) errs.email = "Vul je e-mail in";
    else if (!email.includes("@"))
      errs.email = "Dit is geen geldig e-mailadres";
    if (!pw) errs.pw = "Vul je wachtwoord in";
    setError(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 700);
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
        {/* Top bar */}
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
          <Text style={styles.formEyebrow}>Welkom terug</Text>
          <Text style={styles.formTitle}>{`Goed je weer\nte zien.`}</Text>

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

          <Btn
            variant="blue"
            onPress={submit}
            disabled={loading}
            iconRight={loading ? undefined : "arrow"}
          >
            {loading ? "Even checken…" : "Inloggen"}
          </Btn>

          <SocialRow onSocial={onSocial} />

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

// ─────────────────────────────────────────────────────────────
// 3. Register
// ─────────────────────────────────────────────────────────────

function RegisterScreen({ onBack, onSuccess, onSwitchToLogin, onSocial }) {
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
          <Text style={styles.formEyebrow}>Stap 1 van 2</Text>
          <Text style={styles.formTitle}>{`Welkom bij\nImpakt.`}</Text>

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

          {/* Password strength bar */}
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

          {/* Terms checkbox */}
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

// ─────────────────────────────────────────────────────────────
// 4. Onboarding
// ─────────────────────────────────────────────────────────────

const ONBOARDING_TOPICS = [
  { id: "politiek", label: "Politiek", x: 14, y: 8, size: "md" },
  { id: "economie", label: "Economie", x: 60, y: 6, size: "md" },
  { id: "natuur", label: "Natuur", x: 36, y: 24, size: "md" },
  { id: "buitenland", label: "Buitenland", x: 8, y: 38, size: "md" },
  { id: "sport", label: "Sport", x: 60, y: 40, size: "sm" },
  { id: "innovatie", label: "Innovatie", x: 32, y: 54, size: "md" },
  { id: "kunst", label: "Kunst", x: 10, y: 72, size: "sm" },
  { id: "lokaal", label: "Lokaal", x: 58, y: 72, size: "sm" },
];

const BUBBLE_SIZES = {
  sm: { width: 88, height: 38, fontSize: 13 },
  md: { width: 108, height: 44, fontSize: 14 },
};

function OnboardingScreen({ onBack, onConfirm, initial = [] }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(new Set(initial));

  const toggle = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.cream }]}>
      {/* Top bar */}
      <View style={[styles.onboardingTopBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.onboardingLabel}>Onboarding</Text>
        <Text style={styles.onboardingCount}>{selected.size} gekozen</Text>
      </View>

      {/* Question banner */}
      <View style={styles.questionBanner}>
        <Text
          style={styles.questionText}
        >{`Welke news thema's\nspreken jou het\nmeest aan?`}</Text>
      </View>

      {/* Bubble field */}
      <View style={styles.bubbleField}>
        {ONBOARDING_TOPICS.map((t, i) => {
          const on = selected.has(t.id);
          const s = BUBBLE_SIZES[t.size];
          return (
            <MotiView
              key={t.id}
              from={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: on ? 1.08 : 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 14,
                delay: i * 50,
              }}
              style={[
                styles.bubble,
                {
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: s.width,
                  height: s.height,
                  backgroundColor: on ? colors.blue : "#FFFFFF",
                  shadowColor: on ? colors.blue : colors.ink,
                  shadowOpacity: on ? 0.5 : 0,
                  shadowRadius: on ? 10 : 0,
                  elevation: on ? 4 : 0,
                },
              ]}
            >
              <Pressable
                onPress={() => toggle(t.id)}
                style={styles.bubblePress}
              >
                <Text style={[styles.bubbleLabel, { fontSize: s.fontSize }]}>
                  {t.label}
                </Text>
              </Pressable>
            </MotiView>
          );
        })}
        <Text style={styles.bubbleHint}>
          Tik om te kiezen · je kunt dit later aanpassen
        </Text>
      </View>

      {/* Footer */}
      <View
        style={[styles.onboardingFooter, { paddingBottom: insets.bottom + 12 }]}
      >
        <View style={{ flex: 1 }}>
          <Btn variant="outline" onPress={onBack}>
            Terug
          </Btn>
        </View>
        <View style={{ flex: 1 }}>
          <Btn
            variant="blue"
            onPress={() => onConfirm([...selected])}
            disabled={selected.size === 0}
            iconRight="arrow"
          >
            Bevestig
          </Btn>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────

export function AuthScreen({ initialView = "welcome", onComplete }) {
  const [view, setView] = useState(initialView);
  const [prevView, setPrevView] = useState("welcome");
  const [pendingUser, setPendingUser] = useState(null);
  const [socialMeta, setSocialMeta] = useState(null);

  const goToApp = async (user, topics) => {
    await setOnboarded(true);
    if (topics) await setPreferences(topics);
    onComplete(user, topics);
  };

  const goToOnboarding = (from, user, meta) => {
    setPendingUser(user);
    setSocialMeta(meta);
    setPrevView(from);
    setView("onboarding");
  };

  const handleSocial = (id) => {
    goToOnboarding(
      "welcome",
      { name: "Gast", email: "" },
      { guest: true, social: id },
    );
  };

  const handleSkip = () => {
    goToOnboarding("welcome", null, { guest: true });
  };

  if (view === "welcome") {
    return (
      <WelcomeScreen
        onLogin={() => setView("login")}
        onRegister={() => setView("register")}
        onSkip={handleSkip}
      />
    );
  }

  if (view === "login") {
    return (
      <LoginScreen
        onBack={() => setView("welcome")}
        onSuccess={() => goToApp({ name: "Gebruiker" })}
        onSwitchToRegister={() => setView("register")}
        onSocial={handleSocial}
        onSkip={handleSkip}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterScreen
        onBack={() => setView("welcome")}
        onSuccess={(u) => goToOnboarding("register", u, null)}
        onSwitchToLogin={() => setView("login")}
        onSocial={handleSocial}
      />
    );
  }

  // onboarding
  const resolveUser = () => {
    if (pendingUser?.email)
      return { name: pendingUser.name, email: pendingUser.email };
    if (socialMeta?.social)
      return { name: "Gast", guest: true, social: socialMeta.social };
    return { name: "Gast", guest: true };
  };

  return (
    <OnboardingScreen
      onBack={() => setView(prevView)}
      onConfirm={(topics) => goToApp(resolveUser(), topics)}
      initial={[]}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Btn
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 10,
  },
  btnLabel: {
    fontFamily: fonts.display,
    fontWeight: "600",
    letterSpacing: 0.1,
  },

  // Field
  field: { marginBottom: 14 },
  fieldLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: colors.ink,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
    minWidth: 0,
    padding: 0,
  },
  fieldMeta: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    marginTop: 4,
    paddingLeft: 2,
  },

  // SocialRow
  socialWrap: { marginTop: 8 },
  socialBtns: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(15,17,26,0.18)" },
  dividerLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(15,17,26,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  // Welcome
  welcomeContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  accentLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.ink,
    marginBottom: 20,
  },
  welcomeLogo: { marginBottom: 20 },
  welcomeTagline: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    color: colors.ink,
    fontWeight: "600",
    maxWidth: 280,
  },
  welcomeSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(15,17,26,0.65)",
    maxWidth: 280,
    marginTop: 10,
    marginBottom: 0,
  },
  featureChips: { marginTop: 24, gap: 8 },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.creamWarm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.06)",
  },
  featureChipLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  ctaStack: { marginTop: 30, gap: 12 },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  skipLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },

  // Login / Register shared
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
  formEyebrow: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: colors.red,
    marginBottom: 8,
  },
  formTitle: {
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

  // Register extras
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

  // Onboarding
  onboardingTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 6,
  },
  onboardingLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "rgba(15,17,26,0.6)",
  },
  onboardingCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(15,17,26,0.6)",
  },
  questionBanner: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: colors.blue,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
  },
  questionText: {
    fontFamily: fonts.header,
    fontSize: 24,
    lineHeight: 25,
    letterSpacing: 0.5,
    color: colors.ink,
  },
  bubbleField: {
    flex: 1,
    marginHorizontal: 18,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
    overflow: "hidden",
  },
  bubble: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.08)",
    shadowOffset: { width: 2, height: 2 },
    zIndex: 1,
  },
  bubblePress: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
  bubbleLabel: {
    fontFamily: fonts.display,
    fontWeight: "600",
    color: colors.ink,
  },
  bubbleHint: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 14,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: "rgba(15,17,26,0.5)",
    textAlign: "center",
  },
  onboardingFooter: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: "rgba(15,17,26,0.1)",
  },
});
