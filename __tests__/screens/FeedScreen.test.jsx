import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { FeedScreen } from "../../src/screens/FeedScreen";

// Controleerbare testdata, zodat we filters precies kunnen verifiëren
jest.mock("../../src/api/mock", () => ({
  STORIES: [
    {
      id: 1,
      cat: "Klimaat",
      goodNews: true,
      title: "Goed klimaatverhaal",
      sub: "...",
      img: "",
      date: "1 jun",
      time: "10:00",
      views: "1k",
      readers: 100,
      trending: false,
      tags: [],
      body: [],
      reactions: { smile: 10, meh: 5, frown: 2 },
    },
    {
      id: 2,
      cat: "Sport",
      goodNews: false,
      title: "Slecht sportverhaal",
      sub: "...",
      img: "",
      date: "1 jun",
      time: "11:00",
      views: "2k",
      readers: 200,
      trending: false,
      tags: [],
      body: [],
      reactions: { smile: 3, meh: 8, frown: 1 },
    },
  ],
  MEMES: [],
  CATEGORIES: ["Voor jou", "Klimaat", "Sport"],
}));

// Deel van andere modules mocken die FeedScreen nodig heeft
jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));

jest.mock("../../src/lib/tags", () => ({
  fetchTags: jest.fn().mockResolvedValue([
    { id: 2, name: "Politiek", category: "politiek" },
    { id: 5, name: "Sport", category: "sport" },
    { id: 6, name: "Natuur", category: "natuur" },
  ]),
  fetchMyTags: jest.fn().mockResolvedValue([]),
}));

const flushAsync = () => act(() => Promise.resolve());

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

test("rendert alle stories bij cat=Voor jou", () => {
  const { getByText } = render(<FeedScreen {...defaultProps} />);
  expect(getByText("Goed klimaatverhaal")).toBeTruthy();
  expect(getByText("Slecht sportverhaal")).toBeTruthy();
});

test("goodNewsOnly=true toont alleen goodNews stories", () => {
  const { getByText, queryByText } = render(
    <FeedScreen {...defaultProps} goodNewsOnly />
  );
  expect(getByText("Goed klimaatverhaal")).toBeTruthy();
  expect(queryByText("Slecht sportverhaal")).toBeNull();
});

test("topicfilter filtert op categorie", async () => {
  const { getByText, queryByText, findByText } = render(
    <FeedScreen {...defaultProps} />
  );
  await findByText("Sport");
  fireEvent.press(getByText("Sport"));
  await waitFor(() => expect(queryByText("Goed klimaatverhaal")).toBeNull());
  expect(getByText("Slecht sportverhaal")).toBeTruthy();
});

test("excludeId verwijdert story uit lijst", () => {
  const { queryByText } = render(
    <FeedScreen {...defaultProps} excludeId={1} />
  );
  expect(queryByText("Goed klimaatverhaal")).toBeNull();
});

test("onOpen wordt aangeroepen bij tap op kaart", () => {
  const onOpen = jest.fn();
  const { getByText } = render(
    <FeedScreen {...defaultProps} onOpen={onOpen} />
  );
  fireEvent.press(getByText("Goed klimaatverhaal"));
  expect(onOpen).toHaveBeenCalledTimes(1);
  expect(onOpen.mock.calls[0][0].id).toBe(1);
});

test("myTags prop rendert chips voor mijn interesses + overige", async () => {
  const { findByText, getByText } = render(
    <FeedScreen
      {...defaultProps}
      myTags={[{ id: 6, name: "Natuur", category: "natuur" }]}
    />
  );

  await findByText("Natuur");
  expect(getByText("Politiek")).toBeTruthy();
  expect(getByText("Sport")).toBeTruthy();
});
