import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SearchScreen } from "../../src/screens/SearchScreen";

jest.mock("../../src/lib/tags", () => ({
  fetchTags: jest.fn().mockResolvedValue([
    { id: 2, name: "Politiek", category: "politiek" },
    { id: 5, name: "Sport", category: "sport" },
    { id: 6, name: "Natuur", category: "natuur" },
  ]),
}));

jest.mock("../../src/api/mock", () => ({
  STORIES: [
    {
      id: 1,
      cat: "Klimaat",
      title: "Klimaatverhaal",
      sub: "...",
      img: "",
      date: "1 jun",
      time: "10:00",
      views: "3k",
      readers: 300,
      trending: false,
      goodNews: true,
      tags: [],
      body: [],
      reactions: { smile: 10, meh: 5, frown: 2 },
    },
    {
      id: 2,
      cat: "Sport",
      title: "Sportverhaal",
      sub: "...",
      img: "",
      date: "1 jun",
      time: "11:00",
      views: "1k",
      readers: 100,
      trending: false,
      goodNews: false,
      tags: [],
      body: [],
      reactions: { smile: 3, meh: 8, frown: 1 },
    },
  ],
  MEMES: [],
  CATEGORIES: ["Voor jou", "Klimaat", "Sport"],
}));

jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));

const defaultProps = {
  onClose: jest.fn(),
  onOpenStory: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("rendert topicfilter zonder populaire tags", () => {
  const { getByText, queryByText } = render(<SearchScreen {...defaultProps} />);
  expect(getByText("Ontdek per thema")).toBeTruthy();
  expect(queryByText("Populair")).toBeNull();
});

test("rendert 'Meest gelezen' sectie zonder zoekquery", () => {
  const { getByText } = render(<SearchScreen {...defaultProps} />);
  expect(getByText("Meest gelezen")).toBeTruthy();
});

test("na invoer van query verdwijnt discover-view en verschijnen resultaten", () => {
  const { getByPlaceholderText, getByText, queryByText } = render(
    <SearchScreen {...defaultProps} />
  );
  fireEvent.changeText(
    getByPlaceholderText("Zoek verhalen, tags, thema's..."),
    "klimaat"
  );
  expect(getByText("Klimaatverhaal")).toBeTruthy();
  expect(queryByText("Ontdek per thema")).toBeNull();
});

test("lege zoekresultaten toont geen-resultaten tekst", () => {
  const { getByPlaceholderText, getByText } = render(
    <SearchScreen {...defaultProps} />
  );
  fireEvent.changeText(
    getByPlaceholderText("Zoek verhalen, tags, thema's..."),
    "xyzxyzxyz"
  );
  expect(getByText(/Geen resultaten/)).toBeTruthy();
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
