import { render, fireEvent } from "@testing-library/react-native";
import { Image, StyleSheet } from "react-native";

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

test("mode=articles toont titel en lege staat voor artikelen", () => {
  const { getByText } = render(<SavedScreen mode="articles" />);
  expect(getByText("Bewaarde artikelen")).toBeTruthy();
  expect(getByText("Je hebt nog geen artikelen bewaard.")).toBeTruthy();
});

test("mode=memes toont titel en lege staat voor memes", () => {
  const { getByText } = render(<SavedScreen mode="memes" />);
  expect(getByText("Bewaarde memes")).toBeTruthy();
  expect(getByText("Je hebt nog geen memes bewaard.")).toBeTruthy();
});

test("mode=articles rendert alleen artikelen, geen memes", () => {
  const { getByText, queryByLabelText } = render(
    <SavedScreen
      mode="articles"
      savedArticles={[{ id: 1, title: "Bewaard artikel" }]}
      savedMemes={[MEME]}
    />
  );
  expect(getByText("Bewaard artikel")).toBeTruthy();
  expect(queryByLabelText("Open meme: Grappige meme")).toBeNull();
});

test("mode=memes rendert alleen memes, geen artikelen", () => {
  const { queryByText, getByLabelText } = render(
    <SavedScreen
      mode="memes"
      savedArticles={[{ id: 1, title: "Bewaard artikel" }]}
      savedMemes={[MEME]}
    />
  );
  expect(getByLabelText("Open meme: Grappige meme")).toBeTruthy();
  expect(queryByText("Bewaard artikel")).toBeNull();
});

test("meme-thumbnail rendert de afbeelding vullend (geen 0-hoogte)", () => {
  const { UNSAFE_getByType } = render(
    <SavedScreen mode="memes" savedMemes={[MEME]} />
  );

  const image = UNSAFE_getByType(Image);
  expect(image.props.source).toEqual({ uri: "https://x.test/m.jpg" });
  // De afbeelding moet als flow-kind de aspectRatio-container vullen. Met
  // absolute positionering bleef de hoogte 0 en zag de gebruiker lege vakjes.
  const style = StyleSheet.flatten(image.props.style);
  expect(style.width).toBe("100%");
  expect(style.height).toBe("100%");
});

test("tap op meme-thumbnail roept onOpenMeme met storyId aan", () => {
  const onOpenMeme = jest.fn();
  const { getByLabelText } = render(
    <SavedScreen mode="memes" savedMemes={[MEME]} onOpenMeme={onOpenMeme} />
  );

  fireEvent.press(getByLabelText("Open meme: Grappige meme"));
  expect(onOpenMeme).toHaveBeenCalledWith(3);
});
