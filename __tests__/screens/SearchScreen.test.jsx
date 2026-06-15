import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SearchScreen } from "../../src/screens/SearchScreen";

jest.mock("../../src/lib/tags", () => ({
  isInterestTag: jest.requireActual("../../src/lib/tags").isInterestTag,
  fetchTags: jest.fn().mockResolvedValue([
    { id: 2, name: "Politiek", category: "politiek" },
    { id: 5, name: "Sport", category: "sport" },
    { id: 6, name: "Natuur", category: "natuur" },
  ]),
}));

jest.mock("../../src/lib/articles", () => ({
  fetchArticles: jest.fn().mockResolvedValue([
    {
      id: 1,
      title: "Klimaatverhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "10:00",
      views: "3k",
      readers: "3k",
      trending: false,
      goodNews: true,
      tags: ["Natuur"],
      body: [],
      reactions: { smile: 10, meh: 5, frown: 2 },
    },
    {
      id: 2,
      title: "Sportverhaal",
      sub: "...",
      img: "",
      date: "1 juni 2026",
      time: "11:00",
      views: "1k",
      readers: "1k",
      trending: false,
      goodNews: false,
      tags: ["Sport"],
      body: [],
      reactions: { smile: 3, meh: 8, frown: 1 },
    },
  ]),
}));

jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));

const defaultProps = {
  onClose: jest.fn(),
  onOpenStory: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("rendert topicfilter zonder populaire tags", async () => {
  const { findByText, queryByText } = render(
    <SearchScreen {...defaultProps} />
  );
  expect(await findByText("Ontdek per thema")).toBeTruthy();
  expect(queryByText("Populair")).toBeNull();
});

test("rendert 'Meest gelezen' sectie zonder zoekquery", async () => {
  const { findByText } = render(<SearchScreen {...defaultProps} />);
  expect(await findByText("Meest gelezen")).toBeTruthy();
});

test("na invoer van query verdwijnt discover-view en verschijnen resultaten", async () => {
  const { getByPlaceholderText, findByText, queryByText } = render(
    <SearchScreen {...defaultProps} />
  );
  await findByText("Meest gelezen");
  fireEvent.changeText(
    getByPlaceholderText("Zoek verhalen, tags, thema's..."),
    "klimaat"
  );
  expect(await findByText("Klimaatverhaal")).toBeTruthy();
  expect(queryByText("Ontdek per thema")).toBeNull();
});

test("lege zoekresultaten toont geen-resultaten tekst", async () => {
  const { getByPlaceholderText, findByText } = render(
    <SearchScreen {...defaultProps} />
  );
  await findByText("Meest gelezen");
  fireEvent.changeText(
    getByPlaceholderText("Zoek verhalen, tags, thema's..."),
    "xyzxyzxyz"
  );
  expect(await findByText(/Geen resultaten/)).toBeTruthy();
});

test("klik op topic selecteert filter en toont gefilterde verhalen", async () => {
  const { getByText, queryByText, findByText } = render(
    <SearchScreen {...defaultProps} />
  );
  fireEvent.press(await findByText("Sport"));
  await waitFor(() => expect(getByText("Gefilterde verhalen")).toBeTruthy());
  expect(getByText("Sportverhaal")).toBeTruthy();
  expect(queryByText("Klimaatverhaal")).toBeNull();
});

test("myTags prop rendert eigen interesses als chip", async () => {
  const { findByText } = render(
    <SearchScreen
      {...defaultProps}
      myTags={[{ id: 6, name: "Natuur", category: "natuur" }]}
    />
  );
  expect(await findByText("Natuur")).toBeTruthy();
});
