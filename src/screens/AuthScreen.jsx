import React, { useState } from "react";

import { setOnboarded, setPreferences } from "../storage/prefs";
import { fetchAccount, normalizeAuthPayload } from "../lib/auth/account";
import { fetchTags, updateMyTags } from "../lib/tags";
import { resolveUser } from "../lib/auth/resolveUser";
import { WelcomeScreen } from "./auth/WelcomeScreen";
import { LoginScreen } from "./auth/LoginScreen";
import { RegisterScreen } from "./auth/RegisterScreen";
import { OnboardingScreen } from "./auth/OnboardingScreen";

async function persistOnboardingTags(token, topics) {
  if (!token || !topics?.length) return;
  try {
    const allTags = await fetchTags();
    const slugs = new Set(topics);
    const tagIds = allTags
      .filter((tag) => slugs.has(tag.category))
      .map((tag) => tag.id);
    if (tagIds.length === 0) return;
    await updateMyTags(token, tagIds);
  } catch (err) {
    // Onboarding mag niet blokkeren op backend-fout — lokale prefs blijven als fallback.
    console.warn("Onboarding-tags niet gesynchroniseerd:", err.message);
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
    await persistOnboardingTags(finalUser?.token, topics);
    onComplete(finalUser, topics);
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
