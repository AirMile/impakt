import React, { useState } from "react";

import { setOnboarded, setPreferences } from "../storage/prefs";
import { WelcomeScreen } from "./auth/WelcomeScreen";
import { LoginScreen } from "./auth/LoginScreen";
import { RegisterScreen } from "./auth/RegisterScreen";
import { OnboardingScreen } from "./auth/OnboardingScreen";

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
