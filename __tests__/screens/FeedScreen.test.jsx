import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { FeedScreen } from "../../src/screens/FeedScreen";

jest.mock("../../src/lib/articles", () => ({
  fetchArticles: jest.fn().mockResolvedValue([
    {
      id: 1,
      goodNews: true,
      title: "Goed klimaatverhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "10:00",
      views: "1k",
      readers: "1k",
      trending: false,
      tags: [{ id: 6, name: "Natuur", category: "natuur" }],
      body: [],
      reactions: { smile: 10, meh: 5, frown: 2 },
    },
    {
      id: 2,
      goodNews: false,
      title: "Slecht sportverhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "11:00",
      views: "2k",
      readers: "2k",
      trending: false,
      tags: [{ id: 5, name: "Sport", category: "sport" }],
      body: [],
      reactions: { smile: 3, meh: 8, frown: 1 },
    },
  ]),
}));

jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));

jest.mock("../../src/lib/reactions", () => ({
  submitArticleReaction: jest.fn(),
}));

jest.mock("../../src/lib/tags", () => ({
  isInterestTag: jest.requireActual("../../src/lib/tags").isInterestTag,
  fetchTags: jest.fn().mockResolvedValue([
    { id: 2, name: "Politiek", category: "politiek" },
    { id: 5, name: "Sport", category: "sport" },
    { id: 6, name: "Natuur", category: "natuur" },
  ]),
  fetchMyTags: jest.fn().mockResolvedValue([]),
}));

const defaultProps = {
  onOpen: jest.fn(),
  onNav: jest.fn(),
  onSearch: jest.fn(),
  onProfile: jest.fn(),
  activeTab: "feed",
  cat: "Voor jou",
  onCatChange: jest.fn(),
  embedded: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("rendert alle articles bij geen filter", async () => {
  const { findByText, getByText } = render(<FeedScreen {...defaultProps} />);
  await findByText("Goed klimaatverhaal");
  expect(getByText("Slecht sportverhaal")).toBeTruthy();
});

test("goodNewsOnly=true toont alleen goodNews stories", async () => {
  const { findByText, queryByText } = render(
    <FeedScreen {...defaultProps} goodNewsOnly />
  );
  await findByText("Goed klimaatverhaal");
  expect(queryByText("Slecht sportverhaal")).toBeNull();
});

test("topicfilter op category filtert articles", async () => {
  const { getByText, queryByText, findAllByText } = render(
    <FeedScreen {...defaultProps} />
  );
  const sportNodes = await findAllByText("Sport");
  // Eerste hit is de chip in de topic-rij (bovenaan in DOM-volgorde)
  fireEvent.press(sportNodes[0]);
  await waitFor(() => expect(queryByText("Goed klimaatverhaal")).toBeNull());
  expect(getByText("Slecht sportverhaal")).toBeTruthy();
});

test("excludeId verwijdert article uit lijst", async () => {
  const { findByText, queryByText } = render(
    <FeedScreen {...defaultProps} excludeId={1} />
  );
  await findByText("Slecht sportverhaal");
  expect(queryByText("Goed klimaatverhaal")).toBeNull();
});

test("onOpen wordt aangeroepen bij tap op kaart", async () => {
  const onOpen = jest.fn();
  const { findByText } = render(
    <FeedScreen {...defaultProps} onOpen={onOpen} />
  );
  const card = await findByText("Goed klimaatverhaal");
  fireEvent.press(card);
  expect(onOpen).toHaveBeenCalledTimes(1);
  expect(onOpen.mock.calls[0][0].id).toBe(1);
});

test("guest-interactie triggert auth prompt en deelt niet", async () => {
  const { shareStory } = require("../../src/lib/share");
  const onRequireAuth = jest.fn(() => false);
  const { findByText, getAllByLabelText } = render(
    <FeedScreen {...defaultProps} onRequireAuth={onRequireAuth} />
  );

  await findByText("Goed klimaatverhaal");
  fireEvent.press(getAllByLabelText("Delen")[0]);

  expect(onRequireAuth).toHaveBeenCalledTimes(1);
  expect(shareStory).not.toHaveBeenCalled();
});

test("myTags prop rendert chips voor mijn interesses + overige", async () => {
  const { findAllByText } = render(
    <FeedScreen
      {...defaultProps}
      myTags={[{ id: 6, name: "Natuur", category: "natuur" }]}
    />
  );

  // Natuur staat zowel als chip als als tag-label van een artikel
  const natuur = await findAllByText("Natuur");
  expect(natuur.length).toBeGreaterThanOrEqual(1);
  const politiek = await findAllByText("Politiek");
  expect(politiek.length).toBeGreaterThanOrEqual(1);
  const sport = await findAllByText("Sport");
  expect(sport.length).toBeGreaterThanOrEqual(1);
});

test("first reactor: stemmen op story zonder reacties toont 100%", async () => {
  const { fetchArticles } = require("../../src/lib/articles");
  const { submitArticleReaction } = require("../../src/lib/reactions");
  submitArticleReaction.mockResolvedValue({ message: "ok" });
  // Geïsoleerde fixture: één story met counts {0,0,0} → precies één "Blij"-knop.
  fetchArticles.mockResolvedValueOnce([
    {
      id: 9,
      goodNews: false,
      title: "Vers verhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "12:00",
      views: "0",
      readers: "0",
      trending: false,
      tags: [],
      body: [],
      reactions: { smile: 0, meh: 0, frown: 0 },
    },
  ]);

  const { findByText, getByLabelText, getByText, getAllByText } = render(
    <FeedScreen {...defaultProps} token="tok123" />
  );
  await findByText("Vers verhaal");

  fireEvent.press(getByLabelText("Blij"));

  await waitFor(() =>
    expect(submitArticleReaction).toHaveBeenCalledWith("tok123", 9, "smile")
  );

  // counts {0,0,0} + optimistische +1 op smile = {1,0,0}, total 1.
  expect(getByText("100%")).toBeTruthy();
  expect(getAllByText("0%")).toHaveLength(2);
});
