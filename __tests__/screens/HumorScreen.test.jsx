import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { HumorScreen } from "../../src/screens/HumorScreen";

// jest.mock wordt gehoist boven variabele-declaraties, dus data moet inline staan
jest.mock("../../src/api/mock", () => ({
  MEMES: [
    {
      id: "m1",
      storyId: 101,
      img: "",
      top: "Top tekst",
      bot: "Bot tekst",
      author: "auteur",
      authorName: "Auteur Naam",
      cat: "Klimaat",
      reactions: { smile: 5, meh: 2, frown: 1 },
      likes: 10,
      comments: 3,
      shares: 2,
      storyHeadline: "Klimaat story",
      storyTeaser: "...",
      storySource: "bron",
    },
    {
      id: "m2",
      storyId: 102,
      img: "",
      top: "Tweede top",
      bot: "Tweede bot",
      author: "auteur2",
      authorName: "Auteur Twee",
      cat: "Sport",
      reactions: { smile: 3, meh: 1, frown: 0 },
      likes: 5,
      comments: 1,
      shares: 0,
      storyHeadline: "Sport story",
      storyTeaser: "...",
      storySource: "bron2",
    },
  ],
  STORIES: [
    {
      id: 101,
      cat: "Klimaat",
      title: "Klimaat story",
      reactions: { smile: 5, meh: 2, frown: 1 },
      body: [],
      tags: [],
    },
    {
      id: 102,
      cat: "Sport",
      title: "Sport story",
      reactions: { smile: 3, meh: 1, frown: 0 },
      body: [],
      tags: [],
    },
  ],
  CATEGORIES: ["Voor jou", "Klimaat", "Sport"],
}));

jest.mock("../../src/lib/share", () => ({ shareMeme: jest.fn() }));

const defaultProps = {
  onNav: jest.fn(),
  onSearch: jest.fn(),
  onProfile: jest.fn(),
  activeTab: "humor",
  onOpenStory: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("roept onInitialStoryConsumed aan na mount wanneer initialStoryId gegeven", async () => {
  const onConsumed = jest.fn();
  render(
    <HumorScreen
      {...defaultProps}
      initialStoryId={102}
      onInitialStoryConsumed={onConsumed}
    />
  );
  await waitFor(() => expect(onConsumed).toHaveBeenCalledTimes(1));
});

test("roept onInitialStoryConsumed NIET aan zonder initialStoryId", async () => {
  const onConsumed = jest.fn();
  render(<HumorScreen {...defaultProps} onInitialStoryConsumed={onConsumed} />);
  await waitFor(() => {});
  expect(onConsumed).not.toHaveBeenCalled();
});
