import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
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

import { colors } from "./src/theme/tokens";
import { FEED_STORIES } from "./src/data/feed";
import { getOnboarded } from "./src/storage/prefs";

import { FeedScreen } from "./src/screens/FeedScreen";
import { DetailScreen } from "./src/screens/DetailScreen";
import { HumorScreen } from "./src/screens/HumorScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";

const DEV_FORCE_AUTH = __DEV__;

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
  const [topics, setTopics] = useState([]);
  const [openStory, setOpenStory] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [pendingMemeStoryId, setPendingMemeStoryId] = useState(null);
  const [feedCat, setFeedCat] = useState("Voor jou");

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

  if (!fontsLoaded || authLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  const navTab = (t) => {
    setOpenStory(null);
    setTab(t);
  };

  const openStoryById = (id) => {
    const s = FEED_STORIES.find((x) => x.id === id);
    if (s) setOpenStory(s);
  };

  const openMemeForStory = (storyId) => {
    setOpenStory(null);
    setTab("humor");
    setPendingMemeStoryId(storyId);
  };

  const commonProps = {
    onNav: navTab,
    onSearch: () => setShowSearch(true),
    onProfile: () => setShowProfile(true),
    activeTab: tab,
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar
          style={phase === "app" && tab === "humor" ? "light" : "dark"}
        />
        {phase !== "app" && (
          <AuthScreen
            initialView="welcome"
            onComplete={(u, selectedTopics) => {
              setUser(u);
              if (selectedTopics) setTopics(selectedTopics);
              setPhase("app");
            }}
          />
        )}
        {phase === "app" && tab === "feed" && (
          <FeedScreen
            {...commonProps}
            onOpen={setOpenStory}
            cat={feedCat}
            onCatChange={setFeedCat}
          />
        )}
        {phase === "app" && tab === "humor" && (
          <HumorScreen
            onNav={navTab}
            onSearch={() => setShowSearch(true)}
            onProfile={() => setShowProfile(true)}
            activeTab={tab}
            initialStoryId={pendingMemeStoryId}
            onInitialStoryConsumed={() => setPendingMemeStoryId(null)}
            onOpenStory={openStoryById}
          />
        )}
        {phase === "app" && showProfile && (
          <ProfileScreen
            user={user}
            onClose={() => setShowProfile(false)}
            onLogout={() => {
              setShowProfile(false);
              setPhase("welcome");
            }}
          />
        )}
        {phase === "app" && showSearch && (
          <SearchScreen
            onClose={() => setShowSearch(false)}
            onOpenStory={(s) => {
              setShowSearch(false);
              setOpenStory(s);
            }}
          />
        )}
        {phase === "app" && openStory && (
          <DetailScreen
            key={openStory.id}
            story={openStory}
            onClose={() => setOpenStory(null)}
            onOpenMeme={openMemeForStory}
            onSwapStory={setOpenStory}
            tab={tab}
            feedCat={feedCat}
            onCatChange={setFeedCat}
            onNav={navTab}
            onProfile={() => setShowProfile(true)}
            onSearch={() => setShowSearch(true)}
            activeTab={tab}
          />
        )}
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
});
