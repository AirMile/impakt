import { useState, useEffect, useCallback, useMemo } from "react";
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
// Per-gewicht imports (subpath) i.p.v. de package-root: anders re-exporteert de
// root álle gewichten + italics en bundelt Metro elke .ttf mee (37 i.p.v. 8).
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue/400Regular";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_500Medium } from "@expo-google-fonts/poppins/500Medium";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
import { Poppins_700Bold } from "@expo-google-fonts/poppins/700Bold";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";

import { AnimatePresence } from "moti";
import { colors } from "./src/theme/tokens";
import {
  getOnboarded,
  getToken,
  setToken,
  clearToken,
} from "./src/storage/prefs";
import { fetchAccount } from "./src/lib/auth/account";
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
import { SavedScreen } from "./src/screens/SavedScreen";
import { SandboxReactionsScreen } from "./src/screens/SandboxReactionsScreen";
import {
  fetchMyTags,
  fetchTags,
  updateMyTags,
  isInterestTag,
} from "./src/lib/tags";
import { fetchArticle } from "./src/lib/articles";
import { fetchMemes } from "./src/lib/memes";
import { fetchSavedArticles, fetchSavedMemes } from "./src/lib/saves";
import { toast } from "./src/lib/toast";

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
  // Altijd true bij start: de spinner blijft staan tot de async token-restore
  // klaar is, zodat we niet kort het welkom-scherm tonen vóór een herstelde sessie.
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("feed");
  const [user, setUser] = useState(null);
  const [myTags, setMyTags] = useState([]);
  const [memes, setMemes] = useState([]);
  const [openStory, setOpenStory] = useState(null);
  const [openStorySource, setOpenStorySource] = useState("feed");
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedMemes, setSavedMemes] = useState([]);
  const [pendingMemeId, setPendingMemeId] = useState(null);
  const [pendingMemeStoryId, setPendingMemeStoryId] = useState(null);
  const [feedCat, setFeedCat] = useState("Voor jou");
  const [authInitialView, setAuthInitialView] = useState("welcome");
  const [authPromptVisible, setAuthPromptVisible] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  const savedIds = useMemo(
    () => new Set(savedArticles.map((a) => a.id)),
    [savedArticles]
  );
  const savedMemeIds = useMemo(
    () => new Set(savedMemes.map((m) => m.id)),
    [savedMemes]
  );

  // Gedeelde thema-selectie = de profiel-interesses (myTags). Eén bron van
  // waarheid: (de)selecteren in feed/happy/zoek wijzigt dezelfde interesses die
  // het profiel toont, server-side opgeslagen via handleMyTagsChange — dus ook na
  // uit-/inloggen bewaard. De feed-filter is hiervan afgeleid.
  const selectedTopics = useMemo(
    () => new Set(myTags.map((tag) => tag.name)),
    [myTags]
  );

  // Tag-catalogus om een aangetikt label (naam) naar het volledige tag-object
  // {id, name, category} te herleiden bij het toevoegen aan de interesses.
  useEffect(() => {
    let cancelled = false;
    fetchTags()
      .then((tags) => {
        if (!cancelled) setAvailableTags(tags);
      })
      .catch(() => {
        if (!cancelled) setAvailableTags([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user?.token) {
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
    // fetchSavedArticles/Memes(undefined) resolven naar [], dus logout (token
    // weg) leegt de lijsten via de async .then — geen synchrone setState in body.
    let cancelled = false;
    fetchSavedArticles(user?.token)
      .then((articles) => {
        if (!cancelled) setSavedArticles(articles);
      })
      .catch(() => {
        if (!cancelled) setSavedArticles([]);
      });
    fetchSavedMemes(user?.token)
      .then((memez) => {
        if (!cancelled) setSavedMemes(memez);
      })
      .catch(() => {
        if (!cancelled) setSavedMemes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  useEffect(() => {
    let cancelled = false;
    // Token meesturen zodat de backend `my_reaction` per meme teruggeeft en een
    // eerdere stem na een refresh weer zichtbaar is. Herlaadt bij login-wissel.
    fetchMemes(undefined, user?.token)
      .then((m) => {
        if (!cancelled) setMemes(m);
      })
      .catch(() => {
        if (!cancelled) setMemes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  useEffect(() => {
    if (!fontsLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        // 1. Persistente sessie herstellen: token → verse user via fetchAccount.
        //    Draait vóór de DEV_FORCE_AUTH-gate, zodat "ingelogd blijven" ook in
        //    dev werkt. setUser triggert de [user?.token]-effects → myTags + saves.
        const token = await getToken();
        if (token) {
          const restored = await fetchAccount(token).catch(() => null);
          if (cancelled) return;
          if (restored?.token) {
            setUser(restored);
            setPhase("app");
            return;
          }
          await clearToken(); // ongeldig/verlopen token opruimen
        }
        // 2. Geen sessie: tokenloze auto-enter op basis van onboarding (in dev
        //    onderdrukt door DEV_FORCE_AUTH, zodat de auth-flow testbaar blijft).
        if (cancelled || DEV_FORCE_AUTH) return;
        const onboarded = await getOnboarded();
        if (!cancelled && onboarded) setPhase("app");
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
            if (s) {
              setOpenStorySource(s.goodNews ? "good" : "feed");
              setOpenStory(s);
            }
          })
          .catch(() => {});
      } else if (parsed.kind === "meme") {
        const meme = memes.find((m) => String(m.id) === String(parsed.id));
        if (meme) {
          setOpenStory(null);
          setTab("humor");
          setPendingMemeId(meme.id);
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
        if (s) {
          setOpenStorySource(s.goodNews ? "good" : "feed");
          setOpenStory(s);
        }
      })
      .catch(() => {});
  }, []);

  const openStoryFromList = useCallback((story, source) => {
    if (!story) return;
    setOpenStorySource(source);
    setOpenStory(story);

    if (story.id == null) return;
    fetchArticle(story.id)
      .then((fresh) => {
        if (!fresh) return;
        setOpenStory((current) =>
          String(current?.id) === String(story.id) ? fresh : current
        );
      })
      .catch(() => {});
  }, []);

  const openMemeForStory = useCallback((memeId, storyId) => {
    setOpenStory(null);
    setTab("humor");
    setPendingMemeId(memeId ?? null);
    setPendingMemeStoryId(storyId);
  }, []);

  const inApp = phase === "app";
  const isGuest = inApp && (!user?.token || user?.guest);
  const requireAuth = useCallback(() => {
    if (!isGuest) return true;
    setAuthPromptVisible(true);
    return false;
  }, [isGuest]);

  // Eén plek voor het wissen van de sessie: token uit storage + alle in-memory
  // gebruikersdata (user, interesses, saves, gedeelde thema-filter). Gebruikt door
  // uitloggen/verwijderen én de guest-wall-route, zodat er niets blijft hangen.
  const clearSession = useCallback(() => {
    clearToken();
    setUser(null);
    setMyTags([]);
    setSavedArticles([]);
    setSavedMemes([]);
  }, []);

  const openAuth = useCallback(
    (view) => {
      setAuthPromptVisible(false);
      setShowProfile(false);
      setShowSearch(false);
      setOpenStory(null);
      setAuthInitialView(view);
      clearSession();
      setPhase("welcome");
    },
    [clearSession]
  );

  const handleSearch = useCallback(() => setShowSearch(true), []);
  const handleProfile = useCallback(() => {
    if (!requireAuth()) return;
    setShowProfile(true);
  }, [requireAuth]);
  const handleOpenSaved = useCallback(() => setShowSaved(true), []);
  // Artikelen: optimistic add/remove van één story. Robuust ongeacht wat het
  // save-endpoint teruggeeft ({ saved: true }, geen savedArticles-lijst) — zelfde
  // patroon als memes, zodat de bewaar-flows consistent zijn.
  const handleSavedChange = useCallback((story, nextSaved) => {
    setSavedArticles((current) => {
      const without = current.filter((a) => a.id !== story.id);
      return nextSaved ? [story, ...without] : without;
    });
  }, []);
  // Memes: optimistic add/remove van één meme. Robuust ongeacht wat het
  // save-endpoint teruggeeft (de respons-shape voor memes is nog onbekend).
  const handleSavedMemesChange = useCallback((meme, nextSaved) => {
    setSavedMemes((current) => {
      const without = current.filter((m) => m.id !== meme.id);
      return nextSaved ? [meme, ...without] : without;
    });
  }, []);

  const handleMyTagsChange = useCallback(
    (nextTags) => {
      const previous = myTags;
      setMyTags(nextTags);

      if (!user?.token) return;

      updateMyTags(
        user.token,
        nextTags.map((tag) => tag.id)
      )
        .then((updated) => setMyTags(updated.filter(isInterestTag)))
        .catch((err) => {
          setMyTags(previous);
          toast.show(err.message || "Tags bijwerken mislukt.");
        });
    },
    [myTags, user?.token]
  );

  // Feed/happy/zoek-chip (de)selecteren = interesse toevoegen/verwijderen, met
  // dezelfde backend-sync als het profiel. Verwijderen kan op naam (myTags bevat
  // het id al); toevoegen herleidt het tag-object uit de catalogus.
  const toggleTopic = useCallback(
    (label) => {
      const selected = myTags.some((tag) => tag.name === label);
      if (selected) {
        handleMyTagsChange(myTags.filter((tag) => tag.name !== label));
        return;
      }
      const tag = availableTags.find((t) => t.name === label);
      if (!tag) return;
      handleMyTagsChange([...myTags, tag]);
    },
    [myTags, availableTags, handleMyTagsChange]
  );

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
            onComplete={(u, _topics, syncedTags = []) => {
              setUser(u);
              setMyTags(syncedTags);
              if (u?.token) setToken(u.token);
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
                onOpen={(story) => openStoryFromList(story, "feed")}
                cat={feedCat}
                onCatChange={setFeedCat}
                myTags={myTags}
                onMyTagsChange={handleMyTagsChange}
                selectedTopics={selectedTopics}
                onToggleTopic={toggleTopic}
                onRequireAuth={requireAuth}
                token={user?.token}
                savedIds={savedIds}
                onSavedChange={handleSavedChange}
              />
            </View>
            <View style={[styles.tab, tab !== "good" && styles.hidden]}>
              <HappyFeedScreen
                onOpen={(story) => openStoryFromList(story, "good")}
                onProfile={handleProfile}
                myTags={myTags}
                onMyTagsChange={handleMyTagsChange}
                selectedTopics={selectedTopics}
                onToggleTopic={toggleTopic}
                onRequireAuth={requireAuth}
                token={user?.token}
                savedIds={savedIds}
                onSavedChange={handleSavedChange}
              />
            </View>
            <View style={[styles.tab, tab !== "humor" && styles.hidden]}>
              <HumorScreen
                initialMemeId={pendingMemeId}
                initialStoryId={pendingMemeStoryId}
                onInitialStoryConsumed={() => {
                  setPendingMemeId(null);
                  setPendingMemeStoryId(null);
                }}
                onOpenStory={openStoryById}
                memes={memes}
                onRequireAuth={requireAuth}
                token={user?.token}
                savedMemeIds={savedMemeIds}
                onSavedMemesChange={handleSavedMemesChange}
              />
            </View>
          </>
        )}

        {/* Overlays — conditional (bewuste keuze: eigen data per open) */}
        {inApp && showProfile && (
          <ProfileScreen
            user={user}
            onUserUpdate={setUser}
            savedArticlesCount={savedArticles.length}
            savedMemesCount={savedMemes.length}
            onOpenSaved={handleOpenSaved}
            onClose={() => setShowProfile(false)}
            onLogout={() => {
              clearSession();
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
              openStoryFromList(s, tab);
            }}
            myTags={myTags}
            onMyTagsChange={handleMyTagsChange}
            selectedTopics={selectedTopics}
            onToggleTopic={toggleTopic}
            onRequireAuth={requireAuth}
            token={user?.token}
            savedIds={savedIds}
            onSavedChange={handleSavedChange}
          />
        )}
        {inApp && showSaved && (
          <SavedScreen
            savedArticles={savedArticles}
            savedMemes={savedMemes}
            onClose={() => setShowSaved(false)}
            onOpen={(s) => {
              setShowSaved(false);
              setOpenStory(s);
            }}
            onOpenMeme={(storyId) => {
              setShowSaved(false);
              openMemeForStory(storyId);
            }}
            onRequireAuth={requireAuth}
            token={user?.token}
            savedIds={savedIds}
            onSavedChange={handleSavedChange}
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
              onSwapStory={(story) => openStoryFromList(story, openStorySource)}
              tab={tab}
              feedCat={feedCat}
              onCatChange={setFeedCat}
              onNav={navTab}
              onProfile={handleProfile}
              onSearch={handleSearch}
              activeTab={tab}
              myTags={myTags}
              onMyTagsChange={handleMyTagsChange}
              sourceTab={openStorySource}
              onRequireAuth={requireAuth}
              token={user?.token}
              savedIds={savedIds}
              onSavedChange={handleSavedChange}
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
