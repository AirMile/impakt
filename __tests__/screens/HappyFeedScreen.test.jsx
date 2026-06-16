import React from "react";
import {
  render as rtlRender,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { HappyFeedScreen } from "../../src/screens/HappyFeedScreen";
import { ReactionsProvider } from "../../src/hooks/useArticleReactions";

// Schermen draaien in productie altijd binnen de ReactionsProvider. We spiegelen
// token/onRequireAuth van het gerenderde scherm zodat de gedeelde reactie-store
// dezelfde auth-context heeft als de schermen zelf.
function render(ui, options) {
  return rtlRender(
    <ReactionsProvider
      token={ui.props?.token}
      onRequireAuth={ui.props?.onRequireAuth}
    >
      {ui}
    </ReactionsProvider>,
    options
  );
}

jest.mock("../../src/lib/tags", () => ({
  isInterestTag: jest.requireActual("../../src/lib/tags").isInterestTag,
  fetchTags: jest.fn().mockResolvedValue([
    { id: 18, name: "Goed nieuws", category: "flag" },
    { id: 2, name: "Politiek", category: "navigation" },
    { id: 3, name: "Buitenland", category: "topic" },
    { id: 5, name: "Sport", category: "navigation" },
    { id: 6, name: "Natuur", category: "topic" },
    { id: 8, name: "Kunst", category: "topic" },
  ]),
}));

jest.mock("../../src/lib/articles", () => ({
  fetchHappyFeed: jest.fn().mockResolvedValue([
    {
      id: 1,
      goodNews: true,
      title: "Wolf story",
      sub: "...",
      img: "",
      date: "1 januari 2020",
      time: "10:00",
      views: "1k",
      readers: "1k",
      trending: false,
      tags: [{ id: 6, name: "Natuur", category: "topic" }],
      body: [],
      reactions: { smile: 8, meh: 2, frown: 1 },
    },
    {
      id: 2,
      goodNews: true,
      title: "Sociaal story",
      sub: "...",
      img: "",
      date: "1 januari 2020",
      time: "11:00",
      views: "500",
      readers: "500",
      trending: false,
      tags: [{ id: 3, name: "Buitenland", category: "topic" }],
      body: [],
      reactions: { smile: 5, meh: 1, frown: 0 },
    },
  ]),
}));

jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));

const defaultProps = {
  onOpen: jest.fn(),
  onProfile: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("tap op thema filtert feed op tag-naam", async () => {
  const { getByText, queryByText, findByText, findByTestId } = render(
    <HappyFeedScreen {...defaultProps} />
  );
  await findByText("Wolf story");
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

test("EERDER-label verborgen als het de enige sectie is", async () => {
  const { findByText, queryByText } = render(
    <HappyFeedScreen {...defaultProps} />
  );

  await findByText("Wolf story");
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
      myTags={[{ id: 6, name: "Natuur", category: "topic" }]}
    />
  );

  expect(await findByTestId("happy-topic-Natuur")).toBeTruthy();
});
