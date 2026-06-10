import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
} from "@expo-google-fonts/geist";

import { AnimatePresence } from "moti";
import { colors } from "./src/theme/tokens";
import { getOnboarded } from "./src/storage/prefs";
import { parseImpaktUrl } from "./src/lib/parseImpaktUrl";
import { ToastHost } from "./src/components/Toast";
import { BottomNav } from "./src/components/BottomNav";

import { FeedScreen } from "./src/screens/FeedScreen";
import { DetailScreen } from "./src/screens/DetailScreen";
import { HumorScreen } from "./src/screens/HumorScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { HappyFeedScreen } from "./src/screens/HappyFeedScreen";
import { SandboxReactionsScreen } from "./src/screens/SandboxReactionsScreen";
import { fetchMyTags } from "./src/lib/tags";
import { fetchArticle } from "./src/lib/articles";
import { fetchMemes } from "./src/lib/memes";

const DEV_FORCE_AUTH = __DEV__;
const DEV_SANDBOX = false; // false | "reactions"

function GuestAuthPrompt({ visible, onClose, onLogin, onRegister }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.authPrompt}>
          <View style={styles.authPromptHeader}>
            <Text style={styles.authPromptTitle}>Account nodig</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [
                styles.authCloseBtn,
                pressed && styles.authBtnPressed,
              ]}
              accessibilityLabel="Sluiten"
            >
              <Text style={styles.authCloseLabel}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.authPromptText}>
            Maak een account aan of log in om te delen, bewaren, liken en mee te
            stemmen.
          </Text>
          <Pressable
            onPress={onRegister}
            style={({ pressed }) => [
              styles.authPrimaryBtn,
              pressed && styles.authBtnPressed,
            ]}
          >
            <Text style={styles.authPrimaryLabel}>Account aanmaken</Text>
          </Pressable>
          <Pressable
            onPress={onLogin}
            style={({ pressed }) => [
              styles.authSecondaryBtn,
              pressed && styles.authBtnPressed,
            ]}
          >
            <Text style={styles.authSecondaryLabel}>Inloggen</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  const [phase, setPhase] = useState("welcome");
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("feed");
  const [user, setUser] = useState(null);
  const [myTags, setMyTags] = useState([]);
  const [memes, setMemes] = useState([]);
  const [openStory, setOpenStory] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [pendingMemeStoryId, setPendingMemeStoryId] = useState(null);
  const [feedCat, setFeedCat] = useState("Voor jou");
  const [authInitialView, setAuthInitialView] = useState("welcome");
  const [authPromptVisible, setAuthPromptVisible] = useState(false);

  useEffect(() => {
    if (!user?.token) {
      setMyTags([]);
      return;
    }
    let cancelled = false;
    fetchMyTags(user.token)
      .then((tags) => {
        if (!cancelled) setMyTags(tags);
      })
      .catch(() => {
        if (!cancelled) setMyTags([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  useEffect(() => {
    let cancelled = false;
    fetchMemes()
      .then((m) => {
        if (!cancelled) setMemes(m);
      })
      .catch(() => {
        if (!cancelled) setMemes([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    if (DEV_FORCE_AUTH) {
      setAuthLoading(false);
      return;
    }
    getOnboarded()
      .then((v) => {
        if (v) setPhase("app");
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, [fontsLoaded]);

  useEffect(() => {
    if (authLoading || !fontsLoaded) return;

    const handle = (url) => {
      const parsed = parseImpaktUrl(url);
      if (!parsed) return;
      setPhase("app");
      if (parsed.kind === "story") {
        fetchArticle(Number(parsed.id))
          .then((s) => {
            if (s) setOpenStory(s);
          })
          .catch(() => {});
      } else if (parsed.kind === "meme") {
        const meme = memes.find((m) => String(m.id) === String(parsed.id));
        if (meme) {
          setOpenStory(null);
          setTab("humor");
          setPendingMemeStoryId(meme.storyId);
        }
      }
    };

    Linking.getInitialURL()
      .then((url) => {
        if (url) handle(url);
      })
      .catch(() => {});

    const sub = Linking.addEventListener("url", ({ url }) => handle(url));
    return () => sub.remove();
  }, [fontsLoaded, authLoading, memes]);

  // Callbacks voor navigatie — vóór early returns zodat hooks altijd worden aangeroepen
  const navTab = useCallback((t) => {
    setOpenStory(null);
    setTab(t);
  }, []);

  const openStoryById = useCallback((id) => {
    fetchArticle(id)
      .then((s) => {
        if (s) setOpenStory(s);
      })
      .catch(() => {});
  }, []);

  const openMemeForStory = useCallback((storyId) => {
    setOpenStory(null);
    setTab("humor");
    setPendingMemeStoryId(storyId);
  }, []);

  const openMemeById = useCallback(
    (memeId) => {
      const meme = memes.find((m) => String(m.id) === String(memeId));
      if (meme) {
        setOpenStory(null);
        setTab("humor");
        setPendingMemeStoryId(meme.storyId);
      }
    },
    [memes]
  );

  const inApp = phase === "app";
  const isGuest = inApp && (!user?.token || user?.guest);
  const requireAuth = useCallback(() => {
    if (!isGuest) return true;
    setAuthPromptVisible(true);
    return false;
  }, [isGuest]);

  const openAuth = useCallback((view) => {
    setAuthPromptVisible(false);
    setShowProfile(false);
    setShowSearch(false);
    setOpenStory(null);
    setAuthInitialView(view);
    setUser(null);
    setPhase("welcome");
  }, []);

  const handleSearch = useCallback(() => setShowSearch(true), []);
  const handleProfile = useCallback(() => {
    if (!requireAuth()) return;
    setShowProfile(true);
  }, [requireAuth]);

  const commonProps = useMemo(
    () => ({
      onNav: navTab,
      onSearch: handleSearch,
      onProfile: handleProfile,
      activeTab: tab,
    }),
    [navTab, handleSearch, handleProfile, tab]
  );

  if (!fontsLoaded || authLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  if (__DEV__ && DEV_SANDBOX === "reactions") return <SandboxReactionsScreen />;

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style={inApp && tab === "humor" ? "light" : "dark"} />

        {/* Auth — alleen zichtbaar vóór onboarding */}
        {!inApp && (
          <AuthScreen
            initialView={authInitialView}
            onComplete={(u) => {
              setUser(u);
              setAuthInitialView("welcome");
              setPhase("app");
            }}
          />
        )}

        {/* Tab-host: altijd gemount, inactieve tabs verborgen via display:none.
            Scroll-positie, FlatList-state en per-card reaction-state blijven bewaard. */}
        {inApp && (
          <>
            <View style={[styles.tab, tab !== "feed" && styles.hidden]}>
              <FeedScreen
                {...commonProps}
                onOpen={setOpenStory}
                cat={feedCat}
                onCatChange={setFeedCat}
                myTags={myTags}
                onRequireAuth={requireAuth}
              />
            </View>
            <View style={[styles.tab, tab !== "good" && styles.hidden]}>
              <HappyFeedScreen
                onOpen={setOpenStory}
                onProfile={handleProfile}
                myTags={myTags}
                onRequireAuth={requireAuth}
              />
            </View>
            <View style={[styles.tab, tab !== "humor" && styles.hidden]}>
              <HumorScreen
                onNav={navTab}
                onSearch={handleSearch}
                onProfile={handleProfile}
                activeTab={tab}
                initialStoryId={pendingMemeStoryId}
                onInitialStoryConsumed={() => setPendingMemeStoryId(null)}
                onOpenStory={openStoryById}
                memes={memes}
                onRequireAuth={requireAuth}
                token={user?.token}
              />
            </View>
          </>
        )}

        {/* Overlays — conditional (bewuste keuze: eigen data per open) */}
        {inApp && showProfile && (
          <ProfileScreen
            user={user}
            onUserUpdate={setUser}
            myTags={myTags}
            onMyTagsChange={setMyTags}
            onClose={() => setShowProfile(false)}
            onLogout={() => {
              setShowProfile(false);
              setPhase("welcome");
            }}
          />
        )}
        {inApp && showSearch && (
          <SearchScreen
            onClose={() => setShowSearch(false)}
            onOpenStory={(s) => {
              setShowSearch(false);
              setOpenStory(s);
            }}
            myTags={myTags}
            onRequireAuth={requireAuth}
          />
        )}
        <AnimatePresence>
          {inApp && openStory && (
            <DetailScreen
              key={openStory.id}
              story={openStory}
              memes={memes}
              onClose={() => setOpenStory(null)}
              onOpenMeme={openMemeForStory}
              onSwapStory={setOpenStory}
              tab={tab}
              feedCat={feedCat}
              onCatChange={setFeedCat}
              onNav={navTab}
              onProfile={handleProfile}
              onSearch={handleSearch}
              activeTab={tab}
              onRequireAuth={requireAuth}
              token={user?.token}
            />
          )}
        </AnimatePresence>

        {/* BottomNav — één instantie voor de hele app-levensduur.
            BlurView wordt niet meer gecreëerd bij elke tabwissel. */}
        {inApp && (
          <BottomNav
            active={tab}
            onChange={navTab}
            onSearch={handleSearch}
            theme={tab === "humor" ? "dark" : "light"}
          />
        )}

        <ToastHost />
        <GuestAuthPrompt
          visible={authPromptVisible}
          onClose={() => setAuthPromptVisible(false)}
          onLogin={() => openAuth("login")}
          onRegister={() => openAuth("register")}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
  },
  tab: {
    ...StyleSheet.absoluteFillObject,
  },
  hidden: {
    display: "none",
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(15,17,26,0.45)",
  },
  authPrompt: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 22,
    backgroundColor: colors.cream,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  authPromptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  authPromptTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: colors.ink,
    flex: 1,
  },
  authCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  authCloseLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    lineHeight: 30,
    color: "rgba(15,17,26,0.5)",
  },
  authPromptText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(15,17,26,0.68)",
    marginBottom: 20,
  },
  authPrimaryBtn: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.red,
    marginBottom: 10,
  },
  authPrimaryLabel: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: colors.cream,
  },
  authSecondaryBtn: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15,17,26,0.14)",
    backgroundColor: "#FFFFFF",
  },
  authSecondaryLabel: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: colors.ink,
  },
  authBtnPressed: {
    opacity: 0.78,
  },
});
