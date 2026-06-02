import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SearchScreen } from "../../src/screens/SearchScreen";

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

test("rendert 'Populair' sectie zonder zoekquery (geen ReferenceError)", () => {
  const { getByText } = render(<SearchScreen {...defaultProps} />);
  expect(getByText("Populair")).toBeTruthy();
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
    getByPlaceholderText("Zoek verhalen, tags, thema's…"),
    "klimaat"
  );
  expect(getByText("Klimaatverhaal")).toBeTruthy();
  expect(queryByText("Populair")).toBeNull();
});

test("lege zoekresultaten toont geen-resultaten tekst", () => {
  const { getByPlaceholderText, getByText } = render(
    <SearchScreen {...defaultProps} />
  );
  fireEvent.changeText(
    getByPlaceholderText("Zoek verhalen, tags, thema's…"),
    "xyzxyzxyz"
  );
  expect(getByText(/Geen resultaten/)).toBeTruthy();
});

test("klik op populaire tag vult de zoekbalk en verbergt discover-view", () => {
  // "Energie" komt alleen voor als populaire tag — geen dubbele match
  const { getByText, queryByText } = render(<SearchScreen {...defaultProps} />);
  fireEvent.press(getByText("Energie"));
  expect(queryByText("Populair")).toBeNull();
});
