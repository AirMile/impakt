import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { HappyFeedScreen } from "../../src/screens/HappyFeedScreen";

jest.mock("../../src/lib/tags", () => ({
  fetchTags: jest.fn().mockResolvedValue([
    { id: 2, name: "Politiek", category: "politiek" },
    { id: 3, name: "Buitenland", category: "buitenland" },
    { id: 5, name: "Sport", category: "sport" },
    { id: 6, name: "Natuur", category: "natuur" },
    { id: 8, name: "Kunst", category: "kunst" },
  ]),
}));

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

test("tap op thema filtert feed op tag", async () => {
  const { getByText, queryByText, findByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );
  expect(getByText("Wolf story")).toBeTruthy();
  expect(getByText("Sociaal story")).toBeTruthy();

  fireEvent.press(await findByTestId("happy-topic-Natuur"));

  await waitFor(() => expect(queryByText("Sociaal story")).toBeNull());
  expect(getByText("Wolf story")).toBeTruthy();
});

test("tweede tap op zelfde thema wist filter", async () => {
  const { getByText, queryByText, findByTestId, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  fireEvent.press(await findByTestId("happy-topic-Natuur"));
  await waitFor(() => expect(queryByText("Sociaal story")).toBeNull());

  fireEvent.press(getByTestId("happy-topic-Natuur"));
  await waitFor(() => expect(getByText("Sociaal story")).toBeTruthy());
  expect(getByText("Wolf story")).toBeTruthy();
});

test("meerdere thema's kunnen tegelijk geselecteerd worden", async () => {
  const { getByText, findByTestId, getByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  fireEvent.press(await findByTestId("happy-topic-Natuur"));
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

test("empty-state toont filter-hint bij actief thema zonder matches", async () => {
  const { getByText, findByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  fireEvent.press(await findByTestId("happy-topic-Kunst"));

  await waitFor(() =>
    expect(getByText(/Geen leuk nieuws over Kunst/)).toBeTruthy()
  );
});

test("myTags prop rendert eigen interesses bovenaan", async () => {
  const { findByTestId } = render(
    <HappyFeedScreen
      {...defaultProps}
      myTags={[{ id: 6, name: "Natuur", category: "natuur" }]}
    />
  );

  // Natuur staat in mine — chip moet bestaan
  expect(await findByTestId("happy-topic-Natuur")).toBeTruthy();
});
