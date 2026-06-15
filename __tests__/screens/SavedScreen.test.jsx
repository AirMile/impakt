import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";

import { SavedScreen } from "../../src/screens/SavedScreen";

// FeedCard sleept de hele feed-stack mee; voor deze test volstaat een stub.
jest.mock("../../src/screens/FeedScreen", () => {
  const { Text } = require("react-native");
  return {
    FeedCard: ({ story }) => <Text>{story.title}</Text>,
  };
});

const MEME = {
  id: 8,
  storyId: 3,
  img: "https://x.test/m.jpg",
  top: "Grappige meme",
  bot: "",
};

test("toont lege staat zonder bewaarde items", () => {
  const { getByText } = render(<SavedScreen />);
  expect(getByText("Je hebt nog niets bewaard.")).toBeTruthy();
});

test("rendert bewaarde artikelen en memes-sectie", () => {
  const { getByText } = render(
    <SavedScreen
      savedArticles={[{ id: 1, title: "Bewaard artikel" }]}
      savedMemes={[MEME]}
    />
  );
  expect(getByText("Bewaard artikel")).toBeTruthy();
  expect(getByText("Memes")).toBeTruthy();
});

test("tap op meme-thumbnail roept onOpenMeme met storyId aan", () => {
  const onOpenMeme = jest.fn();
  const { getByLabelText } = render(
    <SavedScreen savedMemes={[MEME]} onOpenMeme={onOpenMeme} />
  );

  fireEvent.press(getByLabelText("Open meme: Grappige meme"));
  expect(onOpenMeme).toHaveBeenCalledWith(3);
});
