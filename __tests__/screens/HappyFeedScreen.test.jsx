import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { HappyFeedScreen } from "../../src/screens/HappyFeedScreen";

// jest.mock wordt gehoist — inline data zodat tests deterministisch zijn.
// 2 happy stories met oude datum (1 Januari 2020) → altijd in 'earlier'-bucket,
// ongeacht wanneer de test draait. Geen "Wetenschap"-tag → test 5 kan lege filter triggeren.
jest.mock("../../src/api/mock", () => ({
  STORIES: [
    {
      id: 1,
      cat: "Klimaat",
      goodNews: true,
      title: "Wolf story",
      sub: "...",
      img: "",
      date: "1 Januari 2020",
      time: "10:00",
      views: "1k",
      readers: 100,
      trending: false,
      tags: ["Natuur", "Goed nieuws"],
      body: [],
      reactions: { smile: 8, meh: 2, frown: 1 },
    },
    {
      id: 2,
      cat: "Wereld",
      goodNews: true,
      title: "Sociaal story",
      sub: "...",
      img: "",
      date: "1 Januari 2020",
      time: "11:00",
      views: "500",
      readers: 50,
      trending: false,
      tags: ["Sociaal", "Goed nieuws"],
      body: [],
      reactions: { smile: 5, meh: 1, frown: 0 },
    },
  ],
}));

jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));

const defaultProps = {
  onOpen: jest.fn(),
  onProfile: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("tap op thema-tegel filtert feed op tag", () => {
  const { getByText, queryByText, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );
  expect(getByText("Wolf story")).toBeTruthy();
  expect(getByText("Sociaal story")).toBeTruthy();

  fireEvent.press(getByTestId("theme-tile-Natuur"));

  expect(getByText("Wolf story")).toBeTruthy();
  expect(queryByText("Sociaal story")).toBeNull();
});

test("tweede tap op zelfde tegel wist filter", () => {
  const { getByText, queryByText, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  fireEvent.press(getByTestId("theme-tile-Natuur"));
  expect(queryByText("Sociaal story")).toBeNull();

  fireEvent.press(getByTestId("theme-tile-Natuur"));
  expect(getByText("Wolf story")).toBeTruthy();
  expect(getByText("Sociaal story")).toBeTruthy();
});

test("actieve tegel krijgt cream border", () => {
  const { getByTestId } = render(<HappyFeedScreen {...defaultProps} />);

  fireEvent.press(getByTestId("theme-tile-Natuur"));

  const tile = getByTestId("theme-tile-Natuur");
  const flat = StyleSheet.flatten(tile.props.style);
  expect(flat.borderWidth).toBe(2.5);
});

test("EERDER-label verborgen als het de enige sectie is", () => {
  const { getByText, queryByText } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  // Beide stories hebben datum "1 Januari 2020" → alle happy stories in earlier-bucket.
  // Met threshold=3 en 2 stories: today(0)→week(0)→earlier(2). Enige sectie is earlier.
  expect(getByText("Wolf story")).toBeTruthy();
  expect(queryByText("EERDER")).toBeNull();
});

test("empty-state toont filter-hint bij actief thema zonder matches", () => {
  const { getByText, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  // "Wetenschap" komt niet voor als tag in de mock → lege filterresultaat.
  fireEvent.press(getByTestId("theme-tile-Wetenschap"));

  expect(getByText(/Geen leuk nieuws over Wetenschap/)).toBeTruthy();
});
