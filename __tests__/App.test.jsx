import React from "react";
import { render, waitFor } from "@testing-library/react-native";
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
}));

// Screen-mocks: routing-logica testen zonder render-complexiteit van screens
jest.mock("../src/screens/HumorScreen", () => ({
  HumorScreen: ({ initialMemeId, initialStoryId, onInitialStoryConsumed }) => {
    const React = require("react");
    const { Text } = require("react-native");
    React.useEffect(() => {
      if (initialStoryId != null) onInitialStoryConsumed?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return React.createElement(
      Text,
      { testID: "humor-screen" },
      `${initialMemeId ?? ""}:${initialStoryId ?? ""}`
    );
  },
}));

jest.mock("../src/screens/FeedScreen", () => ({
  FeedScreen: () => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "feed-screen" }, "Feed");
  },
}));

jest.mock("../src/screens/AuthScreen", () => ({
  AuthScreen: () => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "auth-screen" }, "Auth");
  },
}));

jest.mock("../src/screens/SearchScreen", () => ({ SearchScreen: () => null }));
jest.mock("../src/screens/ProfileScreen", () => ({
  ProfileScreen: () => null,
}));
jest.mock("../src/screens/DetailScreen", () => ({ DetailScreen: () => null }));
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
