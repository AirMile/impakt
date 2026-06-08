import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { HappyFeedScreen } from "../../src/screens/HappyFeedScreen";

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

test("tap op thema filtert feed op tag", () => {
  const { getByText, queryByText, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );
  expect(getByText("Wolf story")).toBeTruthy();
  expect(getByText("Sociaal story")).toBeTruthy();

  fireEvent.press(getByTestId("happy-topic-Natuur"));

  expect(getByText("Wolf story")).toBeTruthy();
  expect(queryByText("Sociaal story")).toBeNull();
});

test("tweede tap op zelfde thema wist filter", () => {
  const { getByText, queryByText, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  fireEvent.press(getByTestId("happy-topic-Natuur"));
  expect(queryByText("Sociaal story")).toBeNull();

  fireEvent.press(getByTestId("happy-topic-Natuur"));
  expect(getByText("Wolf story")).toBeTruthy();
  expect(getByText("Sociaal story")).toBeTruthy();
});

test("meerdere thema's kunnen tegelijk geselecteerd worden", () => {
  const { getByText, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  fireEvent.press(getByTestId("happy-topic-Natuur"));
  fireEvent.press(getByTestId("happy-topic-Buitenland"));

  expect(getByText("Wolf story")).toBeTruthy();
  expect(getByText("Sociaal story")).toBeTruthy();
});

test("EERDER-label verborgen als het de enige sectie is", () => {
  const { getByText, queryByText } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  expect(getByText("Wolf story")).toBeTruthy();
  expect(queryByText("EERDER")).toBeNull();
});

test("empty-state toont filter-hint bij actief thema zonder matches", () => {
  const { getByText, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  fireEvent.press(getByTestId("happy-topic-Kunst"));

  expect(getByText(/Geen leuk nieuws over Kunst/)).toBeTruthy();
});
