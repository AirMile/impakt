import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { Linking } from "react-native";
import App from "../App";

jest.mock("../src/api/mock", () => ({
  CATEGORIES: ["Voor jou", "Sport"],
}));

jest.mock("../src/lib/memes", () => ({
  fetchMemes: jest.fn().mockResolvedValue([
    {
      id: "m1",
      storyId: 102,
      img: "",
      top: "Top",
      bot: "Bot",
      reactions: { smile: 0, meh: 0, frown: 0 },
      likes: 0,
      storyHeadline: "H",
      storyTeaser: "",
      storySource: "Impakt",
    },
  ]),
}));

jest.mock("../src/lib/tags", () => ({
  isInterestTag: jest.requireActual("../src/lib/tags").isInterestTag,
  fetchTags: jest.fn().mockResolvedValue([]),
  fetchMyTags: jest.fn().mockResolvedValue([]),
  updateMyTags: jest.fn().mockResolvedValue([]),
}));

jest.mock("../src/lib/articles", () => ({
  fetchArticles: jest.fn().mockResolvedValue([]),
  fetchArticle: jest.fn().mockResolvedValue(null),
  fetchHappyFeed: jest.fn().mockResolvedValue([]),
}));

jest.mock("../src/storage/prefs", () => ({
  getOnboarded: jest.fn().mockResolvedValue(false),
  setOnboarded: jest.fn().mockResolvedValue(undefined),
  setPreferences: jest.fn().mockResolvedValue(undefined),
  getToken: jest.fn().mockResolvedValue(null),
  setToken: jest.fn().mockResolvedValue(undefined),
  clearToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/lib/auth/account", () => ({
  API_BASE_URL: "http://145.24.237.97/api",
  fetchAccount: jest.fn().mockResolvedValue(null),
}));

// Screen-mocks: routing-logica testen zonder render-complexiteit van screens
jest.mock("../src/screens/HumorScreen", () => ({
  HumorScreen: ({ initialMemeId, initialStoryId, onInitialStoryConsumed }) => {
    const React = require("react");
    const { Text } = require("react-native");
    // Onthoud de eerste niet-lege deep-link-waarde: na consume zet de parent de
    // pending-props weer op null, maar de assertie moet de geopende meme zien.
    const seen = React.useRef(null);
    if (
      seen.current == null &&
      (initialMemeId != null || initialStoryId != null)
    ) {
      seen.current = `${initialMemeId ?? ""}:${initialStoryId ?? ""}`;
    }
    React.useEffect(() => {
      if (initialStoryId != null) onInitialStoryConsumed?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return React.createElement(
      Text,
      { testID: "humor-screen" },
      seen.current ?? `${initialMemeId ?? ""}:${initialStoryId ?? ""}`
    );
  },
}));

jest.mock("../src/screens/FeedScreen", () => ({
  FeedScreen: ({ onToggleTopic }) => {
    const React = require("react");
    const { Text, Pressable } = require("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, { testID: "feed-screen" }, "Feed"),
      React.createElement(
        Pressable,
        { testID: "toggle-sport", onPress: () => onToggleTopic?.("Sport") },
        React.createElement(Text, null, "toggle")
      )
    );
  },
}));

jest.mock("../src/screens/AuthScreen", () => ({
  AuthScreen: () => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "auth-screen" }, "Auth");
  },
}));

jest.mock("../src/screens/SearchScreen", () => ({
  SearchScreen: ({ onOpenStory }) => {
    const React = require("react");
    const { Text, Pressable } = require("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, { testID: "search-screen" }, "Search"),
      React.createElement(
        Pressable,
        {
          testID: "search-open-story",
          onPress: () => onOpenStory?.({ id: 102, headline: "X" }),
        },
        React.createElement(Text, null, "open")
      )
    );
  },
}));
jest.mock("../src/screens/ProfileScreen", () => ({
  ProfileScreen: () => null,
}));
jest.mock("../src/screens/DetailScreen", () => ({
  DetailScreen: ({ onClose }) => {
    const React = require("react");
    const { Text, Pressable } = require("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, { testID: "detail-screen" }, "Detail"),
      React.createElement(
        Pressable,
        { testID: "detail-back", onPress: () => onClose?.() },
        React.createElement(Text, null, "back")
      )
    );
  },
}));
jest.mock("../src/components/Toast", () => ({ ToastHost: () => null }));

beforeEach(() => {
  jest.clearAllMocks();
  Linking.getInitialURL.mockResolvedValue(null);
  Linking.addEventListener.mockReturnValue({ remove: jest.fn() });
});

test("deep-link impakt://meme/m1 zet tab op humor en toont HumorScreen", async () => {
  Linking.getInitialURL.mockResolvedValue("impakt://meme/m1");
  const { getByTestId } = render(<App />);
  await waitFor(() => expect(getByTestId("humor-screen")).toBeTruthy());
  expect(getByTestId("humor-screen").props.children).toBe("m1:102");
});

test("zonder deep-link URL wordt AuthScreen getoond (phase=welcome)", async () => {
  const { getByTestId } = render(<App />);
  await waitFor(() => expect(getByTestId("auth-screen")).toBeTruthy());
});

test("persistent token herstelt de sessie: app i.p.v. auth-scherm", async () => {
  const { getToken } = require("../src/storage/prefs");
  const { fetchAccount } = require("../src/lib/auth/account");
  getToken.mockResolvedValueOnce("tok123");
  fetchAccount.mockResolvedValueOnce({
    id: 7,
    username: "bb",
    token: "tok123",
  });

  const { getByTestId, queryByTestId } = render(<App />);

  await waitFor(() => expect(getByTestId("feed-screen")).toBeTruthy());
  expect(fetchAccount).toHaveBeenCalledWith("tok123");
  expect(queryByTestId("auth-screen")).toBeNull();
});

test("back vanuit een via zoeken geopend artikel keert terug naar zoeken (niet de tab eronder)", async () => {
  const { getToken } = require("../src/storage/prefs");
  const { fetchAccount } = require("../src/lib/auth/account");
  const { fetchArticle } = require("../src/lib/articles");
  getToken.mockResolvedValueOnce("tok123");
  fetchAccount.mockResolvedValueOnce({
    id: 7,
    username: "bb",
    token: "tok123",
  });
  fetchArticle.mockResolvedValue({ id: 102, headline: "X" });

  const { getByTestId, getByLabelText, queryByTestId } = render(<App />);
  await waitFor(() => expect(getByTestId("feed-screen")).toBeTruthy());

  // Naar de humor-tab — dit is de "pagina eronder" waar de bug ten onrechte op terugviel.
  fireEvent.press(getByLabelText("Humor"));
  await waitFor(() => expect(getByTestId("humor-screen")).toBeTruthy());

  // Zoeken openen en een artikel openen vanuit de zoekresultaten.
  fireEvent.press(getByLabelText("Zoeken"));
  await waitFor(() => expect(getByTestId("search-screen")).toBeTruthy());
  fireEvent.press(getByTestId("search-open-story"));
  await waitFor(() => expect(getByTestId("detail-screen")).toBeTruthy());
  expect(queryByTestId("search-screen")).toBeNull();

  // Back → terug naar zoeken, niet de humor-tab eronder.
  fireEvent.press(getByTestId("detail-back"));
  await waitFor(() => expect(getByTestId("search-screen")).toBeTruthy());
  expect(queryByTestId("detail-screen")).toBeNull();
});

test("tab wisselen terwijl een via-zoeken geopend artikel open is, heropent zoeken niet", async () => {
  const { getToken } = require("../src/storage/prefs");
  const { fetchAccount } = require("../src/lib/auth/account");
  const { fetchArticle } = require("../src/lib/articles");
  getToken.mockResolvedValueOnce("tok123");
  fetchAccount.mockResolvedValueOnce({
    id: 7,
    username: "bb",
    token: "tok123",
  });
  fetchArticle.mockResolvedValue({ id: 102, headline: "X" });

  const { getByTestId, getByLabelText, queryByTestId } = render(<App />);
  await waitFor(() => expect(getByTestId("feed-screen")).toBeTruthy());

  // Open een artikel vanuit zoeken (zet de "kwam-van-zoeken"-vlag).
  fireEvent.press(getByLabelText("Zoeken"));
  await waitFor(() => expect(getByTestId("search-screen")).toBeTruthy());
  fireEvent.press(getByTestId("search-open-story"));
  await waitFor(() => expect(getByTestId("detail-screen")).toBeTruthy());

  // Tab wisselen (navTab) i.p.v. back: sluit het artikel zónder zoeken te heropenen.
  fireEvent.press(getByLabelText("Humor"));
  await waitFor(() => expect(getByTestId("humor-screen")).toBeTruthy());
  expect(queryByTestId("detail-screen")).toBeNull();
  expect(queryByTestId("search-screen")).toBeNull();
});

test("thema selecteren in de feed synct naar de interesses (updateMyTags)", async () => {
  const { getToken } = require("../src/storage/prefs");
  const { fetchAccount } = require("../src/lib/auth/account");
  const { fetchTags, updateMyTags } = require("../src/lib/tags");
  getToken.mockResolvedValueOnce("tok123");
  fetchAccount.mockResolvedValueOnce({
    id: 7,
    username: "bb",
    token: "tok123",
  });
  fetchTags.mockResolvedValueOnce([
    { id: 5, name: "Sport", category: "sport" },
  ]);

  const { getByTestId } = render(<App />);
  await waitFor(() => expect(getByTestId("feed-screen")).toBeTruthy());

  // Feed-chip toggelen = interesse toevoegen → server-sync via PUT { tag_ids }.
  await waitFor(() => {
    fireEvent.press(getByTestId("toggle-sport"));
    expect(updateMyTags).toHaveBeenCalledWith("tok123", [5]);
  });
});
