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
      tags: [{ id: 6, name: "Natuur", category: "topic" }],
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
      tags: [{ id: 5, name: "Sport", category: "navigation" }],
      body: [],
      reactions: { smile: 3, meh: 8, frown: 1 },
    },
  ]),
}));

jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));

jest.mock("../../src/lib/reactions", () => ({
  submitArticleReaction: jest.fn(),
  removeArticleReaction: jest.fn(),
  fetchArticleMyReaction: jest.fn().mockResolvedValue(null),
}));

jest.mock("../../src/lib/saves", () => ({
  saveArticle: jest.fn().mockResolvedValue({ user: { savedArticles: [] } }),
  unsaveArticle: jest.fn().mockResolvedValue({ user: { savedArticles: [] } }),
  mapSavedFromResponse: jest.fn(() => []),
}));

jest.mock("../../src/lib/tags", () => ({
  isInterestTag: jest.requireActual("../../src/lib/tags").isInterestTag,
  fetchTags: jest.fn().mockResolvedValue([
    { id: 18, name: "Goed nieuws", category: "flag" },
    { id: 2, name: "Politiek", category: "navigation" },
    { id: 5, name: "Sport", category: "navigation" },
    { id: 6, name: "Natuur", category: "topic" },
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

test("normale feed verbergt goodNews articles bij geen filter", async () => {
  const { findByText, queryByText } = render(<FeedScreen {...defaultProps} />);
  await findByText("Slecht sportverhaal");
  expect(queryByText("Goed klimaatverhaal")).toBeNull();
});

test("Goed nieuws flag wordt niet als topic-chip getoond", async () => {
  const { findByText, queryByText } = render(<FeedScreen {...defaultProps} />);
  await findByText("Slecht sportverhaal");
  expect(queryByText("Goed nieuws")).toBeNull();
});

test("embedded goodNewsOnly=false toont normale artikelen", async () => {
  const { findByText } = render(<FeedScreen {...defaultProps} />);
  await findByText("Slecht sportverhaal");
});

test("goodNewsOnly=true toont alleen goodNews stories", async () => {
  const { findByText, queryByText } = render(
    <FeedScreen {...defaultProps} goodNewsOnly />
  );
  await findByText("Goed klimaatverhaal");
  expect(queryByText("Slecht sportverhaal")).toBeNull();
});

test("topicfilter op tag-naam filtert articles", async () => {
  const { getByText, queryByText, findAllByText } = render(
    <FeedScreen {...defaultProps} />
  );
  const sportNodes = await findAllByText("Sport");
  // Eerste hit is de chip in de topic-rij (bovenaan in DOM-volgorde)
  fireEvent.press(sportNodes[0]);
  await waitFor(() => expect(queryByText("Goed klimaatverhaal")).toBeNull());
  expect(getByText("Slecht sportverhaal")).toBeTruthy();
});

test("topicfilter is lokaal en synct interesses niet naar de parent", async () => {
  // Feed-chips zijn een view-filter, geen profielwijziging: geen server-sync.
  const onMyTagsChange = jest.fn();
  const { findAllByText } = render(
    <FeedScreen {...defaultProps} onMyTagsChange={onMyTagsChange} />
  );

  const sportNodes = await findAllByText("Sport");
  fireEvent.press(sportNodes[0]);

  expect(onMyTagsChange).not.toHaveBeenCalled();
});

test("myTags-interesses staan voorgeselecteerd en filteren de feed bij openen", async () => {
  const { fetchArticles } = require("../../src/lib/articles");
  fetchArticles.mockResolvedValueOnce([
    {
      id: 11,
      goodNews: false,
      title: "Sportverhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "10:00",
      views: "1k",
      readers: "1k",
      trending: false,
      tags: [{ id: 5, name: "Sport", category: "navigation" }],
      body: [],
      reactions: { smile: 0, meh: 0, frown: 0 },
    },
    {
      id: 12,
      goodNews: false,
      title: "Natuurverhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "11:00",
      views: "1k",
      readers: "1k",
      trending: false,
      tags: [{ id: 6, name: "Natuur", category: "topic" }],
      body: [],
      reactions: { smile: 0, meh: 0, frown: 0 },
    },
  ]);

  const { findByText, queryByText } = render(
    <FeedScreen
      {...defaultProps}
      myTags={[{ id: 5, name: "Sport", category: "navigation" }]}
    />
  );

  // Sport is een opgeslagen interesse → voorgeselecteerd → feed toont alleen Sport.
  await findByText("Sportverhaal");
  expect(queryByText("Natuurverhaal")).toBeNull();
});

test("gedeelde selectie (controlled): prop filtert, klik meldt aan onToggleTopic", async () => {
  const { fetchArticles } = require("../../src/lib/articles");
  fetchArticles.mockResolvedValueOnce([
    {
      id: 21,
      goodNews: false,
      title: "Sportverhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "10:00",
      views: "1k",
      readers: "1k",
      trending: false,
      tags: [{ id: 5, name: "Sport", category: "navigation" }],
      body: [],
      reactions: { smile: 0, meh: 0, frown: 0 },
    },
    {
      id: 22,
      goodNews: false,
      title: "Natuurverhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "11:00",
      views: "1k",
      readers: "1k",
      trending: false,
      tags: [{ id: 6, name: "Natuur", category: "topic" }],
      body: [],
      reactions: { smile: 0, meh: 0, frown: 0 },
    },
  ]);

  const onToggleTopic = jest.fn();
  const { findByText, queryByText, findAllByText } = render(
    <FeedScreen
      {...defaultProps}
      selectedTopics={new Set(["Sport"])}
      onToggleTopic={onToggleTopic}
    />
  );

  // De doorgegeven (gedeelde) selectie bepaalt het filter.
  await findByText("Sportverhaal");
  expect(queryByText("Natuurverhaal")).toBeNull();

  // Klikken meldt aan de parent i.p.v. lokale state te wijzigen.
  const natuurNodes = await findAllByText("Natuur");
  fireEvent.press(natuurNodes[0]);
  expect(onToggleTopic).toHaveBeenCalledWith("Natuur");
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
  const card = await findByText("Slecht sportverhaal");
  fireEvent.press(card);
  expect(onOpen).toHaveBeenCalledTimes(1);
  expect(onOpen.mock.calls[0][0].id).toBe(2);
});

test("guest-interactie triggert auth prompt en deelt niet", async () => {
  const { shareStory } = require("../../src/lib/share");
  const onRequireAuth = jest.fn(() => false);
  const { findByText, getAllByLabelText } = render(
    <FeedScreen {...defaultProps} onRequireAuth={onRequireAuth} />
  );

  await findByText("Slecht sportverhaal");
  fireEvent.press(getAllByLabelText("Delen")[0]);

  expect(onRequireAuth).toHaveBeenCalledTimes(1);
  expect(shareStory).not.toHaveBeenCalled();
});

test("save-knop roept saveArticle aan met token en synct terug", async () => {
  const { saveArticle } = require("../../src/lib/saves");
  const onSavedChange = jest.fn();
  const { findByText, getAllByLabelText } = render(
    <FeedScreen
      {...defaultProps}
      token="tok123"
      savedIds={new Set()}
      onSavedChange={onSavedChange}
    />
  );

  await findByText("Slecht sportverhaal");
  fireEvent.press(getAllByLabelText("Bewaren")[0]);

  await waitFor(() => expect(saveArticle).toHaveBeenCalledWith("tok123", 2));
  // Optimistic-lokaal: meldt het story-object + true aan de parent (geen lijst).
  expect(onSavedChange).toHaveBeenCalledWith(
    expect.objectContaining({ id: 2 }),
    true
  );
});

test("save-knop als gast triggert auth prompt en bewaart niet", async () => {
  const { saveArticle } = require("../../src/lib/saves");
  const onRequireAuth = jest.fn(() => false);
  const { findByText, getAllByLabelText } = render(
    <FeedScreen
      {...defaultProps}
      token="tok123"
      savedIds={new Set()}
      onRequireAuth={onRequireAuth}
    />
  );

  await findByText("Slecht sportverhaal");
  fireEvent.press(getAllByLabelText("Bewaren")[0]);

  expect(onRequireAuth).toHaveBeenCalled();
  expect(saveArticle).not.toHaveBeenCalled();
});

test("myTags prop rendert chips voor mijn interesses + overige", async () => {
  const { findAllByText } = render(
    <FeedScreen
      {...defaultProps}
      myTags={[{ id: 6, name: "Natuur", category: "topic" }]}
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

test("switchen na stemmen verplaatst de stem en POST't de nieuwe reactie", async () => {
  const { fetchArticles } = require("../../src/lib/articles");
  const {
    submitArticleReaction,
    removeArticleReaction,
  } = require("../../src/lib/reactions");
  submitArticleReaction.mockResolvedValue({ message: "ok" });
  removeArticleReaction.mockResolvedValue({ message: "ok" });
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

  // Eerste stem: smile → {1,0,0}. Geen DELETE want er was nog geen stem.
  fireEvent.press(getByLabelText("Blij"));
  await waitFor(() =>
    expect(submitArticleReaction).toHaveBeenLastCalledWith("tok123", 9, "smile")
  );
  expect(removeArticleReaction).not.toHaveBeenCalled();

  // Switch naar frown → eerst oude stem verwijderen, dan nieuwe POST'en.
  fireEvent.press(getByLabelText("Verdrietig"));
  await waitFor(() =>
    expect(submitArticleReaction).toHaveBeenLastCalledWith("tok123", 9, "frown")
  );
  expect(removeArticleReaction).toHaveBeenCalledWith("tok123", 9);

  // Nu is frown 100% en de andere twee 0%.
  expect(getByText("100%")).toBeTruthy();
  expect(getAllByText("0%")).toHaveLength(2);
});

test("toont de bewaarde stem na een refresh (via my-reaction route)", async () => {
  const { fetchArticles } = require("../../src/lib/articles");
  const { fetchArticleMyReaction } = require("../../src/lib/reactions");
  // De backend levert de eerdere stem via de aparte my-reaction-route, niet in
  // de lijst → na het ophalen springt de rail naar percentages.
  fetchArticleMyReaction.mockResolvedValue("smile");
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
      reactions: { smile: 7, meh: 2, frown: 1 },
    },
  ]);

  const { findByText, getByText, getAllByText } = render(
    <FeedScreen {...defaultProps} token="tok123" />
  );
  await findByText("Vers verhaal");

  // reactionPct({7,2,1}) = 70/20/10, zichtbaar zodra de my-reaction-call terug is.
  await waitFor(() => expect(getByText("70%")).toBeTruthy());
  expect(getByText("20%")).toBeTruthy();
  expect(getByText("10%")).toBeTruthy();
  expect(getAllByText(/%$/)).toHaveLength(3);
  expect(fetchArticleMyReaction).toHaveBeenCalledWith("tok123", 9);
});
