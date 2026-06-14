import React, { useState } from "react";

import { setOnboarded, setPreferences } from "../storage/prefs";
import { fetchAccount, normalizeAuthPayload } from "../lib/auth/account";
import { fetchTags, updateMyTags } from "../lib/tags";
import { resolveUser } from "../lib/auth/resolveUser";
import { WelcomeScreen } from "./auth/WelcomeScreen";
import { LoginScreen } from "./auth/LoginScreen";
import { RegisterScreen } from "./auth/RegisterScreen";
import { OnboardingScreen } from "./auth/OnboardingScreen";

function tagKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

async function persistOnboardingTags(token, topics) {
  if (!token || !topics?.length) return [];
  try {
    const allTags = await fetchTags();
    const selected = new Set(topics.map(tagKey));
    const tagIds = allTags
      .filter((tag) => selected.has(tagKey(tag.name)))
      .map((tag) => tag.id);
    if (tagIds.length === 0) return [];
    return await updateMyTags(token, tagIds);
  } catch (err) {
    // Onboarding mag niet blokkeren op backend-fout — lokale prefs blijven als fallback.
    console.warn("Onboarding-tags niet gesynchroniseerd:", err.message);
    return [];
  }
}

export function AuthScreen({ initialView = "welcome", onComplete }) {
  const [view, setView] = useState(initialView);
  const [prevView, setPrevView] = useState("welcome");
  const [pendingUser, setPendingUser] = useState(null);
  const [socialMeta, setSocialMeta] = useState(null);

  const goToApp = async (user, topics) => {
    const accountUser = await fetchAccount(user?.token).catch(() => null);
    const finalUser = accountUser ?? user;
    await setOnboarded(true);
    if (topics) await setPreferences(topics);
    const syncedTags = await persistOnboardingTags(finalUser?.token, topics);
    onComplete(finalUser, topics, syncedTags);
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
      { guest: true, social: id }
    );
  };

  const handleSkip = () => {
    goToApp(resolveUser(null, { guest: true }), null);
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
        onSuccess={(data) => goToApp(normalizeAuthPayload(data))}
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

  return (
    <OnboardingScreen
      onBack={() => setView(prevView)}
      onConfirm={(topics) =>
        goToApp(resolveUser(pendingUser, socialMeta), topics)
      }
      initial={[]}
    />
  );
}
